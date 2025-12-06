# Claude Music AI Studio

A full-stack web application that analyzes audio files and URLs to generate SunoAI-ready prompts using Claude AI's advanced audio analysis capabilities.

## Features

- **Audio Input**: Upload files (MP3, WAV, OGG, M4A, MP4) or extract from URLs (YouTube, Facebook, Instagram, TikTok, etc.)
- **3-Pass AI Analysis**:
  1. Technical Analysis (BPM, Key, Instruments, Production)
  2. Creative Interpretation Report
  3. SunoAI v6.3 Prompt Generation
- **Real-time Audio Player**: Preview uploaded files with custom player
- **Comprehensive Results**: Collapsible sections with copy-to-clipboard functionality

## Architecture

```
Frontend (React + Vite + Tailwind) ↔ Backend (Flask + yt-dlp) ↔ Claude API (Anthropic)
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Claude API key from Anthropic

### Environment Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd claude-music-studio
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Add your Claude API key to `.env`:
```bash
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

### Option 1: Docker Compose (Recommended)

```bash
# Build and run all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Access the application at: http://localhost:3000

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Backend (Port 5050)

- `GET /health` - Health check
- `POST /api/extract-audio` - Extract audio from URL
- `POST /api/video-info` - Get video metadata
- `GET /api/base64/{file_id}` - Get audio as base64
- `GET /api/download/{file_id}` - Download extracted audio
- `GET /api/supported-sites` - List supported platforms

### Usage Flow

1. **Upload File** or **Enter URL**
2. **Preview** (for URLs) to see video info
3. **Extract Audio** (for URLs) or direct upload
4. **Analyze & Generate** - Runs 3-pass Claude AI analysis
5. **View Results** in collapsible sections
6. **Copy Prompts** to use in SunoAI

## SunoAI v6.3 Format

The generated prompts follow the exact Master Prompt v6.3 specification:

- **Title**: Creative song title
- **Style Block**: 950-1000 character musical style description
- **Excluded Styles**: 950-1000 character exclusion list
- **Structural Template**: Complete song structure with bracket notation

## Configuration

### File Limits
- Max file size: 10MB (frontend) / 50MB (backend)
- Max duration: 10 minutes
- Supported formats: MP3, WAV, OGG, M4A, MP4, FLAC

### Supported Platforms
- YouTube, Facebook, Instagram, TikTok
- Twitter, SoundCloud, Vimeo, Reddit
- 1000+ sites via yt-dlp

## Deployment

### Production Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Server Deployment

1. **Backend**:
```bash
cd backend
gunicorn --bind 0.0.0.0:5050 --workers 2 --timeout 120 app:app
```

2. **Frontend**:
```bash
cd frontend
npm run build
# Serve dist/ with nginx or apache
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/claude-music-studio;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5050;
        proxy_set_header Host $host;
        client_max_body_size 50M;
        proxy_read_timeout 120s;
    }
}
```

## Development

### Project Structure

```
claude-music-studio/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .env               # Backend environment
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ClaudeMusicStudio.jsx  # Main component
│   │   │   ├── FileUploader.jsx       # File upload handling
│   │   │   ├── UrlExtractor.jsx       # URL extraction
│   │   │   ├── AudioPlayer.jsx        # Audio preview
│   │   │   ├── TechnicalAnalysis.jsx  # Technical results
│   │   │   ├── CreativeReport.jsx     # Creative analysis
│   │   │   ├── SunoPromptOutput.jsx   # SunoAI prompt display
│   │   │   └── ui/                    # UI components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── Dockerfile          # Frontend container
│
├── docker-compose.yml      # Docker services
├── .env.example           # Environment template
└── README.md              # This file
```

### Brand Colors

- **Deep Indigo**: #292663
- **Sky Blue**: #00AEEF
- **Light Background**: #f8f9fc
- **Card Background**: #ffffff

## Testing

### Backend Tests

```bash
cd backend
# Test health endpoint
curl http://localhost:5050/health

# Test YouTube extraction
curl -X POST http://localhost:5050/api/extract-audio \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=VIDEO_ID"}'
```

### Frontend Tests

1. Upload a sample audio file
2. Test URL extraction with various platforms
3. Verify Claude API integration
4. Check SunoAI prompt formatting

## Troubleshooting

### Common Issues

1. **"Claude API key is required"**
   - Add `VITE_CLAUDE_API_KEY` to your `.env` file

2. **"Network error during extraction"**
   - Check if backend is running on port 5050
   - Verify URL is accessible and public

3. **"Video too long"**
   - Maximum duration is 10 minutes
   - Use shorter clips or edit the video

4. **Docker build fails**
   - Ensure Docker has sufficient memory (4GB+)
   - Check for port conflicts (3000, 5050)

### Support

For issues and feedback, please report at: [GitHub Issues](https://github.com/your-repo/issues)

## Credits

- **Author**: Obai Sukar
- **Organization**: SS Media Productions
- **AI**: Claude AI by Anthropic
- **Audio Extraction**: yt-dlp
- **Target Platform**: SunoAI v6.3

## License

© 2025 SS Media Productions. All rights reserved.