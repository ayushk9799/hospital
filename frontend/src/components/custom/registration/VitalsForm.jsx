import React from "react";
import { Input } from "../../ui/input";

export default function VitalsForm({ formData, handleSelectChange }) {
  const vitalFields = [
    { id: "bloodPressure", placeholder: "Blood Pressure (e.g., 120/80)" },
    { id: "temperature", placeholder: "Temperature (°C)", type: "number" },
    { id: "weight", placeholder: "Weight (kg)", type: "number" },
    { id: "height", placeholder: "Height (cm)", type: "number" },
    { id: "heartRate", placeholder: "Heart Rate (bpm)", type: "number" },
    { id: "oxygenSaturation", placeholder: "Oxygen Saturation (%)", type: "number" },
    { id: "respiratoryRate", placeholder: "Respiratory Rate", type: "number" },
  ];

  return (
    <>
      {vitalFields.map((field) => (
        <Input
          key={field.id}
          id={`visit.vitals.${field.id}`}
          type={field.type || "text"}
          placeholder={field.placeholder}
          value={formData.visit.vitals[field.id]}
          onChange={(e) => handleSelectChange(`visit.vitals.${field.id}`, e.target.value)}
        />
      ))}
    </>
  );
}