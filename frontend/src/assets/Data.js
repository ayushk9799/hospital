import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, subMonths, isBefore } from "date-fns";
import { cn } from "../lib/utils";

// backend url
export const Backend_URL = "http://localhost:3000";

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export const permissionGroups = {
  "Patient Management": [
    { id: "create_patients", label: "Create Patients" },
    { id: "delete_patients", label: "Delete Patients" },
  ],
  "Inventory Management": [
    { id: "edit_inventory_price", label: "Edit Prices" },
  ],
  "Financial Management": [
    { id: "view_financial", label: "View Financial Data" },

    { id: "edit_bills", label: "Edit Bills" },
    { id: "delete_bills", label: "Delete Bills" },
    { id: "view_reports", label: "View Reports" },
  ],

  "Staff Management": [
    { id: "view_staff", label: "View Staff" },
    { id: "create_staff", label: "Create Staff" },
    { id: "edit_staff", label: "Edit Staff" },
    { id: "delete_staff", label: "Delete Staff" },
  ],
  "Hospital Management": [{ id: "edit_hospital", label: "Edit Hospital" }],
};

export const DateRangePicker = ({ from, to, onSelect, onSearch, onCancel }) => {
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    onSearch();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel();
    setOpen(false);
  };

  const today = new Date();
  const lastMonth = subMonths(today, 1);

  return (
    <div className={cn("grid gap-2")}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
                </>
              ) : (
                format(from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={lastMonth}
            selected={{ from, to }}
            onSelect={onSelect}
            numberOfMonths={2}
            disabled={(date) => isBefore(today, date)}
            toDate={today}
          />
          <div className="flex justify-end gap-2 p-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const convertFilterToDateRange = (filter) => {
  const today = new Date();
  let from, to;

  switch (filter) {
    case "Today":
      from = new Date(today.setHours(0, 0, 0, 0));
      to = new Date(today.setHours(23, 59, 59, 999));
      break;
    case "Yesterday":
      from = new Date(today.setDate(today.getDate() - 1));
      from.setHours(0, 0, 0, 0);
      to = new Date(from);
      to.setHours(23, 59, 59, 999);
      break;
    case "This Week":
      from = new Date(today.setDate(today.getDate() - today.getDay()));
      from.setHours(0, 0, 0, 0);
      to = new Date(today.setDate(from.getDate() + 6));
      to.setHours(23, 59, 59, 999);
      break;
    case "This Month":
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      to.setHours(23, 59, 59, 999);
      break;
    case "Last 7 Days":
      from = new Date(today.setDate(today.getDate() - 6));
      from.setHours(0, 0, 0, 0);
      to = new Date();
      to.setHours(23, 59, 59, 999);
      break;
    default:
      from = new Date(today.setDate(today.getDate() - 30));
      to = new Date();
  }

  // Add this log
  return { from, to };
};

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Avoid division by zero
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  return Number(change.toFixed(2)); // Round to 2 decimal places
};

