import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import tinosRegular from '../../../fonts/Tinos-Regular.ttf';
import tinosBold from '../../../fonts/Tinos-Bold.ttf';
import { HeaderTemplate } from './LabReportPDF';

// Register fonts
Font.register({
  family: "Tinos",
  fonts: [
    { src: tinosRegular, fontWeight: "normal" },
    { src: tinosBold, fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Tinos',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 5,
    color: '#1a5f7a',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 5,
    flexDirection: 'row',  // Add this line
    alignItems: 'flex-start',  // Add this line
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34495e',
    width:"25%"
     // Add this line
  },
  sectionContent: {  // Add this new style
    fontSize: 11,
    color: '#2c3e50',
    width: '75%',
    marginLeft:5
  },
  row: {
    flexDirection: 'row',
    
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 11,
    color: '#2c3e50',
   
    width: '40%',
  },
  value: {
    fontSize: 11,
    color: '#2c3e50',

    width: '60%',
  },
  text: {
    fontSize: 11,
    
    marginLeft:150
  },
  patientInfoSection: {
   
   
   
  },
  column: {
    width: '33%',
    paddingRight: 5,
  },
  infoItem: {
    flex: 1,
    flexBasis: '33%',
    marginBottom:3
  },
});

const TruncatedText = ({ children, style }) => (
  <Text style={[style, { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }]}>
    {children}
  </Text>
);

const ConditionalText = ({ label, value, style }) => {
  if (!value) return null;
  return (
    <Text style={style}>
      <Text style={styles.label}>{label}: </Text>
      <Text style={styles.value}>{value}</Text>
    </Text>
  );
};

const ConditionalSection = ({ title, content }) => {
  if (!content) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}:</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
};

const hasValidData = (obj) => {
  if (!obj) return false;
  return Object.values(obj).some(value => value !== null && value !== '' && value !== undefined);
};

const DischargeSummaryPDF = ({ formData, patient }) => {
    console.log(formData)
  const hasComorbidities = formData.comorbidities && formData.comorbidities.some(c => c.name);
  const hasInvestigations = formData.investigations && formData.investigations.some(i => i.name || i.category);
  const hasMedicineAdvice = formData.medicineAdvice && formData.medicineAdvice.some(m => m.name || m.dosage || m.duration);
  const hasAdmissionVitals = formData.vitals && hasValidData(formData.vitals.admission);
  const hasDischargeVitals = formData.vitals && hasValidData(formData.vitals.discharge);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HeaderTemplate />
        
        <Text style={styles.title}>Discharge Summary</Text>

        <View style={styles.section}>
          <View style={styles.patientInfoSection}>
            <View style={[styles.row, {marginBottom: 5}]}>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Name: </Text>
                <Text style={styles.value}>{patient?.name || '--'}</Text>
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Age/Gender: </Text>
                <Text style={styles.value}>
                  {patient?.age && patient?.gender 
                    ? `${patient?.age} yrs/${patient?.gender}`
                    : '--'}
                </Text>
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Reg. No: </Text>
                <Text style={styles.value}>{patient?.registrationNumber || '--'}</Text>
              </Text>
            </View>
            
            <View style={[styles.row, {marginBottom:5}]}>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Admit Date: </Text>
                <Text style={styles.value}>{formData.admissionDate || '--'}</Text>
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Discharge Date: </Text>
                <Text style={styles.value}>{formData.dateDischarged || '--'}</Text>
              </Text>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Room: </Text>
                <Text style={styles.value}>{patient?.roomNumber || '--'}</Text>
              </Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.infoItem}>
                <Text style={styles.label}>Contact: </Text>
                <Text style={styles.value}>{patient?.contactNumber || '--'}</Text>
              </Text>
              <Text style={[styles.infoItem, { flex: 2 }]}>
                <Text style={styles.label}>Address: </Text>
                <TruncatedText style={styles.value}>{patient?.address || '--'}</TruncatedText>
              </Text>
              <Text style={styles.infoItem}></Text>
            </View>
          </View>
        </View>

        <ConditionalSection title="Diagnosis" content={formData.diagnosis} />
        <ConditionalSection title="Clinical Summary" content={formData.clinicalSummary} />
        
        {hasComorbidities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comorbidities:</Text>
            <View style={styles.sectionContent}>
              {formData.comorbidities.map((c, index) => (
                c.name && <Text key={index}>{c.name}</Text>
              ))}
            </View>
          </View>
        )}

        {hasAdmissionVitals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admission Vitals</Text>
            <Text style={styles.sectionContent}>
              {formData.vitals.admission.bloodPressure && `Blood Pressure: ${formData.vitals.admission.bloodPressure}, `}
              {formData.vitals.admission.heartRate && `Heart Rate: ${formData.vitals.admission.heartRate}, `}
              {formData.vitals.admission.temperature && `Temperature: ${formData.vitals.admission.temperature}, `}
              {formData.vitals.admission.oxygenSaturation && `Oxygen Saturation: ${formData.vitals.admission.oxygenSaturation}, `}
              {formData.vitals.admission.respiratoryRate && `Respiratory Rate: ${formData.vitals.admission.respiratoryRate}`}
            </Text>
          </View>
        )}

        <ConditionalSection title="Condition on Admission" content={formData.conditionOnAdmission} />

        {hasInvestigations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investigations</Text>
            {formData.investigations.map((inv, index) => (
              (inv.name || inv.category) && (
                <Text key={index} style={styles.text}>
                  {inv.name}{inv.category && ` (${inv.category})`}
                </Text>
              )
            ))}
          </View>
        )}

        <ConditionalSection title="Treatment" content={formData.treatment} />

        {hasDischargeVitals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discharge Vitals</Text>
            <Text style={styles.sectionContent}>
              {formData.vitals.discharge.bloodPressure && `Blood Pressure: ${formData.vitals.discharge.bloodPressure}, `}
              {formData.vitals.discharge.heartRate && `Heart Rate: ${formData.vitals.discharge.heartRate}, `}
              {formData.vitals.discharge.temperature && `Temperature: ${formData.vitals.discharge.temperature}, `}
              {formData.vitals.discharge.oxygenSaturation && `Oxygen Saturation: ${formData.vitals.discharge.oxygenSaturation}, `}
              {formData.vitals.discharge.respiratoryRate && `Respiratory Rate: ${formData.vitals.discharge.respiratoryRate}`}
            </Text>
          </View>
        )}

        <ConditionalSection title="Condition on Discharge" content={formData.conditionOnDischarge} />

        {hasMedicineAdvice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medicine/Advice</Text>
            {formData.medicineAdvice.map((med, index) => (
              (med.name || med.dosage || med.duration) && (
                <Text key={index} style={styles.text}>
                  {med.name} {med.dosage && `- Dosage: ${med.dosage}`} {med.duration && `, Duration: ${med.duration}`}
                </Text>
              )
            ))}
          </View>
        )}

        <ConditionalSection title="Additional Notes" content={formData.notes} />
      </Page>
    </Document>
  );
};

export default DischargeSummaryPDF;