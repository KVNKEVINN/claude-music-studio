import React from 'react'
import { ChevronDown, ChevronUp, Palette, Sparkles } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'

const CreativeReport = ({ report, isExpanded, setIsExpanded }) => {
  if (!report) return null

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  // Parse markdown-like content into HTML
  const parseContent = (content) => {
    if (!content) return ''
    
    // Convert markdown headers to HTML
    return content
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-text-dark mt-6 mb-3 flex items-center gap-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-text-dark mt-4 mb-2">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gm, '<strong class="font-semibold text-text-dark">$1</strong>')
      .replace(/^\*(.*)\*/gm, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="text-text-muted leading-relaxed mb-4">')
      .replace(/^(.*)$/gm, '<p class="text-text-muted leading-relaxed mb-4">$1</p>')
  }

  const formatContent = (content) => {
    const sections = content.split(/(?=## )/g).filter(Boolean)
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim())
      if (lines.length === 0) return null
      
      const title = lines[0].replace(/^## /, '').replace(/^🎵|🎨|🔊|📐|✨/g, '').trim()
      const body = lines.slice(1).join('\n')
      
      // Get emoji from title
      const getEmoji = (title) => {
        if (title.toLowerCase().includes('overview')) return '🎵'
        if (title.toLowerCase().includes('palette')) return '🎨'
        if (title.toLowerCase().includes('production')) return '🔊'
        if (title.toLowerCase().includes('structural') || title.toLowerCase().includes('blueprint')) return '📐'
        if (title.toLowerCase().includes('vibe')) return '✨'
        return '🎶'
      }
      
      return (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold text-text-dark mb-3 flex items-center gap-2">
            <span className="text-xl">{getEmoji(title)}</span>
            {title}
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-text-muted leading-relaxed">{body}</p>
          </div>
        </div>
      )
    })
  }

  return (
    <Card className="overflow-hidden">
      <Card.Header 
        className="cursor-pointer bg-gradient-to-r from-sky-blue to-sky-blue/90 text-white"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <Card.Title className="text-white flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Creative Interpretation
          </Card.Title>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </Card.Header>

      {isExpanded && (
        <Card.Content className="space-y-4">
          <div className="prose prose-sm max-w-none">
            {formatContent(report)}
          </div>
        </Card.Content>
      )}
    </Card>
  )
}

export default CreativeReport