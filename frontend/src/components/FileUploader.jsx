import React, { useCallback, useState } from 'react'
import { Upload, File, AlertCircle } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import AudioPlayer from './AudioPlayer'

const FileUploader = ({ onFileSelect, file, filePreview, setFilePreview }) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError('')

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileInput = useCallback((e) => {
    setError('')
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'video/mp4', 'audio/flac']
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.flac']
    
    const isValidType = allowedTypes.includes(selectedFile.type) || 
                       allowedExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      setError('Please select a valid audio file (MP3, WAV, OGG, M4A, MP4, FLAC)')
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile)
    setFilePreview(previewUrl)
    onFileSelect(selectedFile)
  }

  const removeFile = () => {
    onFileSelect(null)
    setFilePreview(null)
    setError('')
    // Reset file input
    const fileInput = document.getElementById('fileInput')
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="space-y-4">
      {!file && (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${dragActive 
              ? 'border-sky-blue bg-sky-blue/5' 
              : 'border-gray-300 hover:border-sky-blue'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="fileInput"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept=".mp3,.wav,.ogg,.m4a,.mp4,.flac,audio/*,video/mp4"
          />
          
          <Upload className="mx-auto h-12 w-12 text-sky-blue mb-4" />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-text-dark">
              Drop your audio file here or click to browse
            </p>
            <p className="text-text-muted">
              Supports MP3, WAV, OGG, M4A, MP4 • Max 10MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-sky-blue" />
                <div>
                  <p className="font-medium text-text-dark">{file.name}</p>
                  <p className="text-sm text-text-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={removeFile}>
                Remove
              </Button>
            </div>
            
            {filePreview && (
              <div className="mt-4">
                <AudioPlayer src={filePreview} />
              </div>
            )}
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default FileUploader