import React, { useState } from 'react'
import { Link, Download, AlertCircle, ExternalLink, Clock, User } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Badge from './ui/Badge'

const UrlExtractor = ({ 
  urlInput, 
  setUrlInput, 
  videoInfo, 
  setVideoInfo, 
  extractedAudio, 
  setExtractedAudio, 
  isExtracting, 
  setIsExtracting,
  API_BASE_URL,
  onAudioExtracted 
}) => {
  const [error, setError] = useState('')

  const getSupportedSites = () => {
    return ['YouTube', 'Facebook', 'Instagram', 'TikTok', 'Twitter', 'SoundCloud', 'Vimeo', 'Reddit']
  }

  const fetchVideoInfo = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a URL')
      return
    }

    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/video-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      })

      const data = await response.json()
      if (data.success) {
        setVideoInfo(data)
      } else {
        setError(data.error || 'Failed to fetch video information')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    }
  }

  const extractAudio = async () => {
    setIsExtracting(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, format: 'mp3' })
      })

      const data = await response.json()
      
      if (data.success) {
        // Get base64 data for Claude API
        const base64Response = await fetch(`${API_BASE_URL}${data.base64_url}`)
        const base64Data = await base64Response.json()
        
        if (base64Data.success) {
          setExtractedAudio({
            ...data,
            base64: base64Data.base64,
            media_type: base64Data.media_type
          })
          onAudioExtracted({
            ...data,
            base64: base64Data.base64,
            media_type: base64Data.media_type
          })
        } else {
          setError('Failed to prepare audio for analysis')
        }
      } else {
        setError(data.error || 'Failed to extract audio')
      }
    } catch (err) {
      setError('Network error during extraction')
    } finally {
      setIsExtracting(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Supported Sites Info */}
      <div className="text-center">
        <p className="text-sm text-text-muted mb-2">Supported platforms:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {getSupportedSites().map(site => (
            <Badge key={site} variant="secondary" size="sm">
              {site}
            </Badge>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div className="flex gap-3">
        <Input
          placeholder="Paste video/audio URL here..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={fetchVideoInfo} disabled={!urlInput.trim()}>
          Preview
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Video Info Card */}
      {videoInfo && (
        <Card>
          <Card.Content>
            <div className="flex gap-4">
              {videoInfo.thumbnail && (
                <img
                  src={videoInfo.thumbnail}
                  alt="Video thumbnail"
                  className="w-24 h-18 object-cover rounded-lg"
                />
              )}
              
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-text-dark line-clamp-2">
                  {videoInfo.title}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {videoInfo.uploader}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDuration(videoInfo.duration)}
                  </div>
                  <Badge variant="primary" size="sm">
                    {videoInfo.platform}
                  </Badge>
                </div>
                
                {videoInfo.description && (
                  <p className="text-sm text-text-muted line-clamp-2">
                    {videoInfo.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(urlInput, '_blank')}
              >
                <ExternalLink size={16} className="mr-1" />
                View Original
              </Button>
              
              <Button 
                onClick={extractAudio}
                disabled={isExtracting || videoInfo.duration > 600}
              >
                <Download size={16} className="mr-2" />
                {isExtracting ? 'Extracting...' : 'Extract Audio'}
              </Button>
            </div>

            {videoInfo.duration > 600 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Video duration ({formatDuration(videoInfo.duration)}) exceeds 10-minute limit
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Extracted Audio Success */}
      {extractedAudio && (
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-text-dark">Audio Extracted Successfully</p>
                  <p className="text-sm text-text-muted">
                    {extractedAudio.title} • {(extractedAudio.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${API_BASE_URL}${extractedAudio.download_url}`, '_blank')}
              >
                Download
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default UrlExtractor