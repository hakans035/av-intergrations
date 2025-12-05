import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

// Logo URL - use production URL for PDF rendering
const LOGO_URL = 'https://av-intergrations.vercel.app/images/logo.png'

// Types for Pensioenbeleggen report data
export interface PensioenbeleggenReportData {
  inputs: {
    startkapitaal: number
    maandInleg: number
    inlegPeriodeJaar: number
    jaarlijksRendement: number
    doorgroeiPeriodeJaar: number
    spaarrente: number
  }
  results: {
    totaleLooptijdJaar: number
    totaleInleg: number
    eindkapitaalNaInleg: number
    rendementOpbouwfase: number
    extraRendementDoorgroei: number
    eindkapitaalNaDoorgroei: number
    eindkapitaalSparen: number
    verschil: number
    jaarData: Array<{
      jaar: number
      fase: 'opbouw' | 'doorgroei'
      totaleInleg: number
      kapitaal: number
      rendement: number
      waardeSparen: number
    }>
  }
  generatedDate: string
}

// Brand colors
const colors = {
  primary: '#307cf1',
  dark: '#1e344b',
  green: '#22c55e',
  lightGray: '#f8fafc',
  gray: '#64748b',
  white: '#ffffff',
  lightGreen: '#dcfce7',
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 20,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 40,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2,
  },
  date: {
    fontSize: 9,
    color: colors.gray,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  label: {
    color: colors.gray,
    fontSize: 9,
  },
  value: {
    fontWeight: 'bold',
    color: colors.dark,
    fontSize: 9,
  },
  valueGreen: {
    fontWeight: 'bold',
    color: colors.green,
    fontSize: 9,
  },
  highlightBox: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  highlightLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginBottom: 4,
  },
  highlightValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  highlightSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    marginTop: 4,
  },
  phaseBox: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  phaseBoxOpbouw: {
    backgroundColor: colors.lightGray,
  },
  phaseBoxDoorgroei: {
    backgroundColor: colors.lightGreen,
  },
  phaseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
  },
  phaseTitleGreen: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.green,
    marginBottom: 8,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  comparisonBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  comparisonTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
  },
  divider: {
    borderBottom: `1px solid ${colors.lightGray}`,
    marginVertical: 8,
  },
  // Table styles
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  tableRowDoorgroei: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `1px solid ${colors.lightGray}`,
    backgroundColor: colors.lightGreen,
  },
  tableCell: {
    fontSize: 8,
    color: colors.dark,
  },
  tableCellGreen: {
    fontSize: 8,
    color: colors.green,
    fontWeight: 'bold',
  },
  faseTag: {
    fontSize: 7,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 4,
  },
  faseTagO: {
    backgroundColor: colors.lightGray,
    color: colors.gray,
  },
  faseTagD: {
    backgroundColor: colors.lightGreen,
    color: colors.green,
  },
  col1: { width: '10%' },
  col2: { width: '10%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  col5: { width: '20%' },
  col6: { width: '20%' },
  legend: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 8,
    fontSize: 8,
    color: colors.gray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  disclaimer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  disclaimerText: {
    fontSize: 8,
    color: colors.gray,
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: `1px solid ${colors.lightGray}`,
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 9,
    color: colors.primary,
    marginRight: 8,
  },
  contactValue: {
    fontSize: 9,
    color: colors.gray,
  },
})

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// PDF Document Component
export const PensioenbeleggenReport: React.FC<{ data: PensioenbeleggenReportData }> = ({ data }) => {
  const { inputs, results, generatedDate } = data

  // Get table rows - show key years from both phases
  const getTableRows = () => {
    const { jaarData } = results
    if (!jaarData || jaarData.length === 0) return []

    const totalYears = results.totaleLooptijdJaar

    // For shorter periods, show more years
    if (totalYears <= 15) {
      return jaarData.filter(d => d.jaar > 0)
    }

    // Show key milestones
    const rows: typeof jaarData = []
    const opbouwEnd = inputs.inlegPeriodeJaar

    jaarData.forEach((d) => {
      if (d.jaar === 0) return

      // Show years 1, 5, 10, end of opbouw, and key doorgroei points
      const isKeyYear =
        d.jaar === 1 ||
        d.jaar === 5 ||
        d.jaar === 10 ||
        d.jaar === opbouwEnd ||
        (d.fase === 'doorgroei' && (d.jaar === opbouwEnd + 5 || d.jaar === totalYears))

      if (isKeyYear) {
        rows.push(d)
      }
    })

    return rows
  }

  const tableRows = getTableRows()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logoImage} src={LOGO_URL} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Uw Persoonlijke Pensioenanalyse</Text>
            <Text style={styles.subtitle}>Pensioenbeleggen Projectie</Text>
            <Text style={styles.date}>Gegenereerd op: {generatedDate}</Text>
          </View>
        </View>

        {/* Input Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UW GEGEVENS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Startkapitaal</Text>
            <Text style={styles.value}>{formatCurrency(inputs.startkapitaal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Maandelijkse inleg</Text>
            <Text style={styles.value}>{formatCurrency(inputs.maandInleg)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inlegperiode (opbouw)</Text>
            <Text style={styles.value}>{inputs.inlegPeriodeJaar} jaar</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jaarlijks rendement</Text>
            <Text style={styles.value}>{inputs.jaarlijksRendement}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Doorgroeiperiode</Text>
            <Text style={styles.value}>{inputs.doorgroeiPeriodeJaar} jaar</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Spaarrente</Text>
            <Text style={styles.value}>{inputs.spaarrente}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Totale looptijd</Text>
            <Text style={styles.value}>{results.totaleLooptijdJaar} jaar</Text>
          </View>
        </View>

        {/* Phase Results - Two Columns */}
        <View style={styles.twoColumn}>
          {/* Opbouwfase */}
          <View style={styles.column}>
            <View style={{ ...styles.phaseBox, ...styles.phaseBoxOpbouw }}>
              <Text style={styles.phaseTitle}>OPBOUWFASE ({inputs.inlegPeriodeJaar} JAAR)</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Totale inleg</Text>
                <Text style={styles.value}>{formatCurrency(results.totaleInleg)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Eindkapitaal</Text>
                <Text style={styles.value}>{formatCurrency(results.eindkapitaalNaInleg)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Rendement</Text>
                <Text style={styles.valueGreen}>+{formatCurrency(results.rendementOpbouwfase)}</Text>
              </View>
            </View>
          </View>

          {/* Doorgroeifase */}
          <View style={styles.column}>
            <View style={{ ...styles.phaseBox, ...styles.phaseBoxDoorgroei }}>
              <Text style={styles.phaseTitleGreen}>DOORGROEIFASE ({inputs.doorgroeiPeriodeJaar} JAAR)</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Geen extra inleg</Text>
                <Text style={styles.value}>-</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Extra rendement</Text>
                <Text style={styles.valueGreen}>+{formatCurrency(results.extraRendementDoorgroei)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}> </Text>
                <Text style={styles.value}> </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Result - Highlighted */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightLabel}>EINDKAPITAAL NA {results.totaleLooptijdJaar} JAAR</Text>
          <Text style={styles.highlightValue}>{formatCurrency(results.eindkapitaalNaDoorgroei)}</Text>
          <Text style={styles.highlightSub}>Met {inputs.jaarlijksRendement}% gemiddeld rendement per jaar</Text>
        </View>

        {/* Comparison with Savings */}
        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>VERGELIJKING MET SPAREN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Eindkapitaal Sparen ({inputs.spaarrente}%)</Text>
            <Text style={styles.value}>{formatCurrency(results.eindkapitaalSparen)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Verschil (extra door beleggen)</Text>
            <Text style={styles.valueGreen}>+{formatCurrency(results.verschil)}</Text>
          </View>
        </View>

        {/* Year-by-Year Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JAAROVERZICHT</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col1 }}>Jaar</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col2 }}>Fase</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col3 }}>Inleg</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col4 }}>Kapitaal</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col5 }}>Sparen</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col6 }}>Verschil</Text>
            </View>

            {/* Table Rows */}
            {tableRows.map((row) => (
              <View
                key={row.jaar}
                style={row.fase === 'doorgroei' ? styles.tableRowDoorgroei : styles.tableRow}
              >
                <Text style={{ ...styles.tableCell, ...styles.col1 }}>{row.jaar}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col2 }}>{row.fase === 'opbouw' ? 'O' : 'D'}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col3 }}>{formatCurrency(row.totaleInleg)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col4 }}>{formatCurrency(row.kapitaal)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col5 }}>{formatCurrency(row.waardeSparen)}</Text>
                <Text style={{ ...styles.tableCellGreen, ...styles.col6 }}>+{formatCurrency(row.kapitaal - row.waardeSparen)}</Text>
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={{ ...styles.legendDot, backgroundColor: colors.lightGray }} />
              <Text>O = Opbouwfase (met inleg)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={{ ...styles.legendDot, backgroundColor: colors.lightGreen }} />
              <Text>D = Doorgroeifase (zonder inleg)</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            DISCLAIMER: Deze berekening is indicatief. Beleggen brengt risico's met zich mee.
            U kunt uw inleg verliezen. In het verleden behaalde resultaten bieden geen garantie
            voor de toekomst. Pensioenopbouw is afhankelijk van uw persoonlijke situatie.
          </Text>
        </View>

        {/* Footer / Contact */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>NEEM CONTACT OP VOOR PENSIOENADVIES</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>info@ambitionvalley.nl</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Website:</Text>
            <Text style={styles.contactValue}>www.ambitionvalley.nl</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default PensioenbeleggenReport
