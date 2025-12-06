import React, { useState } from 'react'
import { Music, Upload, Link, Loader, AlertCircle, Sparkles } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'
import FileUploader from './FileUploader'
import UrlExtractor from './UrlExtractor'
import TechnicalAnalysis from './TechnicalAnalysis'
import CreativeReport from './CreativeReport'
import SunoPromptOutput from './SunoPromptOutput'

const ClaudeMusicStudio = () => {
  // Configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050'
  
  // Input states
  const [inputMode, setInputMode] = useState('file')
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)

  // Processing states
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [extractedAudio, setExtractedAudio] = useState(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Results states
  const [technicalData, setTechnicalData] = useState(null)
  const [creativeReport, setCreativeReport] = useState(null)
  const [sunoPrompt, setSunoPrompt] = useState(null)
  const [error, setError] = useState(null)

  // UI states
  const [copied, setCopied] = useState({ style: false, lyrics: false, excluded: false, prompt: false })
  const [expandedSections, setExpandedSections] = useState({ technical: true, creative: true, suno: true })

  // Claude API key - in production, this should come from environment variables
  const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || ''

  const resetState = () => {
    setFile(null)
    setFilePreview(null)
    setUrlInput('')
    setVideoInfo(null)
    setExtractedAudio(null)
    setTechnicalData(null)
    setCreativeReport(null)
    setSunoPrompt(null)
    setError(null)
    setCurrentStep('')
    setAnalysisProgress(0)
  }

  const onAudioExtracted = (audioData) => {
    setExtractedAudio(audioData)
  }

  const analyzeAudio = async () => {
    if (!CLAUDE_API_KEY) {
      setError('Claude API key is required. Please set VITE_CLAUDE_API_KEY environment variable.')
      return
    }

    // Determine audio source
    let audioBase64, mediaType
    
    if (inputMode === 'file' && file) {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        audioBase64 = e.target.result.split(',')[1] // Remove data:audio/... prefix
        mediaType = file.type || 'audio/mpeg'
        await performAnalysis(audioBase64, mediaType)
      }
      reader.readAsDataURL(file)
      return
    } else if (inputMode === 'url' && extractedAudio) {
      audioBase64 = extractedAudio.base64
      mediaType = extractedAudio.media_type
      await performAnalysis(audioBase64, mediaType)
    } else {
      setError('No audio source available for analysis')
      return
    }
  }

  const performAnalysis = async (base64Data, mediaType) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // Pass 1: Technical Analysis
      setCurrentStep('Analyzing technical aspects...')
      setAnalysisProgress(20)
      
      const technicalResult = await callClaudeAPI(base64Data, mediaType, getTechnicalPrompt())
      
      if (technicalResult.error) {
        throw new Error(technicalResult.error)
      }
      
      const technical = JSON.parse(technicalResult)
      setTechnicalData(technical)
      setAnalysisProgress(40)

      // Pass 2: Creative Interpretation
      setCurrentStep('Generating creative interpretation...')
      const creativeResult = await callClaudeAPI(null, null, getCreativePrompt(technical))
      setCreativeReport(creativeResult)
      setAnalysisProgress(70)

      // Pass 3: SunoAI Prompt Generation
      setCurrentStep('Creating SunoAI v6.3 prompt...')
      const sunoResult = await callClaudeAPI(null, null, getSunoPrompt(technical))
      setSunoPrompt(sunoResult)
      setAnalysisProgress(100)
      
      setCurrentStep('Analysis complete!')
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setCurrentStep('')
    }
  }

  const callClaudeAPI = async (base64Data, mediaType, promptText) => {
    const messages = []
    
    if (base64Data && mediaType) {
      // Audio analysis
      messages.push({
        role: "user",
        content: [
          {
            type: "audio",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data
            }
          },
          {
            type: "text",
            text: promptText
          }
        ]
      })
    } else {
      // Text-only prompt
      messages.push({
        role: "user",
        content: promptText
      })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2500,
        messages: messages
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  const getTechnicalPrompt = () => {
    return `You are a professional music analyst and audio engineer. Analyze this audio track and return ONLY a valid JSON object with the following structure. Be as accurate as possible based on what you hear.

{
  "bpm": <number - estimated beats per minute>,
  "key": "<string - musical key, e.g., 'C Major', 'A Minor', 'F# Major'>",
  "timeSignature": "<string - e.g., '4/4', '3/4', '6/8'>",
  "duration": "<string - approximate duration>",
  "genre": "<string - primary genre>",
  "subGenres": ["<array of related sub-genres>"],
  "mood": ["<array of 3-5 mood descriptors>"],
  "energy": <number 1-10>,
  "vocalStyle": "<description of vocal characteristics if present, or 'Instrumental' if none>",
  "instruments": [
    {
      "name": "<instrument name>",
      "role": "<lead/rhythm/bass/percussion/atmospheric>",
      "characteristics": "<brief description of how it sounds in this track>",
      "prominence": <number 1-10>
    }
  ],
  "productionElements": {
    "mixing": "<description of mix characteristics>",
    "effects": ["<list of notable effects used>"],
    "soundDesign": "<description of overall sound design approach>"
  },
  "structure": {
    "sections": ["<list of identified sections like intro, verse, chorus, bridge, outro>"],
    "arrangement": "<brief description of arrangement>",
    "dynamics": "<description of dynamic changes throughout>"
  },
  "hookElements": ["<list of catchy or memorable elements>"],
  "similarArtists": ["<2-3 artists with similar sound>"]
}

Return ONLY the JSON object, no additional text or markdown formatting.`
  }

  const getCreativePrompt = (technicalData) => {
    return `You are a creative music journalist and sound designer. Based on this technical analysis, write a rich creative report:

TECHNICAL DATA:
${JSON.stringify(technicalData, null, 2)}

Write these sections:

## 🎵 Track Overview
2-3 compelling sentences about the track's character.

## 🎨 Sonic Palette
Describe the "color" and texture. What images does the sound evoke?

## 🔊 Production Deep Dive
Analyze production choices, mixing, and sound design.

## 📐 Structural Blueprint
Describe arrangement and key moments.

## ✨ The Vibe
Capture the emotional journey. Who listens to this? When?

Be specific and vivid, not generic.`
  }

  const getSunoPrompt = (technicalData) => {
    return `You are an expert music producer creating prompts for SunoAI using the Master Prompt v6.3 format.

Based on this analysis:
${JSON.stringify(technicalData, null, 2)}

Generate a COMPLETE SunoAI prompt package following these EXACT specifications:

---

## 1. TITLE
A creative, evocative title for a song in this style (NOT the original song title).

## 2. STYLE BLOCK (950-1000 characters, ONE paragraph)
Create ONE paragraph describing musical style only, hitting ALL these criteria:
- Core Hook Anchor: imagery that "latches in one listen"
- Chord & Harmony: poetic directives in brackets like [soft minor descent in verse], [suspended lift in pre-chorus]
- Groove & Rhythm: kinetic verbs, pocket, syncopation
- Vocal Delivery: breathy edges, velvet smoke, crisp lift
- Production & Texture: shimmering basslines, synth lattice, warm pads
- Dynamics & Arc: tension-release, swells, crescendos
- Originality: one defining sonic color
- Replay quality: must "beg rewind"

NO lyrics in style block. Music description ONLY.

## 3. EXCLUDED STYLES BLOCK (950-1000 characters, ONE paragraph)
List everything the song must AVOID. Be specific about:
- Delivery styles to avoid
- Production elements to exclude
- Tones and vibes that don't fit
- Genre drifts to prevent

## 4. STRUCTURAL BRACKET TEMPLATE
Provide a clean song structure with:
- [SectionName Vocalist: performance description]
- Parentheses ONLY for ad-libs, backing vocals, echoes
- Include [Instrumental Solo Intro], [Instrumental Solo Mid], [Instrumental Solo Outro]

Example format:
[Intro Female: emotional, soft rising tone]
oooh rising gently
(yeah…)

[Verse 1 Male: fragile delivery, breathy edges]
Sample lyric line here
Another line
(oh)

[Chorus Both: open chest voice, soaring]
Hook line here
(keep… keep…)

Provide 2-3 verses, chorus, bridge, and outros with placeholder lyrics that match the mood.

---

Format your response with clear headers for each section. The Style and Excluded blocks MUST be 950-1000 characters each.`
  }

  const isReadyToAnalyze = () => {
    if (inputMode === 'file') {
      return file !== null
    } else if (inputMode === 'url') {
      return extractedAudio !== null
    }
    return false
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-10 w-10 text-deep-indigo" />
            <h1 className="text-4xl font-bold text-text-dark">Claude Music AI Studio</h1>
          </div>
          <p className="text-lg text-text-muted mb-2">
            Analyze any audio → Generate SunoAI prompts (v6.3 format)
          </p>
          <p className="text-sm text-text-muted">
            by <span className="font-semibold text-deep-indigo">Obai Sukar</span> • 
            <span className="font-semibold text-sky-blue ml-1">SS Media Productions</span>
          </p>
        </div>

        {/* Input Mode Toggle */}
        <Card className="mb-6">
          <Card.Content>
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                    inputMode === 'file' 
                      ? 'bg-deep-indigo text-white' 
                      : 'text-text-muted hover:text-text-dark'
                  }`}
                  onClick={() => {
                    setInputMode('file')
                    resetState()
                  }}
                >
                  <Upload size={18} />
                  Upload File
                </button>
                <button
                  className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                    inputMode === 'url' 
                      ? 'bg-deep-indigo text-white' 
                      : 'text-text-muted hover:text-text-dark'
                  }`}
                  onClick={() => {
                    setInputMode('url')
                    resetState()
                  }}
                >
                  <Link size={18} />
                  From URL
                </button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <Card.Content>
            {inputMode === 'file' ? (
              <FileUploader
                onFileSelect={setFile}
                file={file}
                filePreview={filePreview}
                setFilePreview={setFilePreview}
              />
            ) : (
              <UrlExtractor
                urlInput={urlInput}
                setUrlInput={setUrlInput}
                videoInfo={videoInfo}
                setVideoInfo={setVideoInfo}
                extractedAudio={extractedAudio}
                setExtractedAudio={setExtractedAudio}
                isExtracting={isExtracting}
                setIsExtracting={setIsExtracting}
                API_BASE_URL={API_BASE_URL}
                onAudioExtracted={onAudioExtracted}
              />
            )}
          </Card.Content>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200">
            <Card.Content>
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Analysis Button */}
        <div className="text-center mb-8">
          <Button
            size="xl"
            onClick={analyzeAudio}
            disabled={!isReadyToAnalyze() || isAnalyzing}
            className="w-full max-w-md"
          >
            {isAnalyzing ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze & Generate SunoAI Prompt
              </>
            )}
          </Button>
          
          {isAnalyzing && (
            <div className="mt-4 max-w-md mx-auto">
              <ProgressBar value={analysisProgress} max={100} showPercentage />
              {currentStep && (
                <p className="text-sm text-text-muted mt-2">{currentStep}</p>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {technicalData && (
            <TechnicalAnalysis
              data={technicalData}
              isExpanded={expandedSections.technical}
              setIsExpanded={(expanded) => setExpandedSections(prev => ({ ...prev, technical: expanded }))}
            />
          )}

          {creativeReport && (
            <CreativeReport
              report={creativeReport}
              isExpanded={expandedSections.creative}
              setIsExpanded={(expanded) => setExpandedSections(prev => ({ ...prev, creative: expanded }))}
            />
          )}

          {sunoPrompt && (
            <SunoPromptOutput
              prompt={sunoPrompt}
              isExpanded={expandedSections.suno}
              setIsExpanded={(expanded) => setExpandedSections(prev => ({ ...prev, suno: expanded }))}
              copied={copied}
              setCopied={setCopied}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-text-muted mb-2">
            Powered by <span className="font-semibold text-deep-indigo">Claude AI (Anthropic)</span> • 
            <span className="font-semibold text-sky-blue ml-1">SunoAI Prompt v6.3 Format</span>
          </p>
          <p className="text-sm text-text-muted">
            Built with ❤️ by <span className="font-semibold">Obai Sukar</span> • 
            <span className="font-semibold ml-1">SS Media Productions</span> © 2025
          </p>
        </footer>
      </div>
    </div>
  )
}

export default ClaudeMusicStudio