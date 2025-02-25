import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { useToast } from "../hooks/use-toast";
import MergedLabReportPDF from "../components/custom/reports/MergedLabReportPDF";
import { mergedLabReportTemplateStringExperiment } from "../../src/templatesExperiments/labtemplateExperiment";
import { mergedLabReportTemplateStringDefault } from "../../src/templates/labReportTemplate";

export default function MergeTemplatePreview() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const hospital = useSelector((state) => state.hospital.hospitalInfo);

  // Sample data for preview
  const [patientData, setPatientData] = useState({
    patientName: "John Doe",
    patientId: "PAT12345",
    age: 45,
    gender: "Male",
    labNumber: "LAB-2023-0123",
    dateOfBirth: "1978-05-15",
    contactNumber: "+1 (555) 123-4567",
    address: "123 Main Street, Anytown, USA",
    labTests: [
      { name: "Complete Blood Count", reportStatus: "Completed" },
      { name: "Liver Function Test", reportStatus: "Completed" },
      { name: "Lipid Profile", reportStatus: "Completed" },
      { name: "Thyroid Function Test", reportStatus: "Sample Collected" },
      { name: "Kidney Function Test", reportStatus: "Registered" },
    ],
    doctor: "Dr. Sarah Johnson",
    dateOfCollection: "2023-10-15T09:30:00",
    dateOfReport: "2023-10-16T14:00:00",
  });

  const [selectedReports, setSelectedReports] = useState([
    {
      name: "Complete Blood Count",
      reportId: "CBC-001",
      date: "2023-10-16",
      report: {
        hemoglobin: { 
          value: "14.5", 
          unit: "g/dL", 
          normalRange: "13.5-17.5",
          label: "Hemoglobin" 
        },
        rbc: { 
          value: "5.2", 
          unit: "mill/mm³", 
          normalRange: "4.5-5.9",
          label: "Red Blood Cells" 
        },
        wbc: { 
          value: "7500", 
          unit: "/mm³", 
          normalRange: "4000-11000",
          label: "White Blood Cells" 
        },
        platelets: {
          value: "250000",
          unit: "/mm³",
          normalRange: "150000-450000",
          label: "Platelets"
        },
        hematocrit: { 
          value: "45", 
          unit: "%", 
          normalRange: "41-50",
          label: "Hematocrit" 
        },
        mcv: { 
          value: "88", 
          unit: "fL", 
          normalRange: "80-96",
          label: "Mean Corpuscular Volume" 
        },
        mch: { 
          value: "29", 
          unit: "pg", 
          normalRange: "27-33",
          label: "Mean Corpuscular Hemoglobin" 
        },
        mchc: { 
          value: "33", 
          unit: "g/dL", 
          normalRange: "33-36",
          label: "Mean Corpuscular Hemoglobin Concentration" 
        }
      },
      interpretation: "All parameters are within normal limits.",
      technician: "Lab Tech A",
    },
    {
      name: "Liver Function Test",
      reportId: "LFT-002",
      date: "2023-10-16",
      report: {
        totalBilirubin: { 
          value: "0.8", 
          unit: "mg/dL", 
          normalRange: "0.3-1.2",
          label: "Total Bilirubin" 
        },
        directBilirubin: {
          value: "0.2",
          unit: "mg/dL",
          normalRange: "0.0-0.3",
          label: "Direct Bilirubin"
        },
        sgot: { 
          value: "32", 
          unit: "U/L", 
          normalRange: "5-40",
          label: "SGOT (AST)" 
        },
        sgpt: { 
          value: "35", 
          unit: "U/L", 
          normalRange: "7-56",
          label: "SGPT (ALT)" 
        },
        alkalinePhosphatase: {
          value: "85",
          unit: "U/L",
          normalRange: "44-147",
          label: "Alkaline Phosphatase"
        },
        totalProtein: { 
          value: "7.2", 
          unit: "g/dL", 
          normalRange: "6.0-8.3",
          label: "Total Protein" 
        },
        albumin: { 
          value: "4.5", 
          unit: "g/dL", 
          normalRange: "3.5-5.2",
          label: "Albumin" 
        }
      },
      interpretation: "Liver function tests are within normal reference range.",
      technician: "Lab Tech B",
    },
    {
      name: "Lipid Profile",
      reportId: "LP-003",
      date: "2023-10-16",
      report: {
        totalCholesterol: { 
          value: "185", 
          unit: "mg/dL", 
          normalRange: "<200",
          label: "Total Cholesterol" 
        },
        triglycerides: { 
          value: "120", 
          unit: "mg/dL", 
          normalRange: "<150",
          label: "Triglycerides" 
        },
        hdlCholesterol: { 
          value: "45", 
          unit: "mg/dL", 
          normalRange: ">40",
          label: "HDL Cholesterol" 
        },
        ldlCholesterol: { 
          value: "116", 
          unit: "mg/dL", 
          normalRange: "<130",
          label: "LDL Cholesterol" 
        },
        vldlCholesterol: { 
          value: "24", 
          unit: "mg/dL", 
          normalRange: "<30",
          label: "VLDL Cholesterol" 
        },
        cholesterolRatio: { 
          value: "4.1", 
          unit: "", 
          normalRange: "<4.5",
          label: "Cholesterol Ratio" 
        }
      },
      interpretation: "Lipid profile within acceptable ranges.",
      technician: "Lab Tech C",
    }
  ]);

//   const handleSaveTemplate = () => {
//     dispatch(
//       updateTemplate({
//         mergeTemplate: mergedLabReportTemplateStringExperiment,
//       })
//     )
//       .then(() => {
//         toast({
//           title: "Success",
//           description: "Merge template saved successfully",
//           variant:"success"
//         });
//       })
//       .catch((error) => {
//         console.error("Error saving template:", error);
//         toast({
//           title: "Error",
//           description: "Failed to save template",
//           variant: "destructive",
//         });
//       });
//   };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            Merge Template Preview
          </h1>
          {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
        </div>
      </div>
      <div className="flex justify-center bg-gray-100  min-h-[calc(100vh-200px)] overflow-auto border-2 ">
        <div className="bg-white shadow-lg relative p-2">
          <MergedLabReportPDF
            reportsData={selectedReports}
            patientData={patientData}
            hospital={hospital}
          />
        </div>
      </div>
    </div>
  );
}
