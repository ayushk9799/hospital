import React, { useCallback } from "react";
import MemoizedInput from "./MemoizedInput";

export default function VitalsForm({ formData, handleSelectChange }) {
  const handleVitalChange = useCallback((e) => {
    const { id, value } = e.target;
    handleSelectChange(`visit.vitals.${id}`, value);
  }, [handleSelectChange]);

  const vitalFields = [
    { id: "bloodPressure", label: "Blood Pressure (e.g., 120/80)" },
    { id: "temperature", label: "Temperature (°C)", type: "number" },
    { id: "weight", label: "Weight (kg)", type: "number" },
    { id: "height", label: "Height (cm)", type: "number" },
    { id: "heartRate", label: "Heart Rate (bpm)", type: "number" },
    { id: "oxygenSaturation", label: "Oxygen Saturation (%)", type: "number" },
    { id: "respiratoryRate", label: "Respiratory Rate", type: "number" },
  ];

  return (
    <>
      {vitalFields.map((field) => (
        <MemoizedInput
          key={field.id}
          id={field.id}
          label={field.label}
          type={field.type || "text"}
          value={formData.visit.vitals[field.id]}
          onChange={handleVitalChange}
        />
      ))}
    </>
  );
}