export const convertTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(":");
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${hour}:${minutes} ${ampm}`;
};

export const labCategories = [
  {
    name: "Hematology",
    description: "Blood cell counts and related tests",
    types: [
      "Complete Blood Count (CBC)",
      "Erythrocyte Sedimentation Rate",
      "Peripheral Blood Smear",
      "Reticulocyte Count",
      "Coagulation Profile",
      "Hemoglobin Electrophoresis",
     
    ],
  },
  {
    name: "Biochemistry",
    description: "Chemical analysis of blood and other body fluids",
    types: [
      "Lipid Profile",
      "Liver Function Tests",
      "Kidney Function Tests",
      "Electrolytes",
      "Calcium Profile",
      "Iron Studies",
    ],
  },
  {
    name: "Endocrinology",
    description: "Hormone-related tests",
    types: [
      "Thyroid Function Tests",
      "Diabetes Tests",
      "Reproductive Hormones",
      "Cortisol",
    ],
  },
  {
    name: "Serology",
    description: "Tests related to the immune system",
    types: [
      "C-Reactive Protein (CRP)",
      "Rheumatoid Factor (RF)",
      "Anti-Streptolysin O (ASO)",
      "Hepatitis Markers",
      "HIV",
      "VDRL",
    ],
  },
  {
    name: "Microbiology",
    description: "Tests for infectious diseases",
    types: [
      "Urine Culture",
      "Stool Culture",
      "Blood Culture",
      "Sputum Culture",
    ],
  },
  {
    name: "Immunology",
    description: "Tests related to the immune system",
    types: ["Antinuclear Antibodies (ANA)", "Anti-dsDNA", "Complement Levels"],
  },
  {
    name: "Tumor Markers",
    description: "Tests for detecting cancer",
    types: [
      "Prostate Specific Antigen (PSA)",
      "Carcinoembryonic Antigen (CEA)",
      "Cancer Antigen 125 (CA-125)",
      "Alpha-Fetoprotein (AFP)",
    ],
  },
  {
    name: "Urine Analysis",
    description: "Analysis of urine samples",
    types: ["Routine Urine"],
  },
  {
    name: "Stool Analysis",
    description: "Analysis of stool samples",
    types: ["Routine Stool"],
  },
  {
    name: "Blood Typing",
    description: "Blood group, Rh factor, and related tests",
    types: [
      "ABO and Rh Typing",
      "Australian Antigen",
      "Antibody Screening",
    ],
  },
  {
    name: "Radiology",
    description: "Imaging studies and reports",
    types: [
      "CT Scan",
      "MRI",
      "Ultrasonography Whole Abdomen",
      "X-Ray",
      "IVP (Intravenous Pyelogram)",
      "CT KUB",
      "PET Scan",
      "Mammography",
      "Bone Densitometry (DEXA)",
      "Angiography",
    ],
  },
  {
    name: "Histopathology",
    description: "Microscopic examination of tissue samples",
    types: [
      "FNAC (Fine Needle Aspiration Cytology)",
      "Skin Biopsy",
      "Liver Biopsy",
      "Prostate Biopsy",
      "Breast Biopsy",
      "Kidney Biopsy",
      "Bone Marrow Biopsy",
      "Lymph Node Biopsy",
      "Endometrial Biopsy",
      "Muscle Biopsy",
      "Nerve Biopsy",
      "Frozen Section",
      "Pap Smear",
      "Immunohistochemistry",
      "Surgical Pathology",
      "Cytology"
    ],
  },
];
export const labReportFields = {
  hematology: {
    "Complete Blood Count (CBC)": [
      {
        name: "wbc",
        label: "White Blood Cell Count (WBC)",
        unit: "10^3/µL",
        normalRange: "4.5-11.0",
      },
      {
        name: "rbc",
        label: "Red Blood Cell Count (RBC)",
        unit: "10^6/µL",
        normalRange: "4.5-5.9 (male), 4.1-5.1 (female)",
      },
      {
        name: "hemoglobin",
        label: "Hemoglobin (Hgb)",
        unit: "g/dL",
        normalRange: "13.5-17.5 (male), 12.0-15.5 (female)",
      },
      {
        name: "hematocrit",
        label: "Hematocrit (Hct)",
        unit: "%",
        normalRange: "41-53 (male), 36-46 (female)",
      },
      {
        name: "mcv",
        label: "Mean Corpuscular Volume (MCV)",
        unit: "fL",
        normalRange: "80-100",
      },
      {
        name: "mch",
        label: "Mean Corpuscular Hemoglobin (MCH)",
        unit: "pg",
        normalRange: "27-31",
      },
      {
        name: "mchc",
        label: "Mean Corpuscular Hemoglobin Concentration (MCHC)",
        unit: "g/dL",
        normalRange: "32-36",
      },
      {
        name: "rdw",
        label: "Red Cell Distribution Width (RDW)",
        unit: "%",
        normalRange: "11.5-14.5",
      },
      {
        name: "platelets",
        label: "Platelet Count",
        unit: "10^3/µL",
        normalRange: "150-450",
      },
      {
        name: "mpv",
        label: "Mean Platelet Volume (MPV)",
        unit: "fL",
        normalRange: "7.5-11.5",
      },
      {
        name: "neutrophils",
        label: "Neutrophils",
        unit: "%",
        normalRange: "40-60",
      },
      {
        name: "lymphocytes",
        label: "Lymphocytes",
        unit: "%",
        normalRange: "20-40",
      },
      { name: "monocytes", label: "Monocytes", unit: "%", normalRange: "2-8" },
      {
        name: "eosinophils",
        label: "Eosinophils",
        unit: "%",
        normalRange: "1-4",
      },
      {
        name: "basophils",
        label: "Basophils",
        unit: "%",
        normalRange: "0.5-1",
      },
      {
        name: "abs_neutrophils",
        label: "Absolute Neutrophils",
        unit: "10^3/µL",
        normalRange: "2.0-7.0",
      },
      {
        name: "abs_lymphocytes",
        label: "Absolute Lymphocytes",
        unit: "10^3/µL",
        normalRange: "1.0-3.0",
      },
      {
        name: "abs_monocytes",
        label: "Absolute Monocytes",
        unit: "10^3/µL",
        normalRange: "0.2-1.0",
      },
      {
        name: "abs_eosinophils",
        label: "Absolute Eosinophils",
        unit: "10^3/µL",
        normalRange: "0.02-0.5",
      },
      {
        name: "abs_basophils",
        label: "Absolute Basophils",
        unit: "10^3/µL",
        normalRange: "0.02-0.1",
      },
    ],
    "Erythrocyte Sedimentation Rate": [
      {
        name: "esr",
        label: "ESR",
        unit: "mm/hr",
        normalRange: "0-22 (male), 0-29 (female)",
      },
    ],
    "Peripheral Blood Smear": [
      {
        name: "rbc_morphology",
        label: "RBC Morphology",
        unit: "",
        normalRange: "Normal",
        options: [
          "Normal",
          "Microcytic",
          "Macrocytic",
          "Hypochromic",
          "Target cells",
          "Sickle cells",
          "Other abnormalities",
        ],
      },
      {
        name: "wbc_morphology",
        label: "WBC Morphology",
        unit: "",
        normalRange: "Normal",
        options: [
          "Normal",
          "Left shift",
          "Toxic granulation",
          "Hypersegmented neutrophils",
          "Atypical lymphocytes",
          "Blasts",
          "Other abnormalities",
        ],
      },
      {
        name: "platelet_morphology",
        label: "Platelet Morphology",
        unit: "",
        normalRange: "Normal",
        options: [
          "Normal",
          "Large platelets",
          "Platelet clumps",
          "Other abnormalities",
        ],
      },
    ],
    "Reticulocyte Count": [
      {
        name: "reticulocyte_count",
        label: "Reticulocyte Count",
        unit: "%",
        normalRange: "0.5-2.5",
      },
    ],
    "Coagulation Profile": [
      {
        name: "pt",
        label: "Prothrombin Time (PT)",
        unit: "seconds",
        normalRange: "11-13.5",
      },
      {
        name: "inr",
        label: "International Normalized Ratio (INR)",
        unit: "",
        normalRange: "0.8-1.1",
      },
      {
        name: "aptt",
        label: "Activated Partial Thromboplastin Time (APTT)",
        unit: "seconds",
        normalRange: "30-40",
      },
      {
        name: "fibrinogen",
        label: "Fibrinogen",
        unit: "mg/dL",
        normalRange: "200-400",
      },
      {
        name: "d_dimer",
        label: "D-dimer",
        unit: "ng/mL",
        normalRange: "<500",
      },
      {
        name: "protein_c",
        label: "Protein C Activity",
        unit: "%",
        normalRange: "70-140",
      },
      {
        name: "protein_s",
        label: "Protein S Activity",
        unit: "%",
        normalRange: "65-140",
      },
      {
        name: "antithrombin_iii",
        label: "Antithrombin III",
        unit: "%",
        normalRange: "80-120",
      },
      {
        name:"bt",
        label:"Bleeding Time",
        unit:"seconds",
        normalRange:"2-7",
      },
      {
        name:"ct",
        label:"Clotting Time",
        unit:"seconds",
        normalRange:"4-10",
      }
    ],
    "Hemoglobin Electrophoresis": [
      { name: "hb_a", label: "Hemoglobin A", unit: "%", normalRange: "95-98" },
      {
        name: "hb_a2",
        label: "Hemoglobin A2",
        unit: "%",
        normalRange: "1.5-3.5",
      },
      { name: "hb_f", label: "Hemoglobin F", unit: "%", normalRange: "<2" },
    ],
   
  },
  biochemistry: {
    "Lipid Profile": [
      {
        name: "total_cholesterol",
        label: "Total Cholesterol",
        unit: "mg/dL",
        normalRange: "<200",
      },
      {
        name: "ldl",
        label: "LDL Cholesterol",
        unit: "mg/dL",
        normalRange: "<100",
      },
      {
        name: "hdl",
        label: "HDL Cholesterol",
        unit: "mg/dL",
        normalRange: ">60",
      },
      {
        name: "triglycerides",
        label: "Triglycerides",
        unit: "mg/dL",
        normalRange: "<150",
      },
      {
        name: "vldl",
        label: "VLDL Cholesterol",
        unit: "mg/dL",
        normalRange: "<30",
      },
      {
        name: "cholesterol_hdl_ratio",
        label: "Cholesterol/HDL Ratio",
        unit: "",
        normalRange: "<3.5",
      },
    ],
    "Liver Function Tests": [
      {
        name: "total_bilirubin",
        label: "Total Bilirubin",
        unit: "mg/dL",
        normalRange: "0.3-1.2",
      },
      {
        name: "direct_bilirubin",
        label: "Direct Bilirubin",
        unit: "mg/dL",
        normalRange: "0.0-0.3",
      },
      { name: "sgpt", label: "SGPT (ALT)", unit: "U/L", normalRange: "7-56" },
      { name: "sgot", label: "SGOT (AST)", unit: "U/L", normalRange: "10-40" },
      {
        name: "alkaline_phosphatase",
        label: "Alkaline Phosphatase",
        unit: "U/L",
        normalRange: "44-147",
      },
      {
        name: "total_proteins",
        label: "Total Proteins",
        unit: "g/dL",
        normalRange: "6.0-8.3",
      },
      {
        name: "albumin",
        label: "Albumin",
        unit: "g/dL",
        normalRange: "3.5-5.0",
      },
      {
        name: "globulin",
        label: "Globulin",
        unit: "g/dL",
        normalRange: "2.3-3.5",
      },
      {
        name: "ag_ratio",
        label: "A/G Ratio",
        unit: "",
        normalRange: "1.2-2.2",
      },
    ],
  "Kidney Function Tests": [
  {
    "name": "urea",
    "label": "Blood Urea",
    "unit": "mg/dL",
    "normalRange": "13-43"
  },
  {
    "name": "urea_nitrogen",
    "label": "Urea Nitrogen (Blood)",
    "unit": "mg/dL",
    "normalRange": "6-20"
  },
  {
    "name": "bun_creatinine_ratio",
    "label": "BUN/Creatinine Ratio",
    "unit": "",
    "normalRange": "6-22"
  },
  {
    "name": "creatinine",
    "label": "Serum Creatinine",
    "unit": "mg/dL",
    "normalRange": "0.55-1.02"
  },
  {
    "name": "gfr",
    "label": "Estimated Glomerular Filtration Rate (eGFR)",
    "unit": "mL/min/1.73m²",
    "normalRange": ">90"
  },
  {
    "name": "gfr_category",
    "label": "GFR Category",
    "unit": "",
    "normalRange": "G1-G2: Normal to mild decrease; G3a-G5 for progressive stages"
  },
  {
    "name": "uric_acid",
    "label": "Uric Acid",
    "unit": "mg/dL",
    "normalRange": "2.60-6.00"
  },
  {
    "name": "total_protein",
    "label": "Total Protein",
    "unit": "g/dL",
    "normalRange": "5.70-8.20"
  },
  {
    "name": "albumin",
    "label": "Albumin",
    "unit": "g/dL",
    "normalRange": "3.20-4.80"
  },
  {
    "name": "a_g_ratio",
    "label": "Albumin/Globulin Ratio (A:G Ratio)",
    "unit": "",
    "normalRange": "0.90-2.00"
  },
  {
    "name": "globulin",
    "label": "Globulin (Calculated)",
    "unit": "g/dL",
    "normalRange": ""
  },
  {
    "name": "calcium",
    "label": "Calcium (Total)",
    "unit": "mg/dL",
    "normalRange": "8.70-10.40"
  },
  {
    "name": "phosphorus",
    "label": "Phosphorus",
    "unit": "mg/dL",
    "normalRange": "2.40-5.10"
  },
  {
    "name": "sodium",
    "label": "Sodium",
    "unit": "mEq/L",
    "normalRange": "136-145"
  },
  {
    "name": "potassium",
    "label": "Potassium",
    "unit": "mEq/L",
    "normalRange": "3.50-5.10"
  },
  {
    "name": "chloride",
    "label": "Chloride",
    "unit": "mEq/L",
    "normalRange": "98-107"
  }
]
,
    Electrolytes: [
      {
        name: "sodium",
        label: "Sodium",
        unit: "mEq/L",
        normalRange: "135-145",
      },
      {
        name: "potassium",
        label: "Potassium",
        unit: "mEq/L",
        normalRange: "3.5-5.0",
      },
      {
        name: "chloride",
        label: "Chloride",
        unit: "mEq/L",
        normalRange: "98-106",
      },
      {
        name: "bicarbonate",
        label: "Bicarbonate",
        unit: "mEq/L",
        normalRange: "22-28",
      },
      {name:"calcium_electrolyte",label:"Calcium",unit:"mg/dL",normalRange:"8.5-10.5"},
      {name:"magnesium",label:"Magnesium",unit:"mg/dL",normalRange:"1.8-2.3"},
    ],
    "Calcium Profile": [
      {
        name: "total_calcium",
        label: "Total Calcium",
        unit: "mg/dL",
        normalRange: "8.5-10.5",
      },
      {
        name: "ionized_calcium",
        label: "Ionized Calcium",
        unit: "mg/dL",
        normalRange: "4.5-5.3",
      },
    ],
    "Iron Studies": [
      {
        name: "serum_iron",
        label: "Serum Iron",
        unit: "µg/dL",
        normalRange: "60-170",
      },
      {
        name: "tibc",
        label: "Total Iron Binding Capacity (TIBC)",
        unit: "µg/dL",
        normalRange: "240-450",
      },
      {
        name: "ferritin",
        label: "Ferritin",
        unit: "ng/mL",
        normalRange: "20-250",
      },
    ],
  },
  endocrinology: {
    "Thyroid Function Tests": [
      { name: "t3", label: "T3", unit: "ng/dL", normalRange: "80-200" },
      { name: "t4", label: "T4", unit: "µg/dL", normalRange: "5.1-14.1" },
      { name: "tsh", label: "TSH", unit: "µIU/mL", normalRange: "0.4-4.0" },
    ],
    "Diabetes Tests": [
      {
        name: "fasting_glucose",
        label: "Fasting Glucose",
        unit: "mg/dL",
        normalRange: "70-100",
      },
      {
        name: "pp_glucose",
        label: "Post Prandial Glucose",
        unit: "mg/dL",
        normalRange: "<140",
      },
      { name: "hba1c", label: "HbA1c", unit: "%", normalRange: "<5.7" },
      {
        name: "sugar",
        label: "Blood Sugar",
        unit: "mg/dL",
        normalRange: "100-125",
      },
    ],
    "Reproductive Hormones": [
      {
        name: "fsh",
        label: "Follicle Stimulating Hormone (FSH)",
        unit: "mIU/mL",
        normalRange: "Varies with menstrual cycle",
      },
      {
        name: "lh",
        label: "Luteinizing Hormone (LH)",
        unit: "mIU/mL",
        normalRange: "Varies with menstrual cycle",
      },
      {
        name: "prolactin",
        label: "Prolactin",
        unit: "ng/mL",
        normalRange: "2-29",
      },
      {
        name: "testosterone",
        label: "Testosterone",
        unit: "ng/dL",
        normalRange: "270-1070 (male), 15-70 (female)",
      },
    ],
    Cortisol: [
      {
        name: "morning_cortisol",
        label: "Morning Cortisol",
        unit: "µg/dL",
        normalRange: "6-23",
      },
    ],
  },
  serology: {
    "C-Reactive Protein (CRP)": [
      {
        name: "crp",
        label: "C-Reactive Protein (CRP)",
        unit: "mg/L",
        normalRange: "<3.0",
      },
    ],
    "Rheumatoid Factor (RF)": [
      {
        name: "ra_factor",
        label: "Rheumatoid Factor (RF)",
        unit: "IU/mL",
        normalRange: "<14",
        options: [
          "Negative",
          "Weakly Positive",
          "Positive",
          "Strongly Positive",
        ],
      },
    ],
    "Anti-Streptolysin O (ASO)": [
      {
        name: "aso",
        label: "Anti-Streptolysin O (ASO)",
        unit: "IU/mL",
        normalRange: "<200",
        options: ["Negative", "Positive"],
      },
    ],
    "Hepatitis Markers": [
      {
        name: "hbsag",
        label: "Hepatitis B Surface Antigen (HBsAg)",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
      {
        name: "anti_hcv",
        label: "Anti-HCV",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
    ],
    HIV: [
      {
        name: "hiv_1_2",
        label: "Elisa for HIV 1 & 2",
        unit: "",
        normalRange: "Non-reactive",
        options: ["Non-reactive", "Reactive"],
      },
      {
        name: "hiv_non_hcv",
        label: "Elisa Non-HCV",
        unit: "",
        normalRange: "Non-reactive",
        options: ["Non-reactive", "Reactive"],
      },
    ],
    VDRL: [
      {
        name: "vdrl",
        label: "VDRL",
        unit: "",
        normalRange: "Non-reactive",
        options: ["Non-reactive", "Reactive"],
      },
    ],
  },
  microbiology: {
    "Urine Culture": [
      {
        name: "organism",
        label: "Organism",
        unit: "",
        normalRange: "No growth",
        options: [
          "No growth",
          "E. coli",
          "Klebsiella",
          "Proteus",
          "Enterococcus",
          "Pseudomonas",
          "Candida",
          "Other",
        ],
      },
      {
        name: "colony_count",
        label: "Colony Count",
        unit: "CFU/mL",
        normalRange: "<10,000",
      },
    ],
    "Stool Culture": [
      {
        name: "organism",
        label: "Organism",
        unit: "",
        normalRange: "No pathogenic organism isolated",
        options: [
          "No pathogenic organism isolated",
          "Salmonella",
          "Shigella",
          "Campylobacter",
          "E. coli O157:H7",
          "Other",
        ],
      },
    ],
    "Blood Culture": [
      {
        name: "organism",
        label: "Organism",
        unit: "",
        normalRange: "No growth",
        options: [
          "No growth",
          "Staphylococcus aureus",
          "Streptococcus pneumoniae",
          "E. coli",
          "Klebsiella",
          "Pseudomonas",
          "Candida",
          "Other",
        ],
      },
      {
        name: "antibiotic_sensitivity",
        label: "Antibiotic Sensitivity",
        unit: "",
        normalRange: "N/A",
      },
    ],
    "Sputum Culture": [
      {
        name: "organism",
        label: "Organism",
        unit: "",
        normalRange: "Normal respiratory flora",
        options: [
          "Normal respiratory flora",
          "Streptococcus pneumoniae",
          "Haemophilus influenzae",
          "Moraxella catarrhalis",
          "Pseudomonas aeruginosa",
          "Mycobacterium tuberculosis",
          "Other",
        ],
      },
      {
        name: "antibiotic_sensitivity",
        label: "Antibiotic Sensitivity",
        unit: "",
        normalRange: "N/A",
      },
    ],
  },
  immunology: {
    "Antinuclear Antibodies (ANA)": [
      {
        name: "ana",
        label: "Antinuclear Antibodies (ANA)",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
    ],
    "Anti-dsDNA": [
      {
        name: "anti_dsdna",
        label: "Anti-dsDNA",
        unit: "IU/mL",
        normalRange: "<30",
      },
    ],
    "Complement Levels": [
      {
        name: "c3",
        label: "Complement C3",
        unit: "mg/dL",
        normalRange: "90-180",
      },
      {
        name: "c4",
        label: "Complement C4",
        unit: "mg/dL",
        normalRange: "10-40",
      },
    ],
  },
  "tumor-markers": {
    "Prostate Specific Antigen (PSA)": [
      {
        name: "psa",
        label: "Sr Prostate Specific Antigen (PSA)",
        unit: "ng/mL",
        normalRange: "<4",
      },
    ],
    "Carcinoembryonic Antigen (CEA)": [
      {
        name: "cea",
        label: "Carcinoembryonic Antigen (CEA)",
        unit: "ng/mL",
        normalRange: "<3 (non-smokers), <5 (smokers)",
      },
    ],
    "Cancer Antigen 125 (CA-125)": [
      {
        name: "ca_125",
        label: "Cancer Antigen 125 (CA-125)",
        unit: "U/mL",
        normalRange: "<35",
      },
    ],
    "Alpha-Fetoprotein (AFP)": [
      {
        name: "afp",
        label: "Alpha-Fetoprotein (AFP)",
        unit: "ng/mL",
        normalRange: "<10",
      },
    ],
  },
  "urine-analysis": {
    "Routine Urine": [
      {
        name: "color",
        label: "Color",
        unit: "",
        normalRange: "Pale yellow to amber",
        options: ["Pale yellow", "Yellow", "Amber", "Red", "Brown", "Other"],
      },
      {
        name: "appearance",
        label: "Appearance",
        unit: "",
        normalRange: "Clear",
        options: ["Clear", "Slightly cloudy", "Cloudy", "Turbid"],
      },
      {
        name: "specific_gravity",
        label: "Specific Gravity",
        unit: "",
        normalRange: "1.005-1.030",
      },
      { name: "ph", label: "pH", unit: "", normalRange: "4.5-8" },
      {
        name: "protein",
        label: "Protein",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
      },
      {
        name: "glucose",
        label: "Glucose",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
      },
      {
        name: "ketones",
        label: "Ketones",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Trace", "Small", "Moderate", "Large"],
      },
      {
        name: "blood",
        label: "Blood",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Trace", "1+", "2+", "3+"],
      },
      {
        name: "leukocyte_esterase",
        label: "Leukocyte Esterase",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Trace", "Small", "Moderate", "Large"],
      },
      {
        name: "nitrite",
        label: "Nitrite",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
    ],
  },
  "stool-analysis": {
    "Routine Stool": [
      {
        name: "color",
        label: "Color",
        unit: "",
        normalRange: "Brown",
        options: [
          "Brown",
          "Yellow",
          "Green",
          "Black",
          "Red",
          "Clay-colored",
          "Other",
        ],
      },
      {
        name: "consistency",
        label: "Consistency",
        unit: "",
        normalRange: "Formed",
        options: ["Formed", "Soft", "Loose", "Watery", "Mucoid"],
      },
      {
        name: "occult_blood",
        label: "Occult Blood",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
      {
        name: "wbc",
        label: "White Blood Cells",
        unit: "/HPF",
        normalRange: "0-5",
      },
      {
        name: "rbc",
        label: "Red Blood Cells",
        unit: "/HPF",
        normalRange: "0-5",
      },
    ],
  },
  "blood-typing": {
    "ABO and Rh Typing": [
      {
        name: "blood_group",
        label: "Blood Group",
        unit: "",
        normalRange: "A, B, AB, or O",
        options: ["A", "B", "AB", "O"],
      },
      {
        name: "rh_factor",
        label: "Rh Factor",
        unit: "",
        normalRange: "Positive or Negative",
        options: ["Positive", "Negative"],
      },
    ],
    "Australian Antigen": [
      {
        name: "hbsag",
        label: "Australian Antigen",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
    ],
    "Antibody Screening": [
      {
        name: "antibody_screen",
        label: "Antibody Screen",
        unit: "",
        normalRange: "Negative",
        options: ["Negative", "Positive"],
      },
      {
        name: "antibody_identification",
        label: "Antibody Identification",
        unit: "",
        normalRange: "None detected",
      },
    ],
  },
  radiology: {
    "CT Scan": [
      { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
      {
        name: "contrast_used",
        label: "Contrast Used",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    MRI: [
      { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
      {
        name: "sequence_used",
        label: "Sequences Used",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    "Ultrasonography Whole Abdomen": [
  {
    name: "liver",
    label: "Liver",
    unit: "",
    normalRange: ""
  },
  {
    name: "gallbladder",
    label: "Gallbladder",
    unit: "",
    normalRange: ""
  },
  {
    name: "cbd",
    label: "Common Bile Duct (CBD)",
    unit: "",
    normalRange: ""
  },
  {
    name: "pancreas",
    label: "Pancreas",
    unit: "",
    normalRange: ""
  },
  {
    name: "spleen",
    label: "Spleen",
    unit: "",
    normalRange: ""
  },
  {
    name: "kidneys",
    label: "Kidneys",
    unit: "",
    normalRange: ""
  },
  {
    name: "urinary_bladder",
    label: "Urinary Bladder",
    unit: "",
    normalRange: ""
  },
  {
    name: "retroperitoneum",
    label: "Retroperitoneum",
    unit: "",
    normalRange: ""
  },
  {
    name: "stomach_bowel",
    label: "Stomach and Bowel Loops",
    unit: "",
    normalRange: ""
  },
  {
    name: "pelvis",
    label: "Pelvis",
    unit: "",
    normalRange: ""
  },
  {
    name:"prostate",
    label:"Prostate",
    unit:"",
    normalRange:""
  },
  {
    name: "ascites_peritoneum",
    label: "Ascites and Peritoneum",
    unit: "",
    normalRange: ""
  },
  {
    name: "abdominal_wall",
    label: "Abdominal Wall",
    unit: "",
    normalRange: ""
  },
  {
    name:"findings",
    label:"Findings",
    unit:"",
    normalRange:""
  },
  {
    name: "impression",
    label: "Impression",
    unit: "",
    normalRange: ""
  }
],
    "X-Ray": [
      { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
      { name: "view", label: "View", unit: "", normalRange: "N/A" },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    "IVP (Intravenous Pyelogram)": [
      {
        name: "contrast_used",
        label: "Contrast Used",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "kidney_function",
        label: "Kidney Function",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "ureter_visibility",
        label: "Ureter Visibility",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "bladder_appearance",
        label: "Bladder Appearance",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    "CT KUB": [
      {
        name: "kidney_appearance",
        label: "Kidney Appearance",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "ureter_status",
        label: "Ureter Status",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "bladder_appearance",
        label: "Bladder Appearance",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "calculi_presence",
        label: "Calculi Presence",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    "PET Scan": [
      {
        name: "radiopharmaceutical",
        label: "Radiopharmaceutical Used",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "uptake_areas",
        label: "Areas of Uptake",
        unit: "",
        normalRange: "N/A",
      },
      { name: "suv_max", label: "SUV Max", unit: "", normalRange: "N/A" },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    Mammography: [
      {
        name: "breast_composition",
        label: "Breast Composition",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "mass_presence",
        label: "Mass Presence",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "calcifications",
        label: "Calcifications",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "birads_category",
        label: "BIRADS Category",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    "Bone Densitometry (DEXA)": [
      {
        name: "lumbar_spine_bmd",
        label: "Lumbar Spine BMD",
        unit: "g/cm²",
        normalRange: "N/A",
      },
      {
        name: "lumbar_spine_tscore",
        label: "Lumbar Spine T-score",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "femoral_neck_bmd",
        label: "Femoral Neck BMD",
        unit: "g/cm²",
        normalRange: "N/A",
      },
      {
        name: "femoral_neck_tscore",
        label: "Femoral Neck T-score",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
    Angiography: [
      { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
      {
        name: "contrast_used",
        label: "Contrast Used",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "vessel_patency",
        label: "Vessel Patency",
        unit: "",
        normalRange: "N/A",
      },
      {
        name: "stenosis_presence",
        label: "Stenosis Presence",
        unit: "",
        normalRange: "N/A",
      },
      { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
      { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
    ],
  },
  // ... existing code ...

  // ... other existing fields ...
  
  histopathology: {
    "FNAC (Fine Needle Aspiration Cytology)": [
      {
        name: "specimen_type",
        label: "Specimen Type",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "adequacy",
        label: "Specimen Adequacy",
        unit: "",
        normalRange: "N/A",
        options: ["Adequate", "Suboptimal", "Inadequate"]
      },
      {
        name: "cellularity",
        label: "Cellularity",
        unit: "",
        normalRange: "N/A",
        options: ["Scant", "Moderate", "Abundant"]
      },
      {
        name: "cytological_findings",
        label: "Cytological Findings",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Skin Biopsy": [
      {
        name: "specimen_site",
        label: "Biopsy Site",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "specimen_size",
        label: "Specimen Size",
        unit: "cm",
        normalRange: "N/A"
      },
      {
        name: "epidermis_description",
        label: "Epidermis Description",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "dermis_description",
        label: "Dermis Description",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "microscopic_findings",
        label: "Microscopic Findings",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Liver Biopsy": [
      {
        name: "specimen_adequacy",
        label: "Specimen Adequacy",
        unit: "",
        normalRange: "N/A",
        options: ["Adequate", "Suboptimal", "Inadequate"]
      },
      {
        name: "portal_tracts",
        label: "Number of Portal Tracts",
        unit: "",
        normalRange: "≥10"
      },
      {
        name: "fibrosis_stage",
        label: "Fibrosis Stage",
        unit: "",
        normalRange: "0",
        options: ["0", "1", "2", "3", "4"]
      },
      {
        name: "inflammation_grade",
        label: "Inflammation Grade",
        unit: "",
        normalRange: "0",
        options: ["0", "1", "2", "3"]
      },
      {
        name: "steatosis",
        label: "Steatosis",
        unit: "%",
        normalRange: "<5%"
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Prostate Biopsy": [
      {
        name: "number_of_cores",
        label: "Number of Cores",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "core_lengths",
        label: "Core Lengths",
        unit: "mm",
        normalRange: "N/A"
      },
      {
        name: "gleason_score",
        label: "Gleason Score",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "percentage_involvement",
        label: "Percentage of Core Involvement",
        unit: "%",
        normalRange: "N/A"
      },
      {
        name: "perineural_invasion",
        label: "Perineural Invasion",
        unit: "",
        normalRange: "Absent",
        options: ["Present", "Absent"]
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Breast Biopsy": [
      {
        name: "specimen_type",
        label: "Specimen Type",
        unit: "",
        normalRange: "N/A",
        options: ["Core Biopsy", "Excisional Biopsy", "Other"]
      },
      {
        name: "tumor_size",
        label: "Tumor Size",
        unit: "cm",
        normalRange: "N/A"
      },
      {
        name: "histological_type",
        label: "Histological Type",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "tumor_grade",
        label: "Tumor Grade",
        unit: "",
        normalRange: "N/A",
        options: ["Grade 1", "Grade 2", "Grade 3"]
      },
      {
        name: "lymphovascular_invasion",
        label: "Lymphovascular Invasion",
        unit: "",
        normalRange: "Absent",
        options: ["Present", "Absent"]
      },
      {
        name: "hormone_receptor_status",
        label: "Hormone Receptor Status",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "her2_status",
        label: "HER2 Status",
        unit: "",
        normalRange: "N/A",
        options: ["Positive", "Negative", "Equivocal"]
      }
    ],
    "Kidney Biopsy": [
      {
        name: "specimen_adequacy",
        label: "Specimen Adequacy",
        unit: "",
        normalRange: "N/A",
        options: ["Adequate", "Suboptimal", "Inadequate"]
      },
      {
        name: "number_of_glomeruli",
        label: "Number of Glomeruli",
        unit: "",
        normalRange: "≥10"
      },
      {
        name: "light_microscopy",
        label: "Light Microscopy Findings",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "immunofluorescence",
        label: "Immunofluorescence Findings",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "electron_microscopy",
        label: "Electron Microscopy Findings",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Bone Marrow Biopsy": [
      {
        name: "specimen_adequacy",
        label: "Specimen Adequacy",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "cellularity",
        label: "Cellularity",
        unit: "%",
        normalRange: "40-60%"
      },
      {
        name: "myeloid_series",
        label: "Myeloid Series",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "erythroid_series",
        label: "Erythroid Series",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "megakaryocytes",
        label: "Megakaryocytes",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "iron_stores",
        label: "Iron Stores",
        unit: "",
        normalRange: "Present",
        options: ["Absent", "Present", "Increased"]
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Lymph Node Biopsy": [
      {
        name: "specimen_size",
        label: "Specimen Size",
        unit: "cm",
        normalRange: "N/A"
      },
      {
        name: "architecture",
        label: "Architecture",
        unit: "",
        normalRange: "Preserved",
        options: ["Preserved", "Partially Effaced", "Completely Effaced"]
      },
      {
        name: "cellular_composition",
        label: "Cellular Composition",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "special_stains",
        label: "Special Stains",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "immunophenotype",
        label: "Immunophenotype",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "diagnosis",
        label: "Diagnosis",
        unit: "",
        normalRange: "N/A"
      }
    ],
    "Frozen Section": [
      {
        name: "specimen_type",
        label: "Specimen Type",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "frozen_section_diagnosis",
        label: "Frozen Section Diagnosis",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "margin_status",
        label: "Margin Status",
        unit: "",
        normalRange: "Negative",
        options: ["Positive", "Negative", "Close"]
      },
      {
        name: "correlation_with_final",
        label: "Correlation with Final Diagnosis",
        unit: "",
        normalRange: "Concordant",
        options: ["Concordant", "Discordant"]
      }
    ],
    "Pap Smear": [
      {
        name: "specimen_adequacy",
        label: "Specimen Adequacy",
        unit: "",
        normalRange: "Satisfactory",
        options: ["Satisfactory", "Unsatisfactory"]
      },
      {
        name: "epithelial_cell_abnormality",
        label: "Epithelial Cell Abnormality",
        unit: "",
        normalRange: "Negative",
        options: [
          "Negative",
          "ASC-US",
          "ASC-H",
          "LSIL",
          "HSIL",
          "Squamous Cell Carcinoma"
        ]
      },
      {
        name: "organisms",
        label: "Organisms",
        unit: "",
        normalRange: "None"
      },
      {
        name: "other_findings",
        label: "Other Non-neoplastic Findings",
        unit: "",
        normalRange: "None"
      },
      {
        name: "recommendation",
        label: "Recommendation",
        unit: "",
        normalRange: "Routine screening"
      }
    ],
    "Immunohistochemistry": [
      {
        name: "specimen_type",
        label: "Specimen Type",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "markers_tested",
        label: "Markers Tested",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "staining_pattern",
        label: "Staining Pattern",
        unit: "",
        normalRange: "N/A"
      },
      {
        name: "intensity",
        label: "Staining Intensity",
        unit: "",
        normalRange: "N/A",
        options: ["Negative", "Weak", "Moderate", "Strong"]
      },
      {
        name: "percentage_positive",
        label: "Percentage of Positive Cells",
        unit: "%",
        normalRange: "N/A"
      },
      {
        name: "interpretation",
        label: "Interpretation",
        unit: "",
        normalRange: "N/A"
      }
    ]
  }

};

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

export function convertLessThanOneThousand(number) {
  if (number === 0) {
    return "";
  }

  let words = "";

  if (number >= 100) {
    words += ones[Math.floor(number / 100)] + " Hundred ";
    number %= 100;
  }

  if (number >= 20) {
    words += tens[Math.floor(number / 10)] + " ";
    number %= 10;
  } else if (number >= 10) {
    words += teens[number - 10] + " ";
    return words.trim();
  }

  if (number > 0) {
    words += ones[number] + " ";
  }

  return words.trim();
}

export function numberToWords(number) {
  if (number === 0) return "Zero";

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const remainder = number % 1000;

  let words = "";

  if (crore > 0) {
    words += convertLessThanOneThousand(crore) + " Crore ";
  }

  if (lakh > 0) {
    words += convertLessThanOneThousand(lakh) + " Lakh ";
  }

  if (thousand > 0) {
    words += convertLessThanOneThousand(thousand) + " Thousand ";
  }

  if (remainder > 0) {
    words += convertLessThanOneThousand(remainder);
  }

  return words.trim();
}

export const s3Domain =
  "https://thousandwayshospital.s3.ap-south-1.amazonaws.com";
export const comorbidities = [
  "Hypertension",
  "Diabetes mellitus",
  "Obesity",
  "COPD",
  "Asthma",
  "Coronary artery disease",
  "Congestive heart failure",
  "Chronic kidney disease",
  "Osteoarthritis",
  "Rheumatoid arthritis",
  "Depression",
  "Anxiety disorders",
  "Hypothyroidism",
  "Hyperlipidemia",
  "GERD",
  "Sleep apnea",
  "Osteoporosis",
  "Chronic liver disease",
  "Anemia",
  "Atrial fibrillation",
];
