import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { HeaderTemplate } from '../reports/LabReportPDF';
import tinosRegular from '../../../fonts/Tinos-Regular.ttf';
import tinosBold from '../../../fonts/Tinos-Bold.ttf';
import notoSansDevanagari from '../../../fonts/NotoSansDevanagari-Regular.ttf';

// Register fonts
Font.register({
  family: 'Tinos',
  fonts: [
    { src: tinosRegular, fontWeight: 'normal' },
    { src: tinosBold, fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'NotoSansDevanagari',
  src: notoSansDevanagari,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Tinos',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
    color: '#1a5f7a',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#34495e',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#2c3e50',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    alignItems: 'center',
    height: 24,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    textAlign: 'center',
  },
  summaryTable: {
    width: '50%',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: '#34495e',
    fontWeight: 'bold',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 10,
    color: '#2c3e50',
  },
  rupeeSymbol: {
    fontFamily: 'NotoSansDevanagari',
  },
});

const RupeeSymbol = ({ style }) => (
  <Text style={[styles.rupeeSymbol, style]}>₹</Text>
);

const BillPDF = ({ billData, hospitalInfo }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HeaderTemplate hospital={hospitalInfo} />
        <Text style={styles.title}>Patient Bill</Text>
        
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Patient Name:</Text>
              <Text style={styles.infoValue}>{billData.patientInfo.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Reg. No:</Text>
              <Text style={styles.infoValue}>{billData.patientInfo.registrationNumber}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{billData.patientInfo.phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bill Date:</Text>
              <Text style={styles.infoValue}>{format(new Date(billData.createdAt), 'dd-MM-yyyy')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Service</Text>
            <Text style={styles.tableCell}>Quantity</Text>
            <Text style={styles.tableCell}>Rate (<RupeeSymbol />)</Text>
            <Text style={styles.tableCell}>Amount (<RupeeSymbol />)</Text>
          </View>
          {billData.services.map((service, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>{service.name}</Text>
              <Text style={styles.tableCell}>{service.quantity}</Text>
              <Text style={styles.tableCell}><RupeeSymbol />{service.rate.toFixed(2)}</Text>
              <Text style={styles.tableCell}><RupeeSymbol />{(service.quantity * service.rate).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}><RupeeSymbol />{billData.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}><RupeeSymbol />{billData.additionalDiscount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Amount:</Text>
            <Text style={styles.summaryValue}><RupeeSymbol />{(billData.totalAmount - billData.additionalDiscount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid:</Text>
            <Text style={styles.summaryValue}><RupeeSymbol />{billData.amountPaid.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance Due:</Text>
            <Text style={styles.summaryValue}><RupeeSymbol />{(billData.totalAmount - billData.additionalDiscount - billData.amountPaid).toFixed(2)}</Text>
          </View>
        </View>

    
      </Page>
    </Document>
  );
};

export default BillPDF;
