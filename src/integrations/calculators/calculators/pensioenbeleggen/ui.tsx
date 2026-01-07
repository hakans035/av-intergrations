'use client'

import { useState, useEffect } from 'react'
import { Input, Slider } from '../../components/ui'
import { ReportModal } from '../../components/ReportModal'
import { formatCurrency } from '../../lib/utils'
import type { CalculatorConfig } from '../../types/calculator'
import type { PensioenbeleggenInput, PensioenbeleggenOutput } from './types'

interface Props {
  config: CalculatorConfig
  defaults: Record<string, unknown>
  onCalculate: (input: PensioenbeleggenInput) => PensioenbeleggenOutput
}

type ViewType = 'overview' | 'chart' | 'table'

export function CalculatorUI({ defaults, onCalculate }: Props) {
  const [startkapitaal, setStartkapitaal] = useState(Number(defaults.startkapitaal) || 10000)
  const [maandInleg, setMaandInleg] = useState(Number(defaults.maandInleg) || 500)
  const [inlegPeriodeJaar, setInlegPeriodeJaar] = useState(Number(defaults.inlegPeriodeJaar) || 20)
  const [jaarlijksRendement, setJaarlijksRendement] = useState(Number(defaults.jaarlijksRendement) || 7)
  const [doorgroeiPeriodeJaar, setDoorgroeiPeriodeJaar] = useState(Number(defaults.doorgroeiPeriodeJaar) || 10)
  const [spaarrente, setSpaarrente] = useState(Number(defaults.spaarrente) || 1.5)
  const [result, setResult] = useState<PensioenbeleggenOutput | null>(null)
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Auto-calculate on any change
  useEffect(() => {
    const input: PensioenbeleggenInput = {
      startkapitaal,
      maandInleg,
      inlegPeriodeJaar,
      jaarlijksRendement,
      doorgroeiPeriodeJaar,
      spaarrente,
    }
    const output = onCalculate(input)
    setResult(output)
  }, [startkapitaal, maandInleg, inlegPeriodeJaar, jaarlijksRendement, doorgroeiPeriodeJaar, spaarrente, onCalculate])

  // Get chart data points (show key intervals)
  const getChartData = () => {
    if (!result || result.jaarData.length < 2) return []
    const totalYears = inlegPeriodeJaar + doorgroeiPeriodeJaar

    // Show: end of opbouw, and 2-3 points in doorgroei, plus final
    const intervals: number[] = []

    // Add midpoint and end of opbouw
    if (inlegPeriodeJaar > 5) {
      intervals.push(Math.round(inlegPeriodeJaar / 2))
    }
    intervals.push(inlegPeriodeJaar)

    // Add points in doorgroei
    if (doorgroeiPeriodeJaar > 0) {
      if (doorgroeiPeriodeJaar > 5) {
        intervals.push(inlegPeriodeJaar + Math.round(doorgroeiPeriodeJaar / 2))
      }
      intervals.push(totalYears)
    }

    return intervals.slice(0, 4).map(year => {
      const data = result.jaarData.find(d => d.jaar === year) || result.jaarData[result.jaarData.length - 1]
      const maxValue = result.eindkapitaalNaDoorgroei
      return {
        jaar: year,
        fase: data.fase,
        inleg: data.totaleInleg,
        rendement: data.rendement,
        totaal: data.kapitaal,
        heightPercent: (data.kapitaal / maxValue) * 100,
        inlegPercent: (data.totaleInleg / data.kapitaal) * 100,
      }
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="calculator-card">
        <div style={styles.grid} className="calculator-grid">
          {/* Left Panel - Inputs */}
          <div style={styles.inputPanel} className="calculator-input-panel">
            <h3 style={styles.panelTitle} className="calculator-panel-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#307cf1" strokeWidth="2">
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
                <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                <circle cx="16" cy="11" r="1" />
              </svg>
              Pensioenbeleggen
            </h3>

            <div style={styles.inputsContainer} className="calculator-inputs-container">
              <Input
                label="Startkapitaal"
                type="number"
                value={String(startkapitaal)}
                onChange={(e) => setStartkapitaal(Number(e.target.value))}
                helpText="Uw huidige pensioenkapitaal"
              />

              <Slider
                label="Maandelijkse Inleg"
                value={maandInleg}
                min={0}
                max={5000}
                step={50}
                formatValue={(v) => formatCurrency(v, 'nl-NL', 'EUR')}
                onChange={setMaandInleg}
              />

              <Slider
                label="Inlegperiode"
                value={inlegPeriodeJaar}
                min={1}
                max={40}
                step={1}
                formatValue={(v) => `${v} jaar`}
                onChange={setInlegPeriodeJaar}
              />

              <Slider
                label="Jaarlijks Rendement"
                value={jaarlijksRendement}
                min={1}
                max={15}
                step={0.5}
                formatValue={(v) => `${v}%`}
                onChange={setJaarlijksRendement}
              />

              <Slider
                label="Spaarrente"
                value={spaarrente}
                min={0}
                max={5}
                step={0.1}
                formatValue={(v) => `${v}%`}
                onChange={setSpaarrente}
              />

              <Slider
                label="Doorgroeiperiode (zonder inleg)"
                value={doorgroeiPeriodeJaar}
                min={0}
                max={30}
                step={1}
                formatValue={(v) => `${v} jaar`}
                onChange={setDoorgroeiPeriodeJaar}
              />

              <div style={styles.infoBox} className="calculator-info-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#307cf1" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Na de inlegperiode groeit uw vermogen door zonder extra inleg tijdens de doorgroeiperiode.</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div style={styles.resultPanel} className="calculator-result-panel">
            {/* Decorative circles */}
            <div style={styles.decorCircle1} />
            <div style={styles.decorCircle2} />

            <div style={styles.resultContent}>
              {/* View Switcher */}
              <div style={styles.viewSwitcher} className="calculator-view-switcher">
                {(['overview', 'chart', 'table'] as ViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    style={{
                      ...styles.viewButton,
                      ...(activeView === view ? styles.viewButtonActive : {}),
                    }}
                    className="calculator-view-button"
                  >
                    {view === 'overview' ? 'Overzicht' : view === 'chart' ? 'Grafiek' : 'Tabel'}
                  </button>
                ))}
              </div>

              {result && (
                <>
                  {/* Overview View */}
                  {activeView === 'overview' && (
                    <div style={styles.viewContent}>
                      <div style={styles.mainResult}>
                        <p style={styles.resultLabel} className="calculator-result-label">Eindkapitaal na {result.totaleLooptijdJaar} jaar</p>
                        <div style={styles.resultValue} className="calculator-main-value">
                          {formatCurrency(result.eindkapitaalNaDoorgroei, 'nl-NL', 'EUR')}
                        </div>
                        <div style={styles.resultTrend}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                          </svg>
                          <span>+{jaarlijksRendement}% gemiddeld rendement</span>
                        </div>
                      </div>

                      {/* Phase 1: Opbouwfase */}
                      <div style={styles.phaseSection} className="calculator-phase-section">
                        <h4 style={styles.phaseTitle} className="calculator-phase-title">Opbouwfase ({inlegPeriodeJaar} jaar)</h4>
                        <div style={styles.resultRow}>
                          <span style={styles.resultRowLabel} className="calculator-result-row-label">Totale Inleg</span>
                          <span style={styles.resultRowValue} className="calculator-result-row-value">
                            {formatCurrency(result.totaleInleg, 'nl-NL', 'EUR')}
                          </span>
                        </div>
                        <div style={styles.resultRow}>
                          <span style={styles.resultRowLabel} className="calculator-result-row-label">Eindkapitaal</span>
                          <span style={styles.resultRowValue} className="calculator-result-row-value">
                            {formatCurrency(result.eindkapitaalNaInleg, 'nl-NL', 'EUR')}
                          </span>
                        </div>
                        <div style={styles.resultRow}>
                          <span style={styles.resultRowLabel} className="calculator-result-row-label">Rendement</span>
                          <span style={styles.resultRowValueGreen} className="calculator-result-row-value">
                            +{formatCurrency(result.rendementOpbouwfase, 'nl-NL', 'EUR')}
                          </span>
                        </div>
                      </div>

                      {/* Phase 2: Doorgroeifase */}
                      {doorgroeiPeriodeJaar > 0 && (
                        <div style={styles.phaseSection} className="calculator-phase-section">
                          <h4 style={styles.phaseTitle} className="calculator-phase-title">Doorgroeifase ({doorgroeiPeriodeJaar} jaar)</h4>
                          <div style={styles.resultRow}>
                            <span style={styles.resultRowLabel} className="calculator-result-row-label">Extra Rendement</span>
                            <span style={styles.resultRowValueGreen} className="calculator-result-row-value">
                              +{formatCurrency(result.extraRendementDoorgroei, 'nl-NL', 'EUR')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Savings comparison */}
                      <div style={styles.phaseSection} className="calculator-phase-section">
                        <h4 style={styles.phaseTitle} className="calculator-phase-title">Vergelijking met sparen</h4>
                        <div style={styles.resultRow}>
                          <span style={styles.resultRowLabel} className="calculator-result-row-label">Eindkapitaal Sparen</span>
                          <span style={styles.resultRowValue} className="calculator-result-row-value">
                            {formatCurrency(result.eindkapitaalSparen, 'nl-NL', 'EUR')}
                          </span>
                        </div>
                        <div style={styles.resultRow}>
                          <span style={styles.resultRowLabel} className="calculator-result-row-label">Verschil (vs sparen)</span>
                          <span style={styles.resultRowValueBadge} className="calculator-result-row-value">
                            +{formatCurrency(result.verschil, 'nl-NL', 'EUR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart View - Line Chart */}
                  {activeView === 'chart' && (
                    <div style={styles.viewContent}>
                      <h4 style={styles.chartTitle} className="calculator-chart-title">Vermogensgroei</h4>
                      <p style={styles.chartSubtitle} className="calculator-chart-subtitle">Opbouw ({inlegPeriodeJaar}jr) + Doorgroei ({doorgroeiPeriodeJaar}jr)</p>

                      <div style={styles.lineChartContainer}>
                        <svg viewBox="0 0 300 180" style={styles.lineChartSvg}>
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <line key={i} x1="50" y1={30 + i * 35} x2="290" y2={30 + i * 35} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                          ))}

                          {/* Y-axis labels with euro amounts */}
                          {[0, 1, 2, 3, 4].map(i => {
                            const value = result.eindkapitaalNaDoorgroei * (1 - i * 0.25)
                            return (
                              <text key={i} x="48" y={33 + i * 35} fill="#94a3b8" fontSize="7" textAnchor="end">
                                €{Math.round(value).toLocaleString('nl-NL')}
                              </text>
                            )
                          })}

                          {/* Phase separator line at end of opbouw */}
                          {doorgroeiPeriodeJaar > 0 && (
                            <line
                              x1={50 + (inlegPeriodeJaar / result.totaleLooptijdJaar) * 240}
                              y1="30"
                              x2={50 + (inlegPeriodeJaar / result.totaleLooptijdJaar) * 240}
                              y2="170"
                              stroke="rgba(0,0,0,0.15)"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                            />
                          )}

                          {/* Area fill for Kapitaal */}
                          <path
                            d={`M50,170 ${result.jaarData.map((d, i) => {
                              const x = 50 + (i / (result.jaarData.length - 1)) * 240
                              const y = 170 - (d.kapitaal / result.eindkapitaalNaDoorgroei) * 140
                              return `L${x},${y}`
                            }).join(' ')} L290,170 Z`}
                            fill="rgba(34, 197, 94, 0.1)"
                          />

                          {/* Sparen line (dashed) */}
                          <path
                            d={`M50,170 ${result.jaarData.map((d, i) => {
                              const x = 50 + (i / (result.jaarData.length - 1)) * 240
                              const y = 170 - (d.waardeSparen / result.eindkapitaalNaDoorgroei) * 140
                              return `L${x},${y}`
                            }).join(' ')}`}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                          />

                          {/* Kapitaal line */}
                          <path
                            d={`M50,170 ${result.jaarData.map((d, i) => {
                              const x = 50 + (i / (result.jaarData.length - 1)) * 240
                              const y = 170 - (d.kapitaal / result.eindkapitaalNaDoorgroei) * 140
                              return `L${x},${y}`
                            }).join(' ')}`}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                          />

                          {/* Hover zones - vertical strips for easier interaction */}
                          {result.jaarData.map((d, i) => {
                            const x = 50 + (i / (result.jaarData.length - 1)) * 240
                            const stripWidth = 240 / (result.jaarData.length - 1 || 1)
                            return (
                              <rect
                                key={i}
                                x={x - stripWidth / 2}
                                y="20"
                                width={stripWidth}
                                height="160"
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(i)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            )
                          })}

                          {/* Visible hover point */}
                          {hoveredPoint !== null && result.jaarData[hoveredPoint] && (
                            <>
                              <circle
                                cx={50 + (hoveredPoint / (result.jaarData.length - 1)) * 240}
                                cy={170 - (result.jaarData[hoveredPoint].kapitaal / result.eindkapitaalNaDoorgroei) * 140}
                                r="5"
                                fill="#22c55e"
                                stroke="#fff"
                                strokeWidth="2"
                              />
                              <circle
                                cx={50 + (hoveredPoint / (result.jaarData.length - 1)) * 240}
                                cy={170 - (result.jaarData[hoveredPoint].waardeSparen / result.eindkapitaalNaDoorgroei) * 140}
                                r="4"
                                fill="#94a3b8"
                                stroke="#fff"
                                strokeWidth="1"
                              />
                            </>
                          )}

                          {/* X-axis labels */}
                          <text x="50" y="180" fill="#94a3b8" fontSize="8" textAnchor="middle">0</text>
                          {doorgroeiPeriodeJaar > 0 && (
                            <text x={50 + (inlegPeriodeJaar / result.totaleLooptijdJaar) * 240} y="180" fill="#22c55e" fontSize="8" textAnchor="middle">{inlegPeriodeJaar}jr</text>
                          )}
                          <text x="290" y="180" fill="#94a3b8" fontSize="8" textAnchor="middle">{result.totaleLooptijdJaar}jr</text>
                        </svg>

                        {/* Tooltip */}
                        {hoveredPoint !== null && result.jaarData[hoveredPoint] && (
                          <div style={{
                            ...styles.tooltip,
                            left: `${((50 + (hoveredPoint / (result.jaarData.length - 1)) * 240) / 300) * 100}%`,
                          }}>
                            <div style={styles.tooltipTitle}>
                              Jaar {result.jaarData[hoveredPoint].jaar}
                              <span style={{
                                ...styles.tooltipPhase,
                                backgroundColor: result.jaarData[hoveredPoint].fase === 'doorgroei' ? 'rgba(134,239,172,0.2)' : 'rgba(191,219,254,0.2)',
                                color: result.jaarData[hoveredPoint].fase === 'doorgroei' ? '#22c55e' : '#64748b',
                              }}>
                                {result.jaarData[hoveredPoint].fase === 'doorgroei' ? 'Doorgroei' : 'Opbouw'}
                              </span>
                            </div>
                            <div style={styles.tooltipRow}>
                              <span style={styles.tooltipDotGreen} />
                              <span>Beleggen: {formatCurrency(result.jaarData[hoveredPoint].kapitaal, 'nl-NL', 'EUR')}</span>
                            </div>
                            <div style={styles.tooltipRow}>
                              <span style={styles.tooltipDotWhite} />
                              <span>Sparen: {formatCurrency(result.jaarData[hoveredPoint].waardeSparen, 'nl-NL', 'EUR')}</span>
                            </div>
                            <div style={styles.tooltipDivider} />
                            <div style={styles.tooltipRow}>
                              <span style={styles.tooltipDiff}>+{formatCurrency(result.jaarData[hoveredPoint].kapitaal - result.jaarData[hoveredPoint].waardeSparen, 'nl-NL', 'EUR')}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={styles.chartLegend} className="calculator-chart-legend">
                        <div style={styles.legendItem}>
                          <div style={{ ...styles.legendLine, backgroundColor: '#22c55e' }} />
                          <span>Beleggen</span>
                        </div>
                        <div style={styles.legendItem}>
                          <div style={{ ...styles.legendLineDashed }} />
                          <span>Sparen</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table View */}
                  {activeView === 'table' && (
                    <div style={styles.viewContent}>
                      <h4 style={styles.chartTitle} className="calculator-chart-title">Jaaroverzicht</h4>
                      <p style={styles.chartSubtitle} className="calculator-chart-subtitle">Detail per jaar</p>

                      <div style={styles.tableWrapper} className="calculator-table-wrapper">
                        <table style={styles.table} className="calculator-table">
                          <thead>
                            <tr>
                              <th style={styles.th}>Jaar</th>
                              <th style={{ ...styles.th, textAlign: 'right' }}>Inleg</th>
                              <th style={{ ...styles.th, textAlign: 'right' }}>Winst</th>
                              <th style={{ ...styles.th, textAlign: 'right' }}>Totaal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.jaarData.slice(1).map((row) => (
                              <tr key={row.jaar} style={styles.tr}>
                                <td style={{
                                  ...styles.td,
                                  color: row.fase === 'doorgroei' ? '#22c55e' : undefined,
                                }}>
                                  {new Date().getFullYear() + row.jaar - 1}
                                  {row.fase === 'doorgroei' && <span style={styles.faseTag}>D</span>}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right', opacity: 0.8 }}>
                                  {formatCurrency(row.totaleInleg, 'nl-NL', 'EUR')}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right', color: '#22c55e' }}>
                                  +{formatCurrency(row.rendement, 'nl-NL', 'EUR')}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 500 }}>
                                  {formatCurrency(row.kapitaal, 'nl-NL', 'EUR')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={styles.tableLegend}>
                        <span style={styles.faseTag}>D</span>
                        <span>= Doorgroeifase (zonder inleg)</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={styles.ctaSection} className="calculator-cta-section">
              <a href="https://ambitionvalley.webflow.io/form" target="_blank" rel="noopener noreferrer" className="cta-button-white">
                Vraag gratis adviesgesprek aan
              </a>
              <button style={styles.reportLink} className="calculator-report-link" onClick={() => setIsReportModalOpen(true)}>
                Ontvang gratis rapport per email
              </button>
              <p style={styles.disclaimer} className="calculator-disclaimer">
                *Indicatieve berekening. Aan deze uitkomsten kunnen geen rechten worden ontleend.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        calculatorType="pensioenbeleggen"
        calculatorData={{
          inputs: {
            startkapitaal,
            maandInleg,
            inlegPeriodeJaar,
            jaarlijksRendement,
            doorgroeiPeriodeJaar,
            spaarrente,
          },
          results: result ? { ...result } : {},
        }}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: '24px',
    overflow: 'hidden',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  inputPanel: {
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#0f172a',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.5,
  },
  resultPanel: {
    backgroundColor: '#ffffff',
    padding: '32px',
    color: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '650px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
  },
  decorCircle1: {
    display: 'none',
  },
  decorCircle2: {
    display: 'none',
  },
  resultContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  viewSwitcher: {
    display: 'flex',
    padding: '4px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  },
  viewButton: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewButtonActive: {
    backgroundColor: '#307cf1',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  viewContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mainResult: {
    marginBottom: '20px',
  },
  resultLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '4px',
  },
  resultValue: {
    fontSize: '32px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    color: '#307cf1',
  },
  resultTrend: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#22c55e',
  },
  phaseSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '14px',
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  phaseTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  totalSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '14px',
    marginTop: '14px',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRowLabel: {
    color: '#64748b',
    fontSize: '13px',
  },
  resultRowValue: {
    fontWeight: 500,
    fontSize: '14px',
    color: '#0f172a',
  },
  resultRowValueGreen: {
    fontWeight: 500,
    fontSize: '14px',
    color: '#22c55e',
  },
  resultRowValueBadge: {
    fontWeight: 600,
    fontSize: '13px',
    backgroundColor: '#dcfce7',
    color: '#22c55e',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  // Chart styles
  chartTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#0f172a',
    marginBottom: '4px',
  },
  chartSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '24px',
  },
  chartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '180px',
    gap: '12px',
    flex: 1,
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    height: '100%',
  },
  barWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: '6px 6px 0 0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  barInleg: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '100%',
  },
  barRendement: {
    backgroundColor: 'rgba(134, 239, 172, 0.9)',
    width: '100%',
  },
  barLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#64748b',
  },
  chartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '16px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748b',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  // Line chart styles
  lineChartContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lineChartSvg: {
    width: '100%',
    height: 'auto',
  },
  legendLine: {
    width: '20px',
    height: '3px',
    borderRadius: '2px',
  },
  legendLineDashed: {
    width: '20px',
    height: '3px',
    background: 'repeating-linear-gradient(90deg, #94a3b8, #94a3b8 4px, transparent 4px, transparent 8px)',
  },
  // Tooltip styles
  tooltip: {
    position: 'absolute',
    bottom: '50px',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '12px',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 20,
    minWidth: '160px',
    pointerEvents: 'none',
  },
  tooltipTitle: {
    fontWeight: 600,
    marginBottom: '8px',
    color: '#bfdbfe',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tooltipPhase: {
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  tooltipDotGreen: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  tooltipDotWhite: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#94a3b8',
  },
  tooltipDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '6px 0',
  },
  tooltipDiff: {
    color: '#22c55e',
    fontWeight: 600,
  },
  // Table styles
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '320px',
    marginRight: '-16px',
    paddingRight: '16px',
  },
  table: {
    width: '100%',
    fontSize: '13px',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    padding: '8px 0',
    fontSize: '11px',
    fontWeight: 500,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    backgroundColor: '#ffffff',
    textAlign: 'left',
    zIndex: 10,
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 0',
    color: '#0f172a',
  },
  faseTag: {
    marginLeft: '6px',
    fontSize: '9px',
    padding: '2px 4px',
    backgroundColor: '#dcfce7',
    borderRadius: '3px',
    color: '#22c55e',
    fontWeight: 600,
  },
  tableLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    fontSize: '11px',
    color: '#64748b',
  },
  ctaSection: {
    position: 'relative',
    zIndex: 10,
    marginTop: '24px',
  },
  ctaButton: {
    width: '100%',
    padding: '16px 28px',
    backgroundColor: '#307cf1',
    color: '#ffffff',
    border: '1px solid #307cf1',
    borderRadius: '100px',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '1.5em',
    letterSpacing: '0.2px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    textAlign: 'center',
  },
  reportLink: {
    marginTop: '16px',
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid #307cf1',
    borderRadius: '100px',
    color: '#307cf1',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    display: 'block',
    width: '100%',
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
  },
  disclaimer: {
    marginTop: '12px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
  },
}
