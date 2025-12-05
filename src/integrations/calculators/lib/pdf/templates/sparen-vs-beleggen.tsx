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

// Types for Sparen vs Beleggen report data
export interface SparenVsBeleggenReportData {
  inputs: {
    startkapitaal: number
    maandInleg: number
    spaarrente: number
    beleggingsRendement: number
    looptijdJaar: number
    risicoProfiel: string
  }
  results: {
    eindkapitaalBeleggen: number
    eindkapitaalSparen: number
    totaleInleg: number
    rendementOpbrengstBeleggen: number
    verschil: number
    jaarData: Array<{
      jaar: number
      totaleInleg: number
      waardeBeleggen: number
      waardeSparen: number
      rendementBeleggen: number
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
  resultGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  resultBox: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    padding: 12,
  },
  resultBoxLabel: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 4,
  },
  resultBoxValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
  },
  resultBoxValueGreen: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.green,
  },
  divider: {
    borderBottom: `1px solid ${colors.lightGray}`,
    marginVertical: 10,
  },
  // Table styles
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${colors.lightGray}`,
    backgroundColor: colors.lightGray,
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
  col1: { width: '12%' },
  col2: { width: '22%' },
  col3: { width: '22%' },
  col4: { width: '22%' },
  col5: { width: '22%' },
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

// Get risk profile label
const getRiskProfileLabel = (profile: string): string => {
  const labels: Record<string, string> = {
    defensief: 'Defensief',
    neutraal: 'Neutraal',
    offensief: 'Offensief',
    custom: 'Aangepast',
  }
  return labels[profile] || profile
}

// PDF Document Component
export const SparenVsBeleggenReport: React.FC<{ data: SparenVsBeleggenReportData }> = ({ data }) => {
  const { inputs, results, generatedDate } = data

  // Get table rows - show key years
  const getTableRows = () => {
    const { jaarData } = results
    if (!jaarData || jaarData.length === 0) return []

    // For shorter periods, show all years
    if (jaarData.length <= 10) {
      return jaarData.filter(d => d.jaar > 0)
    }

    // For longer periods, show first 5, then every 5th year, plus final
    const rows: typeof jaarData = []
    jaarData.forEach((d) => {
      if (d.jaar > 0 && (d.jaar <= 5 || d.jaar % 5 === 0 || d.jaar === inputs.looptijdJaar)) {
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
            <Text style={styles.title}>Uw Persoonlijke Beleggingsanalyse</Text>
            <Text style={styles.subtitle}>Sparen vs Beleggen Vergelijking</Text>
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
            <Text style={styles.label}>Looptijd</Text>
            <Text style={styles.value}>{inputs.looptijdJaar} jaar</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Risicoprofiel</Text>
            <Text style={styles.value}>{getRiskProfileLabel(inputs.risicoProfiel)} ({inputs.beleggingsRendement}%)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Spaarrente</Text>
            <Text style={styles.value}>{inputs.spaarrente}%</Text>
          </View>
        </View>

        {/* Main Result - Highlighted */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightLabel}>EINDKAPITAAL BELEGGEN</Text>
          <Text style={styles.highlightValue}>{formatCurrency(results.eindkapitaalBeleggen)}</Text>
          <Text style={styles.highlightSub}>Na {inputs.looptijdJaar} jaar met {inputs.beleggingsRendement}% verwacht rendement</Text>
        </View>

        {/* Results Grid */}
        <View style={styles.resultGrid}>
          <View style={styles.resultBox}>
            <Text style={styles.resultBoxLabel}>Totale Inleg</Text>
            <Text style={styles.resultBoxValue}>{formatCurrency(results.totaleInleg)}</Text>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultBoxLabel}>Rendement Beleggen</Text>
            <Text style={styles.resultBoxValueGreen}>+{formatCurrency(results.rendementOpbrengstBeleggen)}</Text>
          </View>
        </View>

        <View style={styles.resultGrid}>
          <View style={styles.resultBox}>
            <Text style={styles.resultBoxLabel}>Eindkapitaal Sparen</Text>
            <Text style={styles.resultBoxValue}>{formatCurrency(results.eindkapitaalSparen)}</Text>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultBoxLabel}>Verschil (vs Sparen)</Text>
            <Text style={styles.resultBoxValueGreen}>+{formatCurrency(results.verschil)}</Text>
          </View>
        </View>

        {/* Year-by-Year Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JAAROVERZICHT</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col1 }}>Jaar</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col2 }}>Inleg</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col3 }}>Beleggen</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col4 }}>Sparen</Text>
              <Text style={{ ...styles.tableHeaderCell, ...styles.col5 }}>Verschil</Text>
            </View>

            {/* Table Rows */}
            {tableRows.map((row, index) => (
              <View key={row.jaar} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={{ ...styles.tableCell, ...styles.col1 }}>{row.jaar}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col2 }}>{formatCurrency(row.totaleInleg)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col3 }}>{formatCurrency(row.waardeBeleggen)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.col4 }}>{formatCurrency(row.waardeSparen)}</Text>
                <Text style={{ ...styles.tableCellGreen, ...styles.col5 }}>+{formatCurrency(row.waardeBeleggen - row.waardeSparen)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            DISCLAIMER: Deze berekening is indicatief. Beleggen brengt risico's met zich mee.
            U kunt uw inleg verliezen. In het verleden behaalde resultaten bieden geen garantie
            voor de toekomst.
          </Text>
        </View>

        {/* Footer / Contact */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>NEEM CONTACT OP VOOR PERSOONLIJK ADVIES</Text>
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

export default SparenVsBeleggenReport
