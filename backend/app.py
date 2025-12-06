import os
import uuid
import time
import threading
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import tempfile
import base64
import shutil
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', '/tmp/claude-music-studio')
MAX_DURATION = int(os.environ.get('MAX_DURATION', 600))  # 10 minutes
MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', 50 * 1024 * 1024))  # 50MB
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'm4a', 'mp4', 'webm', 'flac'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store for extracted files
extracted_files = {}

def cleanup_old_files():
    """Clean up files older than 1 hour"""
    try:
        cutoff = datetime.now() - timedelta(hours=1)
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                creation_time = datetime.fromtimestamp(os.path.getctime(file_path))
                if creation_time < cutoff:
                    os.remove(file_path)
        
        # Clean up extracted_files dict
        to_remove = []
        for file_id, data in extracted_files.items():
            if data.get('timestamp', datetime.now()) < cutoff:
                to_remove.append(file_id)
        for file_id in to_remove:
            del extracted_files[file_id]
            
    except Exception as e:
        print(f"Cleanup error: {e}")

# Schedule cleanup every hour
def schedule_cleanup():
    cleanup_old_files()
    timer = threading.Timer(3600, schedule_cleanup)
    timer.daemon = True
    timer.start()

schedule_cleanup()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_video_info(url):
    """Get video metadata without downloading"""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            return {
                'success': True,
                'title': info.get('title', 'Unknown Title'),
                'duration': info.get('duration', 0),
                'uploader': info.get('uploader', 'Unknown'),
                'thumbnail': info.get('thumbnail', ''),
                'description': (info.get('description', '') or '')[:500],
                'platform': info.get('extractor', 'unknown').lower()
            }
    except Exception as e:
        return {'error': str(e)}

def extract_audio_from_url(url, format='mp3'):
    """Extract audio from URL using yt-dlp"""
    file_id = str(uuid.uuid4())
    output_path = os.path.join(UPLOAD_FOLDER, f"{file_id}.{format}")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': format,
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Check duration
            duration = info.get('duration', 0)
            if duration and duration > MAX_DURATION:
                return {'error': f'Video too long ({duration}s). Maximum allowed: {MAX_DURATION}s', 'duration': duration}
            
            # Download and extract
            ydl.download([url])
            
            # Find the actual output file (yt-dlp may change the extension)
            actual_file = None
            base_name = file_id
            for ext in ['mp3', 'wav', 'ogg', 'm4a', 'webm']:
                potential_file = os.path.join(UPLOAD_FOLDER, f"{base_name}.{ext}")
                if os.path.exists(potential_file):
                    actual_file = potential_file
                    break
            
            if not actual_file or not os.path.exists(actual_file):
                return {'error': 'Failed to extract audio file'}
            
            file_size = os.path.getsize(actual_file)
            if file_size > MAX_FILE_SIZE:
                os.remove(actual_file)
                return {'error': f'File too large ({file_size} bytes). Maximum: {MAX_FILE_SIZE} bytes'}
            
            # Store file info
            extracted_files[file_id] = {
                'filepath': actual_file,
                'filename': f"{info.get('title', 'extracted_audio')}.{format}",
                'title': info.get('title', 'Unknown Title'),
                'duration': duration,
                'file_size': file_size,
                'timestamp': datetime.now()
            }
            
            return {
                'success': True,
                'file_id': file_id,
                'filename': extracted_files[file_id]['filename'],
                'duration': duration,
                'title': info.get('title', 'Unknown Title'),
                'file_size': file_size,
                'download_url': f'/api/download/{file_id}',
                'base64_url': f'/api/base64/{file_id}'
            }
            
    except Exception as e:
        return {'error': str(e)}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Claude Music AI Studio - Audio Extractor',
        'version': '1.0.0'
    })

@app.route('/api/extract-audio', methods=['POST'])
def extract_audio():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        url = data['url']
        format = data.get('format', 'mp3')
        
        result = extract_audio_from_url(url, format)
        
        if 'error' in result:
            status_code = 413 if 'too large' in result['error'] or 'too long' in result['error'] else 400
            return jsonify(result), status_code
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video-info', methods=['POST'])
def video_info():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        result = get_video_info(data['url'])
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/base64/<file_id>', methods=['GET'])
def get_base64(file_id):
    try:
        if file_id not in extracted_files:
            return jsonify({'error': 'File not found'}), 404
        
        file_info = extracted_files[file_id]
        filepath = file_info['filepath']
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File no longer exists'}), 404
        
        # Read and encode file
        with open(filepath, 'rb') as f:
            file_data = f.read()
        
        base64_data = base64.b64encode(file_data).decode('utf-8')
        
        # Determine media type based on file extension
        ext = os.path.splitext(filepath)[1].lower()
        media_type_map = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.flac': 'audio/flac'
        }
        media_type = media_type_map.get(ext, 'audio/mpeg')
        
        return jsonify({
            'success': True,
            'base64': base64_data,
            'media_type': media_type,
            'file_size': len(file_data)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_file(file_id):
    try:
        if file_id not in extracted_files:
            return jsonify({'error': 'File not found'}), 404
        
        file_info = extracted_files[file_id]
        filepath = file_info['filepath']
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File no longer exists'}), 404
        
        return send_file(
            filepath,
            as_attachment=True,
            download_name=file_info['filename']
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/supported-sites', methods=['GET'])
def supported_sites():
    # Get a sample of supported extractors
    extractors = []
    try:
        from yt_dlp.extractor import gen_extractor_classes
        for ie_class in gen_extractor_classes():
            if hasattr(ie_class, 'IE_NAME') and ie_class.IE_NAME:
                extractors.append(ie_class.IE_NAME)
        
        # Return popular ones
        popular_sites = [
            'youtube', 'facebook', 'instagram', 'tiktok', 'twitter',
            'soundcloud', 'vimeo', 'twitch', 'dailymotion', 'reddit'
        ]
        
        supported = [site for site in popular_sites if any(site in ext for ext in extractors)]
        
    except Exception:
        supported = ['youtube', 'facebook', 'instagram', 'tiktok', 'soundcloud']
    
    return jsonify({
        'supported_sites': supported,
        'total_extractors': len(extractors) if extractors else 1000
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)