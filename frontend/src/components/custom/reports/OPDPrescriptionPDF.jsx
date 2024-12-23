import React from "react";
import { format } from "date-fns";
import HospitalHeader from "../../../utils/print/HospitalHeader";

const OPDPrescriptionPDF = React.forwardRef((props, ref) => {
  const { patient, vitals, prescription, labTests, selectedComorbidities, hospital } = props;

  

  // Return early with a div if essential props are missing
  if (!patient || !vitals || !prescription) {
   
    return <div ref={ref}>No data available for printing</div>;
  }

  const capitalizeAll = (str) => {
    return str?.toUpperCase() || '';
  };

  const VitalItem = ({ label, value, unit }) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    return (
      <div className="vital-item">
        <div className="vital-inner">
          <span className="vital-label">
            {label === "O2" ? (
              <>
                O<sub>2</sub>%
              </>
            ) : (
              capitalizeAll(label)
            )}:
          </span>
          <span className="vital-value">
            {value} {unit}
          </span>
        </div>
      </div>
    );
  };

  const vitalItems = [
    { label: "Temperature", value: vitals.temperature, unit: "°C" },
    { label: "Heart Rate", value: vitals.heartRate, unit: "bpm" },
    { label: "Blood Pressure", value: vitals.bloodPressure, unit: "mmHg" },
    { label: "Respiratory Rate", value: vitals.respiratoryRate, unit: "bpm" },
    { label: "Height", value: vitals.height, unit: "cm" },
    { label: "Weight", value: vitals.weight, unit: "kg" },
    { label: "BMI", value: vitals.bmi, unit: "" },
    { label: "O2", value: vitals.oxygenSaturation, unit: "%" },
  ];

  const presentVitals = vitalItems.filter(item => 
    item.value !== undefined && item.value !== null && item.value !== ''
  );

  return (
    <div ref={ref} className="prescription-container">
      

      <HospitalHeader hospitalInfo={hospital} />

      <div className="title-container">
        <div></div>
        <h1 className="title">OPD Prescription</h1>
        <div className="date">{format(new Date(), "dd/MM/yyyy")}</div>
      </div>

      <div className="patient-info">
        <div className="info-row">
          <span className="label">Name:</span>
          <span className="value">{patient?.name || ''}</span>
        </div>
        <div className="info-row">
          <span className="label">Age/Sex:</span>
          <span className="value">{patient?.age || ''}/{patient?.gender || ''}</span>
        </div>
        <div className="info-row">
          <span className="label">Patient ID:</span>
          <span className="value">{patient?.patientId || ''}</span>
        </div>
        <div className="info-row">
          <span className="label">Contact:</span>
          <span className="value">{patient?.contact || ''}</span>
        </div>
      </div>

      {presentVitals.length > 0 && (
        <div className="section">
          <div className="section-title">Vitals</div>
          <div className="vitals-container">
            {presentVitals.map((item, index) => (
              <VitalItem key={index} {...item} />
            ))}
          </div>
        </div>
      )}

      {prescription?.chiefComplaints && (
        <div className="section">
          <div className="section-title">Chief Complaints</div>
          <div className="section-content">{prescription.chiefComplaints}</div>
        </div>
      )}

      {prescription?.diagnosis && (
        <div className="section">
          <div className="section-title">Diagnosis</div>
          <div className="section-content">{prescription.diagnosis}</div>
        </div>
      )}

      {selectedComorbidities?.length > 0 && (
        <div className="section">
          <div className="section-title">Comorbidities</div>
          {selectedComorbidities.map((comorbidity, index) => (
            <div key={index} className="section-content">{comorbidity}</div>
          ))}
        </div>
      )}

      {prescription?.medications?.length > 0 && (
        <div className="section">
          <div className="section-title">Medications</div>
          <div className="medications-list">
            {prescription.medications.map((medication, index) => (
              <div key={index} className="medication-row">
                <span>{index + 1}.</span>
                <span>{medication.name}</span>
                <span>{medication.frequency}</span>
                <span>{medication.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prescription?.advice && (
        <div className="section">
          <div className="section-title">Advice</div>
          <div className="section-content">{prescription.advice}</div>
        </div>
      )}

      {labTests?.length > 0 && (
        <div className="section">
          <div className="section-title">Lab Tests</div>
          <div className="section-content">{labTests.join(', ')}</div>
        </div>
      )}

      {prescription?.followUp && (
        <div className="section">
          <div className="section-title">Follow Up</div>
          <div className="section-content">{prescription.followUp}</div>
        </div>
      )}

      <div className="doctor-signature">Doctor's Signature</div>
    </div>
  );
});

export default OPDPrescriptionPDF;