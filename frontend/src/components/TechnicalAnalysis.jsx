import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Music, Activity, Clock, Disc } from 'lucide-react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'

const TechnicalAnalysis = ({ data, isExpanded, setIsExpanded }) => {
  if (!data) return null

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const getKeyIcon = () => <Music className="h-5 w-5" />
  const getBpmIcon = () => <Activity className="h-5 w-5" />
  const getDurationIcon = () => <Clock className="h-5 w-5" />
  const getEnergyIcon = () => <Disc className="h-5 w-5" />

  return (
    <Card className="overflow-hidden">
      <Card.Header 
        className="cursor-pointer bg-gradient-to-r from-deep-indigo to-deep-indigo/90 text-white"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <Card.Title className="text-white flex items-center gap-2">
            <Music className="h-6 w-6" />
            Technical Analysis
          </Card.Title>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </Card.Header>

      {isExpanded && (
        <Card.Content className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-light-bg rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getBpmIcon()}
              </div>
              <div className="text-2xl font-bold text-deep-indigo">{data.bpm}</div>
              <div className="text-sm text-text-muted">BPM</div>
            </div>

            <div className="text-center p-4 bg-light-bg rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getKeyIcon()}
              </div>
              <div className="text-lg font-bold text-deep-indigo">{data.key}</div>
              <div className="text-sm text-text-muted">Key</div>
            </div>

            <div className="text-center p-4 bg-light-bg rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getDurationIcon()}
              </div>
              <div className="text-lg font-bold text-deep-indigo">{data.timeSignature}</div>
              <div className="text-sm text-text-muted">Time Sig</div>
            </div>

            <div className="text-center p-4 bg-light-bg rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getEnergyIcon()}
              </div>
              <div className="text-2xl font-bold text-deep-indigo">{data.energy}/10</div>
              <div className="text-sm text-text-muted">Energy</div>
            </div>
          </div>

          {/* Genre and Mood */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-text-dark mb-2">Genre & Style</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary" size="md">{data.genre}</Badge>
                {data.subGenres?.map((subgenre, index) => (
                  <Badge key={index} variant="secondary" size="sm">{subgenre}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-text-dark mb-2">Mood & Atmosphere</h4>
              <div className="flex flex-wrap gap-2">
                {data.mood?.map((mood, index) => (
                  <Badge key={index} variant="default" size="sm">{mood}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Vocal Style */}
          {data.vocalStyle && (
            <div>
              <h4 className="font-semibold text-text-dark mb-2">Vocal Style</h4>
              <p className="text-text-muted">{data.vocalStyle}</p>
            </div>
          )}

          {/* Instruments */}
          {data.instruments && data.instruments.length > 0 && (
            <div>
              <h4 className="font-semibold text-text-dark mb-3">Instrumentation</h4>
              <div className="space-y-3">
                {data.instruments.map((instrument, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-dark">{instrument.name}</span>
                        <Badge variant="outline" size="sm">{instrument.role}</Badge>
                      </div>
                      <span className="text-sm font-medium text-deep-indigo">
                        {instrument.prominence}/10
                      </span>
                    </div>
                    <ProgressBar value={instrument.prominence} max={10} className="mb-2" />
                    <p className="text-sm text-text-muted">{instrument.characteristics}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Production Elements */}
          {data.productionElements && (
            <div>
              <h4 className="font-semibold text-text-dark mb-3">Production Analysis</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-text-dark">Mixing</h5>
                  <p className="text-sm text-text-muted">{data.productionElements.mixing}</p>
                </div>
                
                {data.productionElements.effects && (
                  <div>
                    <h5 className="font-medium text-text-dark">Effects</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.productionElements.effects.map((effect, index) => (
                        <Badge key={index} variant="secondary" size="sm">{effect}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h5 className="font-medium text-text-dark">Sound Design</h5>
                  <p className="text-sm text-text-muted">{data.productionElements.soundDesign}</p>
                </div>
              </div>
            </div>
          )}

          {/* Structure */}
          {data.structure && (
            <div>
              <h4 className="font-semibold text-text-dark mb-3">Song Structure</h4>
              <div className="space-y-3">
                {data.structure.sections && (
                  <div>
                    <h5 className="font-medium text-text-dark">Sections</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.structure.sections.map((section, index) => (
                        <Badge key={index} variant="outline" size="sm">{section}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h5 className="font-medium text-text-dark">Arrangement</h5>
                  <p className="text-sm text-text-muted">{data.structure.arrangement}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-text-dark">Dynamics</h5>
                  <p className="text-sm text-text-muted">{data.structure.dynamics}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hook Elements */}
          {data.hookElements && data.hookElements.length > 0 && (
            <div>
              <h4 className="font-semibold text-text-dark mb-2">Hook Elements</h4>
              <div className="flex flex-wrap gap-2">
                {data.hookElements.map((hook, index) => (
                  <Badge key={index} variant="success" size="sm">{hook}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Similar Artists */}
          {data.similarArtists && data.similarArtists.length > 0 && (
            <div>
              <h4 className="font-semibold text-text-dark mb-2">Similar Artists</h4>
              <div className="flex flex-wrap gap-2">
                {data.similarArtists.map((artist, index) => (
                  <Badge key={index} variant="primary" size="sm">{artist}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      )}
    </Card>
  )
}

export default TechnicalAnalysis