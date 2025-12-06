import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'

const SunoPromptOutput = ({ prompt, isExpanded, setIsExpanded, copied, setCopied }) => {
  if (!prompt) return null

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(prev => ({ ...prev, [type]: true }))
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Parse the prompt to extract sections
  const parsePrompt = (promptText) => {
    const sections = {
      title: '',
      styleBlock: '',
      excludedBlock: '',
      structure: ''
    }

    if (!promptText) return sections

    const lines = promptText.split('\n')
    let currentSection = ''
    let currentContent = []

    for (const line of lines) {
      const cleanLine = line.trim()
      
      if (cleanLine.startsWith('## 1. TITLE') || cleanLine.toLowerCase().includes('title')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim()
        }
        currentSection = 'title'
        currentContent = []
      } else if (cleanLine.startsWith('## 2. STYLE BLOCK') || cleanLine.toLowerCase().includes('style block')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim()
        }
        currentSection = 'styleBlock'
        currentContent = []
      } else if (cleanLine.startsWith('## 3. EXCLUDED') || cleanLine.toLowerCase().includes('excluded')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim()
        }
        currentSection = 'excludedBlock'
        currentContent = []
      } else if (cleanLine.startsWith('## 4. STRUCTURAL') || cleanLine.toLowerCase().includes('structural')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim()
        }
        currentSection = 'structure'
        currentContent = []
      } else if (cleanLine && currentSection) {
        currentContent.push(line)
      }
    }

    // Handle the last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim()
    }

    return sections
  }

  const sections = parsePrompt(prompt)
  
  const getCharCount = (text) => text ? text.length : 0

  return (
    <Card className="overflow-hidden">
      <Card.Header 
        className="cursor-pointer bg-gradient-to-r from-deep-indigo via-purple-600 to-deep-indigo text-white"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <Card.Title className="text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            SunoAI v6.3 Prompt
          </Card.Title>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </Card.Header>

      {isExpanded && (
        <Card.Content className="space-y-6">
          {/* Quick Copy Buttons */}
          <div className="flex flex-wrap gap-2 p-4 bg-deep-indigo/5 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(sections.styleBlock, 'style')}
              disabled={!sections.styleBlock}
            >
              {copied.style ? <Check size={16} /> : <Copy size={16} />}
              <span className="ml-1">
                {copied.style ? 'Copied!' : 'Copy Style Block'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(sections.excludedBlock, 'excluded')}
              disabled={!sections.excludedBlock}
            >
              {copied.excluded ? <Check size={16} /> : <Copy size={16} />}
              <span className="ml-1">
                {copied.excluded ? 'Copied!' : 'Copy Excluded Styles'}
              </span>
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => copyToClipboard(prompt, 'prompt')}
            >
              {copied.prompt ? <Check size={16} /> : <Copy size={16} />}
              <span className="ml-1">
                {copied.prompt ? 'Copied!' : 'Copy Full Prompt'}
              </span>
            </Button>
          </div>

          {/* Title Section */}
          {sections.title && (
            <div>
              <h3 className="text-lg font-semibold text-deep-indigo mb-2">Title</h3>
              <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm">
                {sections.title}
              </div>
            </div>
          )}

          {/* Style Block */}
          {sections.styleBlock && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-deep-indigo">Style Block</h3>
                <span className="text-sm text-text-muted">
                  {getCharCount(sections.styleBlock)} characters
                  {getCharCount(sections.styleBlock) >= 950 && getCharCount(sections.styleBlock) <= 1000 && (
                    <span className="text-green-600 ml-1">✓</span>
                  )}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm leading-relaxed">
                {sections.styleBlock}
              </div>
            </div>
          )}

          {/* Excluded Styles Block */}
          {sections.excludedBlock && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-deep-indigo">Excluded Styles</h3>
                <span className="text-sm text-text-muted">
                  {getCharCount(sections.excludedBlock)} characters
                  {getCharCount(sections.excludedBlock) >= 950 && getCharCount(sections.excludedBlock) <= 1000 && (
                    <span className="text-green-600 ml-1">✓</span>
                  )}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm leading-relaxed">
                {sections.excludedBlock}
              </div>
            </div>
          )}

          {/* Structural Template */}
          {sections.structure && (
            <div>
              <h3 className="text-lg font-semibold text-deep-indigo mb-2">Structural Template</h3>
              <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {sections.structure}
              </div>
            </div>
          )}

          {/* Full Prompt */}
          <div>
            <h3 className="text-lg font-semibold text-deep-indigo mb-2">Complete Prompt</h3>
            <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {prompt}
            </div>
          </div>
        </Card.Content>
      )}
    </Card>
  )
}

export default SunoPromptOutput