import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import {
  format,
  subMonths,
  isBefore,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { cn } from "../lib/utils";

// backend url
export const Backend_URL = "https://thehospital.in";

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
    { id: "edit_patients", label: "Edit Patients" },
    { id: "can_discharge", label: "Can Discharge" },
    { id: "give_discount", label: "Give Discount" },
  ],
  "Inventory Management": [
    { id: "edit_inventory_price", label: "Edit Prices" },
  ],
  "Financial Management": [
    { id: "view_financial", label: "View Financial Data" },

    { id: "edit_bills", label: "Edit Bills" },

    { id: "view_reports", label: "View Reports" },
    { id: "record_expense", label: "Record Expense" },
    {
      id: "view_otherscollection_all",
      label: "View Other's collection for all days",
    },
    {
      id: "view_otherscollection_for_just_today",
      label: "View Other's collection for only today",
    },
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
      from = startOfDay(today);
      to = endOfDay(today);
      break;
    case "Yesterday":
      const yesterday = subDays(today, 1);
      from = startOfDay(yesterday);
      to = endOfDay(yesterday);
      break;
    case "This Week":
      from = startOfWeek(today, { weekStartsOn: 0 });
      to = endOfWeek(today, { weekStartsOn: 0 });
      break;
    case "This Month":
      from = startOfMonth(today);
      to = endOfMonth(today);
      break;
    case "Last 7 Days":
      from = startOfDay(subDays(today, 6));
      to = endOfDay(today);
      break;
    default:
      from = startOfDay(subDays(today, 30));
      to = endOfDay(today);
  }

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
  if (!time24 || typeof time24 !== "string") return "";

  // Trim whitespace and handle any extra spaces
  const cleanTime = time24.trim().replace(/\s+/g, " ");

  // Split by space to check for AM/PM
  const timeParts = cleanTime.split(" ");

  // If it's already in 12-hour format (has AM/PM)
  if (timeParts.length === 2) {
    const [timeSection, period] = timeParts;
    const upperPeriod = period.toUpperCase();

    // Verify it's a valid time format and valid period
    if (
      timeSection.includes(":") &&
      (upperPeriod === "AM" || upperPeriod === "PM")
    ) {
      const [hours, minutes] = timeSection.split(":");
      // Validate hours and minutes
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);

      if (
        !isNaN(hour) &&
        !isNaN(minute) &&
        hour >= 1 &&
        hour <= 12 &&
        minute >= 0 &&
        minute <= 59
      ) {
        return `${hours.padStart(2, "0")}:${minutes.padStart(
          2,
          "0"
        )} ${upperPeriod}`;
      }
    }
  }

  // Try to convert from 24-hour format
  try {
    const [hours, minutes] = cleanTime.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    // Validate the time values
    if (
      isNaN(hour) ||
      isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return "";
    }

    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert to 12-hour format

    return `${hour12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  } catch (error) {
    return "";
  }
};

// export const labCategories = [
//   {
//     name: "Hematology",
//     description: "Blood cell counts and related tests",
//     types: [
//       "Complete Blood Count (CBC)",
//       "Erythrocyte Sedimentation Rate",
//       "Peripheral Blood Smear",
//       "Reticulocyte Count",
//       "Coagulation Profile",
//       "Hemoglobin Electrophoresis",
//       "Arterial Blood Gas (ABG)",
//       "MP (OPTIMAL)",
//       "MP (SLIDE)",
//     ],
//   },
//   {
//     name: "Biochemistry",
//     description: "Chemical analysis of blood and other body fluids",
//     types: [
//       "Lipid Profile",
//       "Liver Function Tests",
//       "Kidney Function Tests",
//       "Electrolytes",
//       "Calcium Profile",
//       "Iron Studies",
//       "Cardiac Markers",
//       "Ammonia",
//       "Creatine Kinase (CK/CPK)",
//       "Homocysteine",
//       "AMYLASE",
//       "LIPASE",
//       "Procalcitonin (PCT)",
//       "Serum Osmolality",
//       "Urine Porphyrin Screen",
//       "PSA Profile",
//       "Cancer Antigen 19-9 (CA 19-9)",
//       "Alpha-2-Macroglobulin",
//       "Aldolase",
//       "Lithium Level",
     
//     ],
//   },
//   {
//     name: "Endocrinology",
//     description: "Hormone-related tests",
//     types: [
//       "Thyroid Function Tests",
//       "Diabetes Tests",
//       "Reproductive Hormones",
//       "Adrenocorticotropic Hormone (ACTH)",
//       "Cortisol",
//       "Vitamin Tests",
//     ],
//   },
//   {
//     name: "Serology",
//     description: "Tests related to the immune system",
//     types: [
//       "C-Reactive Protein (CRP)",
//       "CRP (SLIDE)",
//       "CRP (TURBI/LATEX)",
//       "Rheumatoid Factor (RF)",
//       "Anti-Streptolysin O (ASO)",
//       "ASO TITRE (SLIDE)",
//       "ASO TITRE (TURBI)",
//       "WIDAL (SLIDE)",
//       "WIDAL (RAPID)",
//       "MOUNTOUX",
//       "Hepatitis Markers",
//       "HIV",
//       "VDRL",
//       "Allergy Tests",
//       "DENGUE (IgE/IgG/IgM)",
//       "CHIKENGUNYA",
//       "Blood Group Antibody Titres",
//       "TORCH Panel",
//       "Herpes Simplex Virus (HSV) Serology",
//       "COVID-19 PCR/NAAT",
//       "COVID-19 Antigen Test",
//       "COVID-19 Antibody Test",
//       "Filariasis Serology/Antigen",
//       "H. pylori Testing",
//       "Kala-azar (rK39) Test",
//     ],
//   },
//   {
//     name: "Microbiology",
//     description: "Tests for infectious diseases",
//     types: [
//       "Urine Culture",
//       "Stool Culture",
//       "Blood Culture",
//       "Sputum Culture",
    
//     ],
//   },
//   {
//     name: "Immunology",
//     description: "Tests related to the immune system",
//     types: [
//       "Antinuclear Antibodies (ANA)",
//       "Anti-dsDNA",
//       "Complement Levels",
//       "Immunoglobulins (IgG, IgM)",
//       "Serum Free Light Chains (FLC)",
//       "HLA-B27 Typing",
//       "Interferon-Gamma Release Assay (IGRA) for TB",
//       "Extractable Nuclear Antigen (ENA) Panel",
//       "Anti-CCP Antibodies",
//     ],
//   },
//   {
//     name: "Tumor Markers",
//     description: "Tests for detecting cancer",
//     types: [
//       "Prostate Specific Antigen (PSA)",
//       "Carcinoembryonic Antigen (CEA)",
//       "Cancer Antigen 125 (CA-125)",
//       "Alpha-Fetoprotein (AFP)",
//     ],
//   },
//   {
//     name: "Urine Analysis",
//     description: "Analysis of urine samples",
//     types: [
//       "Routine Urine",
//       "URINE R/E",
//       "URINE (BS,BP,URO)",
//       "URINE C/S",
//       "URINE HCG",
//       "URINE CHYLE",
//       "Urine Osmolality",
//       "24-Hour Urine Electrolytes",
//       "Urine Protein Electrophoresis (UPEP)",
//       "Urine Organic Acids Panel",
//     ],
//   },
//   {
//     name: "Stool Analysis",
//     description: "Analysis of stool samples",
//     types: ["Routine Stool", "Stool Reducing Substances"],
//   },
//   {
//     name: "Blood Typing",
//     description: "Blood group, Rh factor, and related tests",
//     types: ["ABO and Rh Typing", "Australian Antigen", "Antibody Screening"],
//   },
//   {
//     name: "Radiology",
//     description: "Imaging studies and reports",
//     types: [
//       "CT Scan",
//       "MRI",
//       "Ultrasonography Whole Abdomen",
//       "X-Ray",
//       "IVP (Intravenous Pyelogram)",
//       "CT KUB",
//       "PET Scan",
//       "Mammography",
//       "Bone Densitometry (DEXA)",
//       "Angiography",
//     ],
//   },
//   {
//     name: "Histopathology",
//     description: "Microscopic examination of tissue samples",
//     types: [
//       "FNAC (Fine Needle Aspiration Cytology)",
//       "Skin Biopsy",
//       "Liver Biopsy",
//       "Prostate Biopsy",
//       "Breast Biopsy",
//       "Kidney Biopsy",
//       "Bone Marrow Biopsy",
//       "Lymph Node Biopsy",
//       "Frozen Section",
//       "Pap Smear",
//       "Immunohistochemistry",
//       "Surgical Pathology",
//       "Cytology",
//     ],
//   },
//   {
//     name: "Genetics",
//     description: "Genetic and chromosomal analysis tests",
//     types: ["Karyotyping", "Ataxia Genetic Panel"],
//   },
//   {
//     name: "Fluid Analysis",
//     description: "Analysis of various body fluids",
//     types: [
//       "Cerebrospinal Fluid (CSF) Analysis",
//       "Ascitic Fluid Analysis",
//       "Adenosine Deaminase (ADA) - Fluid",
//     ],
//   },
// ];
// export const labReportFields = {
//   hematology: {
//     "Complete Blood Count (CBC)": [
//       {
//         name: "wbc",
//         label: "White Blood Cell Count (WBC)",
//         unit: "10^3/µL",
//         normalRange: "4.5-11.0",
//       },
//       {
//         name: "rbc",
//         label: "Red Blood Cell Count (RBC)",
//         unit: "10^6/µL",
//         normalRange: "4.5-5.9 (male), 4.1-5.1 (female)",
//       },
//       {
//         name: "hemoglobin",
//         label: "Hemoglobin (Hgb)",
//         unit: "g/dL",
//         normalRange: "13.5-17.5 (male), 12.0-15.5 (female)",
//       },
//       {
//         name: "hematocrit",
//         label: "Hematocrit (Hct)",
//         unit: "%",
//         normalRange: "41-53 (male), 36-46 (female)",
//       },
//       {
//         name: "mcv",
//         label: "Mean Corpuscular Volume (MCV)",
//         unit: "fL",
//         normalRange: "80-100",
//         calculationDetails: {
//           formula: "(hematocrit/rbc)*10",
//           dependencies: ["hematocrit", "rbc"],
//         },
//       },
//       {
//         name: "mch",
//         label: "Mean Corpuscular Hemoglobin (MCH)",
//         unit: "pg",
//         normalRange: "27-31",
//         calculationDetails: {
//           formula: "(hemoglobin/rbc)*10",
//           dependencies: ["hemoglobin", "rbc"],
//         },
//       },
//       {
//         name: "mchc",
//         label: "Mean Corpuscular Hemoglobin Concentration (MCHC)",
//         unit: "g/dL",
//         normalRange: "32-36",
//         calculationDetails: {
//           formula: "(hemoglobin/hematocrit)*100",
//           dependencies: ["hemoglobin", "hematocrit"],
//         },
//       },
//       {
//         name: "rdw",
//         label: "Red Cell Distribution Width (RDW)",
//         unit: "%",
//         normalRange: "11.5-14.5",
//       },
//       {
//         name: "platelets",
//         label: "Platelet Count",
//         unit: "10^3/µL",
//         normalRange: "150-450",
//       },
//       {
//         name: "mpv",
//         label: "Mean Platelet Volume (MPV)",
//         unit: "fL",
//         normalRange: "7.5-11.5",
//       },
//       {
//         name: "neutrophils",
//         label: "Neutrophils",
//         unit: "%",
//         normalRange: "40-60",
//       },
//       {
//         name: "lymphocytes",
//         label: "Lymphocytes",
//         unit: "%",
//         normalRange: "20-40",
//       },
//       { name: "monocytes", label: "Monocytes", unit: "%", normalRange: "2-8" },
//       {
//         name: "eosinophils",
//         label: "Eosinophils",
//         unit: "%",
//         normalRange: "1-4",
//       },
//       {
//         name: "basophils",
//         label: "Basophils",
//         unit: "%",
//         normalRange: "0.5-1",
//       },
//       {
//         name: "abs_neutrophils",
//         label: "Absolute Neutrophils",
//         unit: "10^3/µL",
//         normalRange: "2.0-7.0",
//         calculationDetails: {
//           formula: "(wbc * neutrophils) / 100",
//           dependencies: ["wbc", "neutrophils"],
//         },
//       },
//       {
//         name: "abs_lymphocytes",
//         label: "Absolute Lymphocytes",
//         unit: "10^3/µL",
//         normalRange: "1.0-3.0",
//         calculationDetails: {
//           formula: "(wbc * lymphocytes) / 100",
//           dependencies: ["wbc", "lymphocytes"],
//         },
//       },
//       {
//         name: "abs_monocytes",
//         label: "Absolute Monocytes",
//         unit: "10^3/µL",
//         normalRange: "0.2-1.0",
//         calculationDetails: {
//           formula: "(wbc * monocytes) / 100",
//           dependencies: ["wbc", "monocytes"],
//         },
//       },
//       {
//         name: "abs_eosinophils",
//         label: "Absolute Eosinophils",
//         unit: "10^3/µL",
//         normalRange: "0.02-0.5",
//         calculationDetails: {
//           formula: "(wbc * eosinophils) / 100",
//           dependencies: ["wbc", "eosinophils"],
//         },
//       },
//       {
//         name: "abs_basophils",
//         label: "Absolute Basophils",
//         unit: "10^3/µL",
//         normalRange: "0.02-0.1",
//         calculationDetails: {
//           formula: "(wbc * basophils) / 100",
//           dependencies: ["wbc", "basophils"],
//         },
//       },
//     ],
//     "Erythrocyte Sedimentation Rate": [
//       {
//         name: "esr",
//         label: "ESR",
//         unit: "mm/hr",
//         normalRange: "0-22 (male), 0-29 (female)",
//       },
//     ],
//     "Peripheral Blood Smear": [
//       {
//         name: "rbc_morphology",
//         label: "RBC Morphology",
//         unit: "",
//         normalRange: "Normal",
//         options: [
//           "Normal",
//           "Microcytic",
//           "Macrocytic",
//           "Hypochromic",
//           "Target cells",
//           "Sickle cells",
//           "Other abnormalities",
//         ],
//       },
//       {
//         name: "wbc_morphology",
//         label: "WBC Morphology",
//         unit: "",
//         normalRange: "Normal",
//         options: [
//           "Normal",
//           "Left shift",
//           "Toxic granulation",
//           "Hypersegmented neutrophils",
//           "Atypical lymphocytes",
//           "Blasts",
//           "Other abnormalities",
//         ],
//       },
//       {
//         name: "platelet_morphology",
//         label: "Platelet Morphology",
//         unit: "",
//         normalRange: "Normal",
//         options: [
//           "Normal",
//           "Large platelets",
//           "Platelet clumps",
//           "Other abnormalities",
//         ],
//       },
//     ],
//     "Reticulocyte Count": [
//       {
//         name: "reticulocyte_count",
//         label: "Reticulocyte Count",
//         unit: "%",
//         normalRange: "0.5-2.5",
//       },
//     ],
//     "Coagulation Profile": [
//       {
//         name: "pt",
//         label: "Prothrombin Time (PT)",
//         unit: "seconds",
//         normalRange: "11-13.5",
//       },
//       {
//         name: "inr",
//         label: "International Normalized Ratio (INR)",
//         unit: "",
//         normalRange: "0.8-1.1",
//       },
//       {
//         name: "aptt",
//         label: "Activated Partial Thromboplastin Time (APTT)",
//         unit: "seconds",
//         normalRange: "30-40",
//       },
//       {
//         name: "fibrinogen",
//         label: "Fibrinogen",
//         unit: "mg/dL",
//         normalRange: "200-400",
//       },
//       {
//         name: "d_dimer",
//         label: "D-dimer",
//         unit: "ng/mL",
//         normalRange: "<500",
//       },
//       {
//         name: "protein_c",
//         label: "Protein C Activity",
//         unit: "%",
//         normalRange: "70-140",
//       },
//       {
//         name: "protein_s",
//         label: "Protein S Activity",
//         unit: "%",
//         normalRange: "65-140",
//       },
//       {
//         name: "antithrombin_iii",
//         label: "Antithrombin III",
//         unit: "%",
//         normalRange: "80-120",
//       },
//       {
//         name: "bt",
//         label: "Bleeding Time",
//         unit: "seconds",
//         normalRange: "2-7",
//       },
//       {
//         name: "ct",
//         label: "Clotting Time",
//         unit: "seconds",
//         normalRange: "4-10",
//       },
//       {
//         name: "factor_viii",
//         label: "Factor VIII Activity",
//         unit: "%",
//         normalRange: "50-150",
//       },
//       {
//         name: "von_willebrand",
//         label: "von Willebrand Factor",
//         unit: "%",
//         normalRange: "50-160",
//       },
//       {
//         name: "protein_c_activity",
//         label: "Protein C Activity",
//         unit: "%",
//         normalRange: "70-140",
//       },
//       {
//         name: "protein_s_activity",
//         label: "Protein S Activity",
//         unit: "%",
//         normalRange: "65-140",
//       },
//     ],
//     "Hemoglobin Electrophoresis": [
//       {
//         name: "hb_a",
//         label: "Hemoglobin A (HbA)",
//         unit: "%",
//         normalRange: "95-98",
//       },
//       {
//         name: "hb_a2",
//         label: "Hemoglobin A2 (HbA2)",
//         unit: "%",
//         normalRange: "1.5-3.5",
//       },
//       {
//         name: "hb_f",
//         label: "Hemoglobin F (HbF)",
//         unit: "%",
//         normalRange: "<2",
//       },
//       { name: "hb_s", label: "Hemoglobin S (HbS)", unit: "%", normalRange: "" },
//       { name: "hb_c", label: "Hemoglobin C (HbC)", unit: "%", normalRange: "" },
//       { name: "hb_e", label: "Hemoglobin E (HbE)", unit: "%", normalRange: "" },
//       { name: "hb_d", label: "Hemoglobin D (HbD)", unit: "%", normalRange: "" },
//       {
//         name: "other_hb_variants",
//         label: "Other Hemoglobin Variants Identified",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "interpretation_hplc",
//         label: "Interpretation/Conclusion",
//         unit: "",
//         normalRange: "",
//       },
//     ],
//     "Arterial Blood Gas (ABG)": [
//       {
//         name: "ph",
//         label: "pH",
//         unit: "",
//         normalRange: "7.35-7.45",
//       },
//       {
//         name: "paco2",
//         label: "PaCO2 (Partial Pressure of CO2)",
//         unit: "mmHg",
//         normalRange: "35-45",
//       },
//       {
//         name: "pao2",
//         label: "PaO2 (Partial Pressure of O2)",
//         unit: "mmHg",
//         normalRange: "80-100",
//       },
//       {
//         name: "hco3",
//         label: "HCO3 (Bicarbonate)",
//         unit: "mEq/L",
//         normalRange: "22-26",
//       },
//       {
//         name: "base_excess",
//         label: "Base Excess/Deficit",
//         unit: "mEq/L",
//         normalRange: "-2 to +2",
//       },
//       {
//         name: "sao2",
//         label: "SaO2 (Oxygen Saturation)",
//         unit: "%",
//         normalRange: "95-100",
//       },
//       {
//         name: "lactate",
//         label: "Lactate",
//         unit: "mmol/L",
//         normalRange: "0.5-1.6",
//       },
//       {
//         name: "fio2",
//         label: "FiO2 (Fraction of Inspired Oxygen)",
//         unit: "%",
//         normalRange: "21",
//       },
//       {
//         name: "pf_ratio",
//         label: "P/F Ratio (PaO2/FiO2)",
//         unit: "",
//         normalRange: ">400",
//       },
//       {
//         name: "a_a_gradient",
//         label: "A-a Gradient",
//         unit: "mmHg",
//         normalRange: "<15",
//       },
//       {
//         name: "anion_gap",
//         label: "Anion Gap",
//         unit: "mEq/L",
//         normalRange: "8-16",
//       },
//       {
//         name: "temperature",
//         label: "Temperature",
//         unit: "°C",
//         normalRange: "36.5-37.5",
//       },
//     ],
//     "MP (OPTIMAL)": [
//       {
//         name: "mp_optimal",
//         label: "Malarial Parasite (Optimal)",
//         unit: "",
//         normalRange: "Negative",
//       },
//     ],
//     "MP (SLIDE)": [
//       {
//         name: "mp_slide",
//         label: "Malarial Parasite (Slide)",
//         unit: "",
//         normalRange: "Negative",
//       },
//     ],
//   },
//   biochemistry: {
//     "Lipid Profile": [
//       {
//         name: "total_cholesterol",
//         label: "Total Cholesterol",
//         unit: "mg/dL",
//         normalRange: "<200",
//       },
//       {
//         name: "ldl",
//         label: "LDL Cholesterol",
//         unit: "mg/dL",
//         normalRange: "<130",
//         calculationDetails: {
//           formula: "total_cholesterol - hdl - (triglycerides / 5)",
//           dependencies: ["total_cholesterol", "hdl", "triglycerides"],
//         },
//       },
//       {
//         name: "hdl",
//         label: "HDL Cholesterol",
//         unit: "mg/dL",
//         normalRange: ">60",
//       },
//       {
//         name: "triglycerides",
//         label: "Triglycerides",
//         unit: "mg/dL",
//         normalRange: "<150",
//       },
//       {
//         name: "vldl",
//         label: "VLDL Cholesterol",
//         unit: "mg/dL",
//         normalRange: "<30",
//         calculationDetails: {
//           formula: "triglycerides / 5",
//           dependencies: ["triglycerides"],
//         },
//       },
//       {
//         name: "cholesterol_hdl_ratio",
//         label: "Cholesterol/HDL Ratio",
//         unit: "",
//         normalRange: "<3.5",
//         calculationDetails: {
//           formula: "total_cholesterol / hdl",
//           dependencies: ["total_cholesterol", "hdl"],
//         },
//       },
//     ],
//     "Liver Function Tests": [
//       {
//         name: "total_bilirubin",
//         label: "Total Bilirubin",
//         unit: "mg/dL",
//         normalRange: "0.3-1.2",
//       },
//       {
//         name: "direct_bilirubin",
//         label: "Direct Bilirubin",
//         unit: "mg/dL",
//         normalRange: "0.0-0.3",
//       },
//       {
//         name: "indirect_bilirubin",
//         label: "Indirect Bilirubin",
//         unit: "mg/dL",
//         normalRange: "0.2-0.8",
//         calculationDetails: {
//           formula: "total_bilirubin - direct_bilirubin",
//           dependencies: ["total_bilirubin", "direct_bilirubin"],
//         },
//       },
//       { name: "sgpt", label: "SGPT (ALT)", unit: "U/L", normalRange: "7-56" },
//       { name: "sgot", label: "SGOT (AST)", unit: "U/L", normalRange: "10-40" },
//       {
//         name: "alkaline_phosphatase",
//         label: "Alkaline Phosphatase",
//         unit: "U/L",
//         normalRange: "44-147",
//       },
//       {
//         name: "total_proteins",
//         label: "Total Proteins",
//         unit: "g/dL",
//         normalRange: "6.0-8.3",
//       },
//       {
//         name: "albumin",
//         label: "Albumin",
//         unit: "g/dL",
//         normalRange: "3.5-5.0",
//       },
//       {
//         name: "globulin",
//         label: "Globulin",
//         unit: "g/dL",
//         normalRange: "2.3-3.5",
//       },
//       {
//         name: "ag_ratio",
//         label: "A/G Ratio",
//         unit: "",
//         normalRange: "1.2-2.2",
//         calculationDetails: {
//           formula: "albumin / globulin",
//           dependencies: ["albumin", "globulin"],
//         },
//       },
//       {
//         name: "ggt",
//         label: "Gamma GT",
//         unit: "U/L",
//         normalRange: "9-48",
//       },
//       {
//         name: "ldh",
//         label: "Lactate Dehydrogenase (LDH)",
//         unit: "U/L",
//         normalRange: "140-280",
//       },
//       {
//         name: "pt_inr",
//         label: "Prothrombin Time/INR",
//         unit: "seconds",
//         normalRange: "11-13.5",
//       },
//     ],
//     "Kidney Function Tests": [
//       {
//         name: "urea",
//         label: "Blood Urea",
//         unit: "mg/dL",
//         normalRange: "13-43",
//         calculationDetails: {
//           formula: "urea_nitrogen*2.14",
//           dependencies: ["urea_nitrogen"],
//         },
//       },
//       {
//         name: "urea_nitrogen",
//         label: "BUN",
//         unit: "mg/dL",
//         normalRange: "6-20",
//         calculationDetails: {
//           formula: "urea / 2.14",
//           dependencies: ["urea"],
//         },
//       },
//       {
//         name: "bun_creatinine_ratio",
//         label: "BUN/Creatinine Ratio",
//         unit: "",
//         normalRange: "6-22",
//         calculationDetails: {
//           formula: "urea_nitrogen / creatinine",
//           dependencies: ["urea_nitrogen", "creatinine"],
//         },
//       },
//       {
//         name: "creatinine",
//         label: "Serum Creatinine",
//         unit: "mg/dL",
//         normalRange: "0.55-1.02",
//       },
//       {
//         name: "gfr",
//         label: "Estimated Glomerular Filtration Rate (eGFR)",
//         unit: "mL/min/1.73m²",
//         calculationDetails: {
//           formula:
//             "142 * Math.min(creatinine/0.9, 1)**-0.411 * Math.max(creatinine/0.9, 1)**-1.209 * 0.993**age * (female ? 1.018 : 1)",
//           dependencies: ["creatinine", "age", "gender"],
//         },
//         normalRange: ">90",
//       },
//       {
//         name: "gfr_category",
//         label: "GFR Category",
//         unit: "",
//         normalRange:
//           "G1-G2: Normal to mild decrease; G3a-G5 for progressive stages",
//       },
//       {
//         name: "uric_acid",
//         label: "Uric Acid",
//         unit: "mg/dL",
//         normalRange: "2.60-6.00",
//       },
//       {
//         name: "total_protein",
//         label: "Total Protein",
//         unit: "g/dL",
//         normalRange: "5.70-8.20",
//       },
//       {
//         name: "albumin",
//         label: "Albumin",
//         unit: "g/dL",
//         normalRange: "3.20-4.80",
//       },
//       {
//         name: "a_g_ratio",
//         label: "Albumin/Globulin Ratio (A:G Ratio)",
//         unit: "",
//         normalRange: "0.90-2.00",
//         calculationDetails: {
//           formula: "albumin / globulin",
//           dependencies: ["albumin", "globulin"],
//         },
//       },
//       {
//         name: "globulin",
//         label: "Globulin (Calculated)",
//         unit: "g/dL",
//         normalRange: "",
//         calculationDetails: {
//           formula: "total_protein - albumin",
//           dependencies: ["total_protein", "albumin"],
//         },
//       },
//       {
//         name: "calcium",
//         label: "Calcium (Total)",
//         unit: "mg/dL",
//         normalRange: "8.70-10.40",
//       },
//       {
//         name: "phosphorus",
//         label: "Phosphorus",
//         unit: "mg/dL",
//         normalRange: "2.40-5.10",
//       },
//       {
//         name: "sodium",
//         label: "Sodium",
//         unit: "mEq/L",
//         normalRange: "136-145",
//       },
//       {
//         name: "potassium",
//         label: "Potassium",
//         unit: "mEq/L",
//         normalRange: "3.50-5.10",
//       },
//       {
//         name: "chloride",
//         label: "Chloride",
//         unit: "mEq/L",
//         normalRange: "98-107",
//       },
//     ],
//     Electrolytes: [
//       {
//         name: "sodium",
//         label: "Sodium",
//         unit: "mEq/L",
//         normalRange: "135-145",
//       },
//       {
//         name: "potassium",
//         label: "Potassium",
//         unit: "mEq/L",
//         normalRange: "3.5-5.0",
//       },
//       {
//         name: "chloride",
//         label: "Chloride",
//         unit: "mEq/L",
//         normalRange: "98-106",
//       },
//       {
//         name: "bicarbonate",
//         label: "Bicarbonate",
//         unit: "mEq/L",
//         normalRange: "22-28",
//       },
//       {
//         name: "calcium_electrolyte",
//         label: "Calcium",
//         unit: "mg/dL",
//         normalRange: "8.5-10.5",
//       },
//       {
//         name: "magnesium",
//         label: "Magnesium",
//         unit: "mg/dL",
//         normalRange: "1.8-2.3",
//       },
//     ],
//     "Calcium Profile": [
//       {
//         name: "total_calcium",
//         label: "Total Calcium",
//         unit: "mg/dL",
//         normalRange: "8.5-10.5",
//       },
//       {
//         name: "ionized_calcium",
//         label: "Ionized Calcium",
//         unit: "mg/dL",
//         normalRange: "4.5-5.3",
//       },
//     ],
//     "Iron Studies": [
//       {
//         name: "serum_iron",
//         label: "Serum Iron",
//         unit: "µg/dL",
//         normalRange: "60-170",
//       },
//       {
//         name: "tibc",
//         label: "Total Iron Binding Capacity (TIBC)",
//         unit: "µg/dL",
//         normalRange: "240-450",
//       },
//       {
//         name: "ferritin",
//         label: "Ferritin",
//         unit: "ng/mL",
//         normalRange: "20-250",
//       },
//       {
//         name: "transferrin_saturation",
//         label: "Transferrin Saturation",
//         unit: "%",
//         normalRange: "20-50",
//         calculationDetails: {
//           formula: "(serum_iron / tibc) * 100",
//           dependencies: ["serum_iron", "tibc"],
//         },
//       },
//     ],
//     "Cardiac Markers": [
//       {
//         name: "troponin_i",
//         label: "Troponin I",
//         unit: "ng/mL",
//         normalRange: "<0.04",
//       },
//       {
//         name: "troponin_t",
//         label: "Troponin T",
//         unit: "ng/mL",
//         normalRange: "<0.01",
//       },
//       {
//         name: "ck_mb",
//         label: "CK-MB",
//         unit: "ng/mL",
//         normalRange: "<5.0",
//       },
//       {
//         name: "myoglobin", 
//         label: "Myoglobin",
//         unit: "ng/mL",
//         normalRange: "<72"
//       },
//       {
//         name: "bnp",
//         label: "BNP",
//         unit: "pg/mL",
//         normalRange: "<100",
//       },
//       {
//         name: "nt_probnp_level", 
//         label: "NT-proBNP (N-terminal pro-BNP)",
//         unit: "pg/mL",
//         normalRange:"",
//       }
//     ],
//     Ammonia: [
//       {
//         name: "ammonia_level",
//         label: "Ammonia",
//         unit: "µmol/L",
//         normalRange: "11-35",
//       },
//     ],
//     "Creatine Kinase (CK/CPK)": [
//       {
//         name: "ck_total",
//         label: "Creatine Kinase Total (CK/CPK)",
//         unit: "U/L",
//         normalRange: "30-200 (male), 30-150 (female)",
//       },
//     ],
//     Homocysteine: [
//       {
//         name: "homocysteine_level",
//         label: "Homocysteine",
//         unit: "µmol/L",
//         normalRange: "5-15",
//       },
//     ],
//     AMYLASE: [
//       {
//         name: "amylase",
//         label: "Serum Amylase",
//         unit: "U/L",
//         normalRange: "28-100",
//       },
//     ],
//     LIPASE: [
//       {
//         name: "lipase",
//         label: "Serum Lipase",
//         unit: "U/L",
//         normalRange: "13-60",
//       },
//     ],
//     "Procalcitonin (PCT)": [
//       {
//         name: "procalcitonin_level",
//         label: "Procalcitonin",
//         unit: "ng/mL",
//         normalRange: "<0.05",
//       },
//     ],
//     "Serum Osmolality": [
//       {
//         name: "serum_osmolality_measured",
//         label: "Serum Osmolality (Measured)",
//         unit: "mOsm/kg H₂O",
//         normalRange: "275-295",
//       },
//       {
//         name: "serum_osmolality_calculated",
//         label: "Serum Osmolality (Calculated)",
//         unit: "mOsm/kg H₂O",
//         normalRange: "275-295",
//         calculationDetails: {
//           formula:
//             "(2 * sodium) + (fasting_glucose / 18) + (urea_nitrogen / 2.8)",
//           dependencies: ["sodium", "fasting_glucose", "urea_nitrogen"],
//         },
//       },
//       {
//         name: "osmolal_gap",
//         label: "Osmolal Gap",
//         unit: "mOsm/kg H₂O",
//         normalRange: "<10-15",
//         calculationDetails: {
//           formula: "serum_osmolality_measured - serum_osmolality_calculated",
//           dependencies: [
//             "serum_osmolality_measured",
//             "serum_osmolality_calculated",
//           ],
//         },
//       },
//     ],
//     "Urine Porphyrin Screen": [
//       {
//         name: "delta_ala_urine",
//         label: "Delta-Aminolevulinic Acid (Urine)",
//         unit: "mg/24h",
//         normalRange: "1.5-7.5",
//       },
//       {
//         name: "porphobilinogen_urine",
//         label: "Porphobilinogen (PBG) (Urine)",
//         unit: "mg/24h",
//         normalRange: "<2.0",
//       },
//     ],
//     "PSA Profile": [
//       {
//         name: "psa_total",
//         label: "Total PSA",
//         unit: "ng/mL",
//         normalRange: "<4.0",
//       },
//       {
//         name: "psa_free",
//         label: "Free PSA",
//         unit: "ng/mL",
//         normalRange: "Varies, usually >0.5 ng/mL if Total PSA is elevated",
//       },
//       {
//         name: "percent_free_psa",
//         label: "% Free PSA (Free/Total PSA Ratio)",
//         unit: "%",
//         normalRange: ">25%",
//         calculationDetails: {
//           formula: "(psa_free / psa_total) * 100",
//           dependencies: ["psa_free", "psa_total"],
//         },
//       },
//     ],
//     "Cancer Antigen 19-9 (CA 19-9)": [
//       {
//         name: "ca_19_9_level",
//         label: "CA 19-9",
//         unit: "U/mL",
//         normalRange: "<37",
//       },
//     ],
//     "Alpha-2-Macroglobulin": [
//       {
//         name: "alpha2_macroglobulin_level",
//         label: "Alpha-2-Macroglobulin",
//         unit: "mg/dL",
//         normalRange: "130-300",
//       },
//     ],
//     Aldolase: [
//       {
//         name: "aldolase_level",
//         label: "Aldolase",
//         unit: "U/L",
//         normalRange: "1.0-7.5",
//       },
//     ],
//     "Lithium Level": [
//       {
//         name: "lithium_serum",
//         label: "Lithium (Serum)",
//         unit: "mEq/L",
//         normalRange: "0.6-1.2",
//       },
//     ],
//     "Procalcitonin (PCT)": [
//       {
//         name: "procalcitonin_level",
//         label: "Procalcitonin",
//         unit: "ng/mL",
//         normalRange: "<0.05 (healthy), >0.5 (suggests bacterial infection)",
//       },
//     ],
//   },
//   endocrinology: {
//     "Thyroid Function Tests": [
//       { name: "t3", label: "Total T3", unit: "ng/dL", normalRange: "80-200" },
//       { name: "t4", label: "Total T4", unit: "µg/dL", normalRange: "5.1-14.1" },
//       {
//         name: "free_t3",
//         label: "Free T3",
//         unit: "pg/mL",
//         normalRange: "2.3-4.2",
//       },
//       {
//         name: "free_t4",
//         label: "Free T4",
//         unit: "ng/dL",
//         normalRange: "0.8-1.8",
//       },
//       { name: "tsh", label: "TSH", unit: "µIU/mL", normalRange: "0.4-4.0" },
//       {
//         name: "anti_tpo_ab",
//         label: "Anti-Thyroid Peroxidase Antibodies (Anti-TPO)",
//         unit: "IU/mL",
//         normalRange: "<35",
//       },
//       {
//         name: "anti_tg_ab",
//         label: "Anti-Thyroglobulin Antibodies (Anti-Tg)",
//         unit: "IU/mL",
//         normalRange: "<40",
//       },
//     ],
//     "Diabetes Tests": [
//       {
//         name: "fasting_glucose",
//         label: "Fasting Glucose",
//         unit: "mg/dL",
//         normalRange: "70-100",
//       },
//       {
//         name: "pp_glucose",
//         label: "Post Prandial Glucose",
//         unit: "mg/dL",
//         normalRange: "<140",
//       },
//       { name: "hba1c", label: "HbA1c", unit: "%", normalRange: "<5.7" },
//       {
//         name: "sugar",
//         label: "Blood Sugar",
//         unit: "mg/dL",
//         normalRange: "100-125",
//       },
//       {
//         name: "c_peptide",
//         label: "C-Peptide",
//         unit: "ng/mL",
//         normalRange: "0.8-3.9",
//       },
//       {
//         name: "insulin",
//         label: "Fasting Insulin",
//         unit: "µIU/mL",
//         normalRange: "3-25",
//       },
//       {
//         name: "homa_ir",
//         label: "HOMA-IR",
//         unit: "",
//         calculationDetails: {
//           formula: "insulin * fasting_glucose / 405",
//           dependencies: ["insulin", "fasting_glucose"],
//         },
//         normalRange: "<2.5",
//       },
//     ],
//     "Reproductive Hormones": [
//       {
//         name: "fsh",
//         label: "Follicle Stimulating Hormone (FSH)",
//         unit: "mIU/mL",
//         normalRange: "Varies with menstrual cycle",
//       },
//       {
//         name: "lh",
//         label: "Luteinizing Hormone (LH)",
//         unit: "mIU/mL",
//         normalRange: "Varies with menstrual cycle",
//       },
//       {
//         name: "prolactin",
//         label: "Prolactin",
//         unit: "ng/mL",
//         normalRange: "2-29",
//       },
//       {
//         name: "testosterone",
//         label: "Testosterone",
//         unit: "ng/dL",
//         normalRange: "270-1070 (male), 15-70 (female)",
//       },
//       {
//         name: "estradiol_e2",
//         label: "Estradiol (E2)",
//         unit: "pg/mL",
//         normalRange: "",
//       },
//       {
//         name: "progesterone_level",
//         label: "Progesterone",
//         unit: "ng/mL",
//         normalRange: "Varies with cycle/pregnancy",
//       },
//       {
//         name: "amh_level",
//         label: "Anti-Müllerian Hormone (AMH)",
//         unit: "ng/mL",
//         normalRange:
//           "Varies with age (e.g., 1.0-4.0 for reproductive age women)",
//       },
//     ],
//     "Adrenocorticotropic Hormone (ACTH)": [
//       {
//         name: "acth_plasma",
//         label: "ACTH (Plasma)",
//         unit: "pg/mL",
//         normalRange: "10-60",
//       },
//     ],
//     Cortisol: [
//       {
//         name: "morning_cortisol",
//         label: "Morning Cortisol",
//         unit: "µg/dL",
//         normalRange: "6-23",
//       },
//     ],

//     "Vitamin Tests": [
//       {
//         name: "vitamin_d_25_oh",
//         label: "Vitamin D (25-OH)",
//         unit: "ng/mL",
//         normalRange:
//           "30-100 (Sufficiency), 20-29 (Insufficiency), <20 (Deficiency)",
//       },
//       {
//         name: "vitamin_d_1_25_dihydroxy",
//         label: "Vitamin D (1,25-dihydroxy)",
//         unit: "pg/mL",
//         normalRange: "18-78",
//       },
//       {
//         name: "vitamin_b12",
//         label: "Vitamin B12 (Cobalamin)",
//         unit: "pg/mL",
//         normalRange: "200-900",
//       },
//       {
//         name: "folate_serum",
//         label: "Folate (Serum)",
//         unit: "ng/mL",
//         normalRange: "2.7-17.0",
//       },
//       {
//         name: "folate_rbc",
//         label: "Folate (RBC)",
//         unit: "ng/mL RBC",
//         normalRange: "140-960",
//       },

//       {
//         name: "vitamin_a_retinol",
//         label: "Vitamin A (Retinol)",
//         unit: "µg/dL",
//         normalRange: "30-80",
//       },
//       {
//         name: "vitamin_e_alpha_tocopherol",
//         label: "Vitamin E (Alpha-Tocopherol)",
//         unit: "mg/L",
//         normalRange: "5.5-17.0",
//       },
//       {
//         name: "vitamin_k1_phylloquinone",
//         label: "Vitamin K1 (Phylloquinone)",
//         unit: "ng/mL",
//         normalRange: "0.2-3.2",
//       },
//       {
//         name: "vitamin_c_ascorbic_acid",
//         label: "Vitamin C (Ascorbic Acid)",
//         unit: "mg/dL",
//         normalRange: "0.6-2.0",
//       },
//       {
//         name: "vitamin_b1_thiamine",
//         label: "Vitamin B1 (Thiamine)",
//         unit: "nmol/L",
//         normalRange: "70-180 (Whole Blood Thiamine Diphosphate)",
//       },
//       {
//         name: "vitamin_b2_riboflavin",
//         label: "Vitamin B2 (Riboflavin)",
//         unit: "µg/dL",
//         normalRange: "4-24",
//       },
//       {
//         name: "vitamin_b3_niacin",
//         label: "Vitamin B3 (Niacin & Metabolites)",
//         unit: "µg/L (for metabolites)",
//         normalRange: "Varies based on specific metabolite measured",
//       },
//       {
//         name: "vitamin_b6_plp",
//         label: "Vitamin B6 (Pyridoxal 5'-Phosphate - PLP)",
//         unit: "ng/mL",
//         normalRange: "5-50",
//       },
//       {
//         name: "biotin_vitamin_b7",
//         label: "Biotin (Vitamin B7)",
//         unit: "ng/dL",
//         normalRange: "133-3295",
//       },
//     ],
//   },
//   serology: {
//     "C-Reactive Protein (CRP)": [
//       {
//         name: "crp",
//         label: "C-Reactive Protein (CRP)",
//         unit: "mg/L",
//         normalRange: "<3.0",
//       },
//     ],
//     "Rheumatoid Factor (RF)": [
//       {
//         name: "ra_factor",
//         label: "Rheumatoid Factor (RF)",
//         unit: "IU/mL",
//         normalRange: "<14",
//         options: [
//           "Negative",
//           "Weakly Positive",
//           "Positive",
//           "Strongly Positive",
//         ],
//       },
//     ],
//     "Anti-Streptolysin O (ASO)": [
//       {
//         name: "aso",
//         label: "Anti-Streptolysin O (ASO)",
//         unit: "IU/mL",
//         normalRange: "<200",
//         options: ["Negative", "Positive"],
//       },
//     ],
//     "Hepatitis Markers": [
//       {
//         name: "hbsag",
//         label: "Hepatitis B Surface Antigen (HBsAg)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hcv",
//         label: "Anti-HCV",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hav_igm",
//         label: "Anti-HAV IgM",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hav_igg",
//         label: "Anti-HAV IgG",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hbs",
//         label: "Anti-HBs (HBsAb)",
//         unit: "mIU/mL",
//         normalRange: "<10 (Non-immune), ≥10 (Immune)",
//       },
//       {
//         name: "hbeag",
//         label: "HBeAg",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hbe",
//         label: "Anti-HBe (HBeAb)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hbc_igm",
//         label: "Anti-HBc IgM (HBcAb IgM)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "anti_hbc_total",
//         label: "Anti-HBc Total (HBcAb Total)",
//         unit: "Index",
//         normalRange: "<1",
        
//       },
//       {
//         name: "hbv_dna_quant",
//         label: "HBV DNA (Quantitative)",
//         unit: "IU/mL",
//         normalRange: "Not Detected ",
//       },
//       {
//         name: "hcv_rna_quant",
//         label: "HCV RNA (Quantitative)",
//         unit: "IU/mL",
//         normalRange: "Not Detected",
//       },
//       {
//         name: "anti_hev_igm",
//         label: "Anti-HEV IgM",
//         unit: "",
//         normalRange: "<1",
//         options: [],
//       },
//       {
//         name: "anti_hev_igg",
//         label: "Anti-HEV IgG",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//     ],
//     HIV: [
//       {
//         name: "hiv_1_2",
//         label: "Elisa for HIV 1 & 2",
//         unit: "",
//         normalRange: "Non-reactive",
//         options: ["Non-reactive", "Reactive"],
//       },
//       {
//         name: "hiv_non_hcv",
//         label: "Elisa Non-HCV",
//         unit: "",
//         normalRange: "Non-reactive",
//         options: ["Non-reactive", "Reactive"],
//       },
//     ],
//     VDRL: [
//       {
//         name: "vdrl",
//         label: "VDRL",
//         unit: "",
//         normalRange: "Non-reactive",
//         options: ["Non-reactive", "Reactive"],
//       },
//       {
//         name: "vdrl_rpr",
//         label: "VDRL / RPR (Non-Treponemal)",
//         unit: "Titre",
//         normalRange: "Non-reactive",
//         options: ["Non-reactive", "Reactive 1:1", "Reactive 1:2", "...etc"],
//       },
//       {
//         name: "tpha_fta_abs",
//         label: "TPHA / FTA-ABS (Treponemal)",
//         unit: "",
//         normalRange: "Non-reactive",
//         options: ["Non-reactive", "Reactive"],
//       },
//     ],

//     "Allergy Tests": [
//       {
//         name: "total_ige",
//         label: "Total IgE",
//         unit: "IU/mL",
//         normalRange: "<100",
//       },
//       {
//         name: "specific_ige",
//         label: "Specific IgE Panel",
//         unit: "kUA/L",
//         normalRange: "<0.35",
//         options: [
//           "Class 0",
//           "Class 1",
//           "Class 2",
//           "Class 3",
//           "Class 4",
//           "Class 5",
//           "Class 6",
//         ],
//       },
//     ],
//     "WIDAL (SLIDE)": [
//       {
//         name: "s_typhi_o",
//         label: "S. typhi O",
//         unit: "",
//         normalRange: "<1:80",
//         options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320"],
//       },
//       {
//         name: "s_typhi_h",
//         label: "S. typhi H",
//         unit: "",
//         normalRange: "<1:80",
//         options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320"],
//       },
//       {
//         name: "s_paratyphi_ah",
//         label: "S. paratyphi AH",
//         unit: "",
//         normalRange: "<1:80",
//         options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320"],
//       },
//       {
//         name: "s_paratyphi_bh",
//         label: "S. paratyphi BH",
//         unit: "",
//         normalRange: "<1:80",
//         options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320"],
//       },
//     ],
//     "WIDAL (RAPID)": [
//       {
//         name: "s_typhi_o_rapid",
//         label: "S. typhi O",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "s_typhi_h_rapid",
//         label: "S. typhi H",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "s_paratyphi_ah_rapid",
//         label: "S. paratyphi AH",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "s_paratyphi_bh_rapid",
//         label: "S. paratyphi BH",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//     ],
//     MOUNTOUX: [
//       {
//         name: "mountoux",
//         label: "Mantoux Test",
//         unit: "mm",
//         normalRange: "<10mm",
//       },
//     ],
//     "CRP (SLIDE)": [
//       {
//         name: "crp_slide",
//         label: "C-Reactive Protein (Slide)",
//         unit: "mg/L",
//         normalRange: "<6",
//       },
//     ],
//     "CRP (TURBI/LATEX)": [
//       {
//         name: "crp_turbi",
//         label: "C-Reactive Protein (Turbidimetry)",
//         unit: "mg/L",
//         normalRange: "<6",
//       },
//     ],
//     "ASO TITRE (SLIDE)": [
//       {
//         name: "aso_slide",
//         label: "Anti-Streptolysin O Titre (Slide)",
//         unit: "IU/mL",
//         normalRange: "<200",
//       },
//     ],
//     "ASO TITRE (TURBI)": [
//       {
//         name: "aso_turbi",
//         label: "Anti-Streptolysin O Titre (Turbidimetry)",
//         unit: "IU/mL",
//         normalRange: "<200",
//       },
//     ],
//     "DENGUE (IgE/IgG/IgM)": [
//       {
//         name: "dengue_serology",
//         label: "Dengue Serology",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//     ],
//     CHIKENGUNYA: [
//       {
//         name: "chikungunya",
//         label: "Chikungunya Test",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//     ],
//     "Kala-azar (rK39) Test": [
//       {
//         name: "rk39_antibody_test",
//         label: "rK39 Antibody Test",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//     ],
//     "COVID-19 PCR/NAAT": [
//       {
//         name: "sars_cov_2_rna_pcr",
//         label: "SARS-CoV-2 RNA/DNA (PCR/NAAT)",
//         unit: "",
//         normalRange: "Not Detected",
//         options: ["Detected", "Not Detected", "Inconclusive"],
//       },
//     ],
//     "COVID-19 Antigen Test": [
//       {
//         name: "sars_cov_2_antigen",
//         label: "SARS-CoV-2 Antigen",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//     ],
//     "COVID-19 Antibody Test": [
//       {
//         name: "sars_cov_2_igg_antibody",
//         label: "SARS-CoV-2 IgG Antibody (e.g., Anti-Spike, Anti-N)",
//         unit: "Index or Titer",
//         normalRange: "Negative / Non-reactive",
//       },
//       {
//         name: "sars_cov_2_igm_antibody",
//         label: "SARS-CoV-2 IgM Antibody",
//         unit: "Index or Titer",
//         normalRange: "Negative / Non-reactive",
//       },
//     ],
//     "Filariasis Serology/Antigen": [
//       {
//         name: "filarial_antigen",
//         label: "Filarial Antigen (e.g., W. bancrofti ICT)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//       {
//         name: "anti_filarial_igg4",
//         label: "Anti-filarial IgG4",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//     ],
//     "H. pylori Testing": [
//       {
//         name: "hpylori_igg_serum",
//         label: "H. pylori IgG (Serum)",
//         unit: "",
//         normalRange: "Negative",
//       },
//       {
//         name: "hpylori_stool_antigen",
//         label: "H. pylori Stool Antigen",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//       {
//         name: "hpylori_iga_serum",
//         label: "H. pylori IgA (Serum)",
//         unit: "",
//         normalRange: "<0.9",
//         options: [],
//       },
//     ],
//     "Blood Group Antibody Titres": [
//       {
//         name: "anti_a_igg_titre",
//         label: "Anti-A IgG Titre",
//         unit: "Titre", // e.g., 1:64, 1:128
//         normalRange: "Varies (e.g., <1:64 or as per clinical context)",
//         options: [
//           // Example titre options, can be more granular
//           "Not Detected",
//           "<1:4",
//           "1:4",
//           "1:8",
//           "1:16",
//           "1:32",
//           "1:64",
//           "1:128",
//           "1:256",
//           "1:512",
//           "1:1024",
//           ">1:1024",
//         ],
//       },
//       {
//         name: "anti_a_igm_titre",
//         label: "Anti-A IgM Titre",
//         unit: "Titre",
//         normalRange: "Varies",
//         options: [
//           "Not Detected",
//           "<1:4",
//           "1:4",
//           "1:8",
//           "1:16",
//           "1:32",
//           "1:64",
//           "1:128",
//           "1:256",
//           "1:512",
//           "1:1024",
//           ">1:1024",
//         ],
//       },
//       {
//         name: "anti_b_igg_titre",
//         label: "Anti-B IgG Titre",
//         unit: "Titre",
//         normalRange: "Varies (e.g., <1:64 or as per clinical context)",
//         options: [
//           "Not Detected",
//           "<1:4",
//           "1:4",
//           "1:8",
//           "1:16",
//           "1:32",
//           "1:64",
//           "1:128",
//           "1:256",
//           "1:512",
//           "1:1024",
//           ">1:1024",
//         ],
//       },
//       {
//         name: "anti_b_igm_titre",
//         label: "Anti-B IgM Titre",
//         unit: "Titre",
//         normalRange: "Varies",
//         options: [
//           "Not Detected",
//           "<1:4",
//           "1:4",
//           "1:8",
//           "1:16",
//           "1:32",
//           "1:64",
//           "1:128",
//           "1:256",
//           "1:512",
//           "1:1024",
//           ">1:1024",
//         ],
//       },
//     ],

//     "TORCH Panel": [
//       {
//         name: "toxoplasma_igg",
//         label: "Toxoplasma gondii IgG",
//         unit: "IU/mL",
//         normalRange: "Negative (e.g., <1.0 IU/mL or <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//         description: "Indicates past or chronic Toxoplasma infection.",
//       },
//       {
//         name: "toxoplasma_igm",
//         label: "Toxoplasma gondii IgM",
//         unit: "Index",
//         normalRange: "Negative",
//         options: ["Positive", "Negative", "Equivocal"],
//         description:
//           "Suggests recent or acute Toxoplasma infection. May require confirmation.",
//       },
//       {
//         name: "toxoplasma_igg_avidity",
//         label: "Toxoplasma gondii IgG Avidity",
//         unit: "% or Index",
//         normalRange: "High Avidity",
//         options: [
//           "High Avidity",
//           "Low Avidity",
//           "Borderline/Equivocal Avidity",
//         ],
//         description:
//           "Helps differentiate recent from past infection, especially if IgM is positive.",
//       },
//       {
//         name: "rubella_igg",
//         label: "Rubella IgG",
//         unit: "IU/mL",
//         normalRange: "<10 (Non-immune), ≥10 (Immune)",
//         options: ["Positive (Immune)", "Negative (Non-immune)", "Equivocal"],
//         description:
//           "Indicates immunity to Rubella, either from past infection or vaccination.",
//       },
//       {
//         name: "rubella_igm",
//         label: "Rubella IgM",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//         description:
//           "Suggests recent Rubella infection or recent vaccination. IgM can persist.",
//       },
//       {
//         name: "cmv_igg",
//         label: "Cytomegalovirus (CMV) IgG",
//         unit: "U/mL or AU/mL or Index",
//         normalRange: "Negative (e.g., <0.9 Index or <6.0 U/mL)",
//         options: ["Positive", "Negative", "Equivocal"],
//         description: "Indicates past or chronic CMV infection.",
//       },
//       {
//         name: "cmv_igm",
//         label: "Cytomegalovirus (CMV) IgM",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//         description:
//           "Suggests recent, acute, or reactivated CMV infection. Can persist or be false positive.",
//       },
//       {
//         name: "cmv_igg_avidity",
//         label: "CMV IgG Avidity",
//         unit: "% or Index",
//         normalRange: "High Avidity (suggests infection >3-4 months prior)",
//         options: [
//           "High Avidity",
//           "Low Avidity",
//           "Borderline/Equivocal Avidity",
//         ],
//         description:
//           "Helps differentiate recent from past CMV infection, especially if IgM is positive.",
//       },
//       {
//         name: "hsv_1_igg_torch",
//         label: "Herpes Simplex Virus Type 1 (HSV-1) IgG (TORCH)",
//         unit: "Index or Titer",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//       {
//         name: "hsv_2_igg_torch",
//         label: "Herpes Simplex Virus Type 2 (HSV-2) IgG (TORCH)",
//         unit: "Index or Titer",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },

//       {
//         name: "torch_panel_overall_interpretation",
//         label: "TORCH Panel Overall Interpretation/Summary",
//         unit: "",
//         normalRange: "No evidence of infection.",
//       },
//     ],
//     "Herpes Simplex Virus (HSV) Serology": [
//       {
//         name: "hsv_1_igg",
//         label: "Herpes Simplex Virus Type 1 (HSV-1) IgG",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//       {
//         name: "hsv_1_igm",
//         label: "Herpes Simplex Virus Type 1 (HSV-1) IgM",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//       {
//         name: "hsv_2_igg",
//         label: "Herpes Simplex Virus Type 2 (HSV-2) IgG",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//       {
//         name: "hsv_2_igm",
//         label: "Herpes Simplex Virus Type 2 (HSV-2) IgM",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//       {
//         name: "hsv_igg_type_common",
//         label: "Herpes Simplex Virus (Types 1 & 2 Combined) IgG",
//         unit: "Index",
//         normalRange: "Negative (e.g., <0.9 Index)",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//       {
//         name: "hsv_serology_interpretation",
//         label: "HSV Serology Interpretation/Summary",
//         unit: "",
//         normalRange: "Based on pattern.",
//       },
//     ],
//   },
//   microbiology: {
//     "Urine Culture": [
//       {
//         name: "organism",
//         label: "Organism",
//         unit: "",
//         normalRange: "No growth",
//         options: [
//           "No growth",
//           "E. coli",
//           "Klebsiella",
//           "Proteus",
//           "Enterococcus",
//           "Pseudomonas",
//           "Candida",
//           "Other",
//         ],
//       },
//       {
//         name: "colony_count",
//         label: "Colony Count",
//         unit: "CFU/mL",
//         normalRange: "<10,000",
//       },
//     ],
//     "Stool Culture": [
//       {
//         name: "anti_b_igg_titre",
//         label: "Anti-B IgG Titre",
//         unit: "Titre",
//         normalRange: "Varies (e.g. <1:64)",
//       },
//     ],
//     "Blood Culture": [
//       {
//         name: "organism",
//         label: "Organism",
//         unit: "",
//         normalRange: "No growth",
//         options: [
//           "No growth",
//           "Staphylococcus aureus",
//           "Streptococcus pneumoniae",
//           "E. coli",
//           "Klebsiella",
//           "Pseudomonas",
//           "Candida",
//           "Other",
//         ],
//       },
//       {
//         name: "antibiotic_sensitivity",
//         label: "Antibiotic Sensitivity",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Sputum Culture": [
//       {
//         name: "organism",
//         label: "Organism",
//         unit: "",
//         normalRange: "Normal respiratory flora",
//         options: [
//           "Normal respiratory flora",
//           "Streptococcus pneumoniae",
//           "Haemophilus influenzae",
//           "Moraxella catarrhalis",
//           "Pseudomonas aeruginosa",
//           "Mycobacterium tuberculosis",
//           "Other",
//         ],
//       },
//       {
//         name: "toxoplasma_igm",
//         label: "Toxoplasma gondii IgM",
//         unit: "Index",
//         normalRange: "Negative / < Cutoff",
//       },
//     ],
//   },
//   immunology: {
//     "Antinuclear Antibodies (ANA)": [
//       {
//         name: "ana",
//         label: "Antinuclear Antibodies (ANA)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "ana_titre",
//         label: "ANA Titre",
//         unit: "Titre",
//         normalRange: "<1:80",
//         options: [],
//       },
//     ],
//     "Anti-dsDNA": [
//       {
//         name: "anti_dsdna",
//         label: "Anti-dsDNA",
//         unit: "IU/mL",
//         normalRange: "<30",
//       },
//     ],
//     "Complement Levels": [
//       {
//         name: "c3",
//         label: "Complement C3",
//         unit: "mg/dL",
//         normalRange: "90-180",
//       },
//       {
//         name: "c4",
//         label: "Complement C4",
//         unit: "mg/dL",
//         normalRange: "10-40",
//       },
//     ],
//     "Immunoglobulins (IgG, IgM)": [
//       {
//         name: "igg",
//         label: "Immunoglobulin G (IgG)",
//         unit: "mg/dL",
//         normalRange: "700-1600",
//       },
//       {
//         name: "igm",
//         label: "Immunoglobulin M (IgM)",
//         unit: "mg/dL",
//         normalRange: "40-230",
//       },
//       {
//         name: "igg_subclass_1",
//         label: "IgG Subclass 1",
//         unit: "mg/dL",
//         normalRange: "382-929",
//       },
//       {
//         name: "igg_subclass_2",
//         label: "IgG Subclass 2",
//         unit: "mg/dL",
//         normalRange: "242-700",
//       },
//       {
//         name: "igg_subclass_3",
//         label: "IgG Subclass 3",
//         unit: "mg/dL",
//         normalRange: "22-178",
//       },
//       {
//         name: "igg_subclass_4",
//         label: "IgG Subclass 4",
//         unit: "mg/dL",
//         normalRange: "4-86",
//       },
//     ],
//     "Serum Free Light Chains (FLC)": [
//       {
//         name: "kappa_flc_serum",
//         label: "Kappa Free Light Chain (Serum)",
//         unit: "mg/L",
//         normalRange: "3.30-19.40",
//       },
//       {
//         name: "lambda_flc_serum",
//         label: "Lambda Free Light Chain (Serum)",
//         unit: "mg/L",
//         normalRange: "5.71-26.30",
//       },
//       {
//         name: "kappa_lambda_flc_ratio_serum",
//         label: "Kappa/Lambda FLC Ratio (Serum)",
//         unit: "",
//         normalRange: "0.26-1.65",
//         calculationDetails: {
//           formula: "kappa_flc_serum / lambda_flc_serum",
//           dependencies: ["kappa_flc_serum", "lambda_flc_serum"],
//         },
//       },
//     ],

//     "HLA-B27 Typing": [
//       {
//         name: "hla_b27_result",
//         label: "HLA-B27",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative", "Indeterminate"],
//       },
//     ],

//     "Interferon-Gamma Release Assay (IGRA) for TB": [
//       {
//         name: "igra_nil_control",
//         label: "Nil Control (IFN-γ)",
//         unit: "IU/mL",
//         normalRange: "Value (e.g., ≤0.35)",
//       },
//       {
//         name: "igra_tb_antigen",
//         label: "TB Antigen Response (IFN-γ)",
//         unit: "IU/mL",
//         normalRange: "Value",
//       },
//       {
//         name: "igra_mitogen_control",
//         label: "Mitogen Control (IFN-γ)",
//         unit: "IU/mL",
//         normalRange: "Value (e.g., ≥0.5)",
//       },
//       {
//         name: "igra_interpretation",
//         label: "Interpretation",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative", "Indeterminate", "Borderline"],
//       },
//     ],

//     "Extractable Nuclear Antigen (ENA) Panel": [
//       {
//         name: "anti_sm_ab",
//         label: "Anti-Smith (Anti-Sm) Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//       {
//         name: "anti_rnp_ab",
//         label: "Anti-RNP (Ribonucleoprotein) Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//       {
//         name: "anti_ssa_ro_ab",
//         label: "Anti-SSA (Ro) Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//       {
//         name: "anti_ssb_la_ab",
//         label: "Anti-SSB (La) Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//       {
//         name: "anti_scl_70_ab",
//         label: "Anti-Scl-70 (Topoisomerase I) Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//       {
//         name: "anti_jo_1_ab",
//         label: "Anti-Jo-1 (Histidyl tRNA synthetase) Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//       {
//         name: "anti_centromere_b_ab",
//         label: "Anti-Centromere B Antibody",
//         unit: "U/mL or Index",
//         normalRange: "Negative / < Cutoff",
//       },
//     ],
//     "Anti-CCP Antibodies": [
//     {
//       name: "anti_ccp_level",
//       label: "Anti-Cyclic Citrullinated Peptide (Anti-CCP) Level",
//       unit: "U/mL",
//       normalRange: "<20.0"
//     },
//     {
//       name: "anti_ccp_qualitative",
//       label: "Anti-CCP Result (Qualitative)",
//       unit: "",
//       normalRange: "Negative",
//       options: ["Positive", "Negative", "Equivocal", "Weakly Positive", "Moderately Positive", "Strongly Positive"]
//     }
//   ]
// },

 
//   "tumor-markers": {
//     "Prostate Specific Antigen (PSA)": [
//       {
//         name: "psa",
//         label: "Sr Prostate Specific Antigen (PSA)",
//         unit: "ng/mL",
//         normalRange: "<4",
//       },
//     ],
//     "Carcinoembryonic Antigen (CEA)": [
//       {
//         name: "cea",
//         label: "Carcinoembryonic Antigen (CEA)",
//         unit: "ng/mL",
//         normalRange: "<3 (non-smokers), <5 (smokers)",
//       },
//     ],
//     "Cancer Antigen 125 (CA-125)": [
//       {
//         name: "ca_125",
//         label: "Cancer Antigen 125 (CA-125)",
//         unit: "U/mL",
//         normalRange: "<35",
//       },
//     ],
//     "Alpha-Fetoprotein (AFP)": [
//       {
//         name: "afp",
//         label: "Alpha-Fetoprotein (AFP)",
//         unit: "ng/mL",
//         normalRange: "<10",
//       },
//     ],
//   },
//   "urine-analysis": {
//     "Routine Urine": [
//       {
//         name: "color",
//         label: "Color",
//         unit: "",
//         normalRange: "Pale yellow to amber",
//         options: ["Pale yellow", "Yellow", "Amber", "Red", "Brown", "Other"],
//       },
//       {
//         name: "appearance",
//         label: "Appearance",
//         unit: "",
//         normalRange: "Clear",
//         options: ["Clear", "Slightly cloudy", "Cloudy", "Turbid"],
//       },
//       {
//         name: "specific_gravity",
//         label: "Specific Gravity",
//         unit: "",
//         normalRange: "1.005-1.030",
//       },
//       { name: "ph", label: "pH", unit: "", normalRange: "4.5-8" },
//       {
//         name: "protein",
//         label: "Protein",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
//       },
//       {
//         name: "glucose",
//         label: "Glucose",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
//       },
//       {
//         name: "ketones",
//         label: "Ketones",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "Small", "Moderate", "Large"],
//       },
//       {
//         name: "bilirubin",
//         label: "Bilirubin",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+"],
//       },
//       {
//         name: "rbc_urine",
//         label: "RBC",
//         unit: "/HPF",
//         normalRange: "0-2",
//         options: ["0-2", "2-4", "4-6", "6-8", "8-10", ">10", "Plenty"],
//       },
//       {
//         name: "pus_cells",
//         label: "Pus Cells",
//         unit: "/HPF",
//         normalRange: "0-5",
//         options: ["0-5", "5-10", "10-15", "15-20", "20-25", ">25", "Plenty"],
//       },
//       {
//         name: "epithelial_cells",
//         label: "Epithelial Cells",
//         unit: "/HPF",
//         normalRange: "Few",
//         options: ["Nil", "Occasional", "Few", "Moderate", "Plenty"],
//       },
//       {
//         name: "casts",
//         label: "Casts",
//         unit: "",
//         normalRange: "Negative",
//         options: [
//           "Negative",
//           "Hyaline",
//           "Granular",
//           "RBC",
//           "WBC",
//           "Waxy",
//           "Fatty",
//         ],
//       },
//       {
//         name: "crystals",
//         label: "Crystals",
//         unit: "",
//         normalRange: "Negative",
//         options: [
//           "Negative",
//           "Calcium Oxalate",
//           "Uric Acid",
//           "Triple Phosphate",
//           "Amorphous Phosphate",
//           "Amorphous Urate",
//         ],
//       },
//       {
//         name: "bacteria",
//         label: "Bacteria",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Few", "Moderate", "Plenty"],
//       },
//       {
//         name: "yeast_cells",
//         label: "Yeast Cells",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Present"],
//       },
//       {
//         name: "hsv2_igm",
//         label: "HSV-2 IgM",
//         unit: "Index or Titer",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+"],
//       },
//       {
//         name: "leukocyte_esterase",
//         label: "Leukocyte Esterase",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "Small", "Moderate", "Large"],
//       },
//       {
//         name: "nitrite",
//         label: "Nitrite",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//     ],

//     "URINE R/E": [
//       {
//         name: "color",
//         label: "Color",
//         unit: "",
//         normalRange: "Pale yellow to amber",
//         options: ["Pale yellow", "Yellow", "Amber", "Red", "Brown", "Other"],
//       },
//       {
//         name: "appearance",
//         label: "Appearance",
//         unit: "",
//         normalRange: "Clear",
//         options: ["Clear", "Slightly cloudy", "Cloudy", "Turbid"],
//       },
//       {
//         name: "specific_gravity",
//         label: "Specific Gravity",
//         unit: "",
//         normalRange: "1.005-1.030",
//       },
//       {
//         name: "ph",
//         label: "pH",
//         unit: "",
//         normalRange: "4.5-8",
//       },
//       {
//         name: "protein",
//         label: "Protein",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
//       },
//       {
//         name: "glucose",
//         label: "Glucose",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
//       },
//       {
//         name: "ketones",
//         label: "Ketones",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "Small", "Moderate", "Large"],
//       },
//       {
//         name: "blood",
//         label: "Blood",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
//       },
//       {
//         name: "pus_cells",
//         label: "Pus Cells",
//         unit: "/HPF",
//         normalRange: "0-5",
//         options: ["0-5", "5-10", "10-15", "15-20", "20-25", ">25", "Plenty"],
//       },
//       {
//         name: "epithelial_cells",
//         label: "Epithelial Cells",
//         unit: "/HPF",
//         normalRange: "Few",
//         options: ["Nil", "Occasional", "Few", "Moderate", "Plenty"],
//       },
//     ],
//     "URINE (BS,BP,URO)": [
//       {
//         name: "blood_sugar",
//         label: "Blood Sugar (BS)",
//         unit: "mg/dL",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+", "4+"],
//       },
//       {
//         name: "bile_pigments",
//         label: "Bile Pigments (BP)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+"],
//       },
//       {
//         name: "urobilinogen",
//         label: "Urobilinogen (URO)",
//         unit: "mg/dL",
//         normalRange: "0.1-1.0",
//         options: ["Normal", "1+", "2+", "3+", "4+"],
//       },
//     ],
//     "URINE C/S": [
//       {
//         name: "organism_identification",
//         label: "Organism Identification",
//         unit: "",
//         normalRange: "No growth",
//         options: [
//           "No growth",
//           "E. coli",
//           "Klebsiella",
//           "Proteus",
//           "Enterococcus",
//           "Pseudomonas",
//           "Candida",
//           "Other",
//         ],
//       },
//       {
//         name: "colony_count",
//         label: "Colony Count",
//         unit: "CFU/mL",
//         normalRange: "<10,000",
//       },
//       {
//         name: "antibiotic_sensitivity",
//         label: "Antibiotic Sensitivity",
//         unit: "",
//         normalRange: "",
//         options: ["Sensitive", "Resistant", "Intermediate"],
//       },
//     ],
//     "URINE HCG": [
//       {
//         name: "pregnancy_test",
//         label: "Pregnancy Test (HCG)",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative"],
//       },
//       {
//         name: "hcg_concentration",
//         label: "HCG Concentration",
//         unit: "mIU/mL",
//         normalRange: "<5 (non-pregnant)",
//       },
//     ],
//     "URINE CHYLE": [
//       {
//         name: "chyle",
//         label: "Chyle",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Trace", "1+", "2+", "3+"],
//       },
//     ],
//     "Urine Osmolality": [
//       {
//         name: "osmolality",
//         label: "Osmolality",
//         unit: "mOsm/kg H2O",
//         normalRange: "300-900",
//       },
//     ],
//     "24-Hour Urine Electrolytes": [
//       {
//         name: "volume_24hr",
//         label: "24-Hour Volume",
//         unit: "mL",
//         normalRange: "800-2000",
//       },
//       {
//         name: "sodium_24hr",
//         label: "24-Hour Sodium",
//         unit: "mEq/24hr",
//         normalRange: "40-220",
//       },
//       {
//         name: "potassium_24hr",
//         label: "24-Hour Potassium",
//         unit: "mEq/24hr",
//         normalRange: "25-125",
//       },
//       {
//         name: "chloride_24hr",
//         label: "24-Hour Chloride",
//         unit: "mEq/24hr",
//         normalRange: "110-250",
//       },
//       {
//         name: "calcium_24hr",
//         label: "24-Hour Calcium",
//         unit: "mg/24hr",
//         normalRange: "100-300",
//       },
//       {
//         name: "phosphorus_24hr",
//         label: "24-Hour Phosphorus",
//         unit: "mg/24hr",
//         normalRange: "400-1300",
//       },
//       {
//         name: "magnesium_24hr",
//         label: "24-Hour Magnesium",
//         unit: "mg/24hr",
//         normalRange: "70-155",
//       },
//       {
//         name: "creatinine_24hr",
//         label: "24-Hour Creatinine",
//         unit: "mg/24hr",
//         normalRange: "1000-2000",
//       },
//     ],
//     "Urine Protein Electrophoresis (UPEP)": [
//       {
//         name: "total_protein_24hr",
//         label: "Total Protein (24hr)",
//         unit: "mg/24hr",
//         normalRange: "<150",
//       },
//       {
//         name: "albumin_percentage",
//         label: "Albumin",
//         unit: "%",
//         normalRange: "40-60",
//       },
//       {
//         name: "alpha1_percentage",
//         label: "Alpha-1 Globulin",
//         unit: "%",
//         normalRange: "4-8",
//       },
//       {
//         name: "alpha2_percentage",
//         label: "Alpha-2 Globulin",
//         unit: "%",
//         normalRange: "8-13",
//       },
//       {
//         name: "beta_percentage",
//         label: "Beta Globulin",
//         unit: "%",
//         normalRange: "8-14",
//       },
//       {
//         name: "gamma_percentage",
//         label: "Gamma Globulin",
//         unit: "%",
//         normalRange: "11-22",
//       },
//       {
//         name: "m_protein",
//         label: "M-Protein",
//         unit: "",
//         normalRange: "Not Detected",
//         options: ["Not Detected", "Present"],
//       },
//       {
//         name: "interpretation",
//         label: "Interpretation",
//         unit: "",
//         normalRange: "Normal pattern",
//         options: [
//           "Normal pattern",
//           "Glomerular pattern",
//           "Tubular pattern",
//           "Mixed pattern",
//           "Overflow pattern",
//         ],
//       },
//     ],
//     "Urine Organic Acids Panel": [
//       {
//         name: "collection_duration",
//         label: "Collection Duration",
//         unit: "hours",
//         normalRange: "24",
//       },
//       {
//         name: "creatinine",
//         label: "Creatinine",
//         unit: "mg/24hr",
//         normalRange: "1000-2000",
//       },
//       {
//         name: "lactic_acid",
//         label: "Lactic Acid",
//         unit: "mmol/mol creatinine",
//         normalRange: "<100",
//       },
//       {
//         name: "pyruvic_acid",
//         label: "Pyruvic Acid",
//         unit: "mmol/mol creatinine",
//         normalRange: "<20",
//       },
//       {
//         name: "citric_acid",
//         label: "Citric Acid",
//         unit: "mmol/mol creatinine",
//         normalRange: "80-640",
//       },
//       {
//         name: "oxalic_acid",
//         label: "Oxalic Acid",
//         unit: "mmol/mol creatinine",
//         normalRange: "20-100",
//       },
//       {
//         name: "interpretation",
//         label: "Interpretation",
//         unit: "",
//         normalRange: "Normal organic acid pattern",
//         options: [
//           "Normal organic acid pattern",
//           "Abnormal pattern - specify in comments",
//           "Suggestive of metabolic disorder",
//           "Non-specific changes",
//         ],
//       },
//     ],
//   },
//   "blood-typing":{
//     "ABO and Rh Typing": [
//       {
//         name: "blood_group",
//         label: "Blood Group",
//         unit: "",
//         normalRange: "",
//         options: ["A", "B", "AB", "O"],
//       },
//       {
//         name: "rh_factor",
//         label: "Rh Factor",
//         unit: "",
//         normalRange: "",
//         options: ["Positive", "Negative"],
//       },
//     ],
//     "Australian Antigen": [
//       {
//         name: "hbsag",
//         label: "Australian Antigen",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//     ],
//     "Antibody Screening": [
//       {
//         name: "antibody_screen",
//         label: "Antibody Screen",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Negative", "Positive"],
//       },
//       {
//         name: "antibody_identification",
//         label: "Antibody Identification",
//         unit: "",
//         normalRange: "None detected",
//       },
//     ],

//   },
//   radiology: {
//     "CT Scan": [
//       { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
//       {
//         name: "contrast_used",
//         label: "Contrast Used",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     MRI: [
//       { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
//       {
//         name: "sequence_used",
//         label: "Sequences Used",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     "Ultrasonography Whole Abdomen": [
//       {
//         name: "liver",
//         label: "Liver",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "gallbladder",
//         label: "Gallbladder",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "cbd",
//         label: "Common Bile Duct (CBD)",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "pancreas",
//         label: "Pancreas",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "spleen",
//         label: "Spleen",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "kidneys",
//         label: "Kidneys",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "urinary_bladder",
//         label: "Urinary Bladder",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "retroperitoneum",
//         label: "Retroperitoneum",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "stomach_bowel",
//         label: "Stomach and Bowel Loops",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "pelvis",
//         label: "Pelvis",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "prostate",
//         label: "Prostate",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "ascites_peritoneum",
//         label: "Ascites and Peritoneum",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "abdominal_wall",
//         label: "Abdominal Wall",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "findings",
//         label: "Findings",
//         unit: "",
//         normalRange: "",
//       },
//       {
//         name: "impression",
//         label: "Impression",
//         unit: "",
//         normalRange: "",
//       },
//     ],
//     "X-Ray": [
//       { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
//       { name: "view", label: "View", unit: "", normalRange: "N/A" },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     "IVP (Intravenous Pyelogram)": [
//       {
//         name: "contrast_used",
//         label: "Contrast Used",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "kidney_function",
//         label: "Kidney Function",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "ureter_visibility",
//         label: "Ureter Visibility",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "bladder_appearance",
//         label: "Bladder Appearance",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     "CT KUB": [
//       {
//         name: "kidney_appearance",
//         label: "Kidney Appearance",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "ureter_status",
//         label: "Ureter Status",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "bladder_appearance",
//         label: "Bladder Appearance",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "calculi_presence",
//         label: "Calculi Presence",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     "PET Scan": [
//       {
//         name: "radiopharmaceutical",
//         label: "Radiopharmaceutical Used",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "uptake_areas",
//         label: "Areas of Uptake",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "suv_max", label: "SUV Max", unit: "", normalRange: "N/A" },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     Mammography: [
//       {
//         name: "breast_composition",
//         label: "Breast Composition",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "mass_presence",
//         label: "Mass Presence",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "calcifications",
//         label: "Calcifications",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "birads_category",
//         label: "BIRADS Category",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     "Bone Densitometry (DEXA)": [
//       {
//         name: "lumbar_spine_bmd",
//         label: "Lumbar Spine BMD",
//         unit: "g/cm²",
//         normalRange: "N/A",
//       },
//       {
//         name: "lumbar_spine_tscore",
//         label: "Lumbar Spine T-score",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "femoral_neck_bmd",
//         label: "Femoral Neck BMD",
//         unit: "g/cm²",
//         normalRange: "N/A",
//       },
//       {
//         name: "femoral_neck_tscore",
//         label: "Femoral Neck T-score",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//     Angiography: [
//       { name: "study_area", label: "Study Area", unit: "", normalRange: "N/A" },
//       {
//         name: "contrast_used",
//         label: "Contrast Used",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "vessel_patency",
//         label: "Vessel Patency",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "stenosis_presence",
//         label: "Stenosis Presence",
//         unit: "",
//         normalRange: "N/A",
//       },
//       { name: "findings", label: "Findings", unit: "", normalRange: "N/A" },
//       { name: "impression", label: "Impression", unit: "", normalRange: "N/A" },
//     ],
//   },
//   histopathology: {
//     "FNAC (Fine Needle Aspiration Cytology)": [
//       {
//         name: "specimen_type",
//         label: "Specimen Type",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "adequacy",
//         label: "Specimen Adequacy",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Adequate", "Suboptimal", "Inadequate"],
//       },
//       {
//         name: "cellularity",
//         label: "Cellularity",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Scant", "Moderate", "Abundant"],
//       },
//       {
//         name: "cytological_findings",
//         label: "Cytological Findings",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Skin Biopsy": [
//       {
//         name: "specimen_site",
//         label: "Biopsy Site",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "specimen_size",
//         label: "Specimen Size",
//         unit: "cm",
//         normalRange: "N/A",
//       },
//       {
//         name: "epidermis_description",
//         label: "Epidermis Description",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "dermis_description",
//         label: "Dermis Description",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "microscopic_findings",
//         label: "Microscopic Findings",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Liver Biopsy": [
//       {
//         name: "specimen_adequacy",
//         label: "Specimen Adequacy",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Adequate", "Suboptimal", "Inadequate"],
//       },
//       {
//         name: "portal_tracts",
//         label: "Number of Portal Tracts",
//         unit: "",
//         normalRange: "≥10",
//       },
//       {
//         name: "fibrosis_stage",
//         label: "Fibrosis Stage",
//         unit: "",
//         normalRange: "0",
//         options: ["0", "1", "2", "3", "4"],
//       },
//       {
//         name: "inflammation_grade",
//         label: "Inflammation Grade",
//         unit: "",
//         normalRange: "0",
//         options: ["0", "1", "2", "3"],
//       },
//       {
//         name: "steatosis",
//         label: "Steatosis",
//         unit: "%",
//         normalRange: "<5%",
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Prostate Biopsy": [
//       {
//         name: "number_of_cores",
//         label: "Number of Cores",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "core_lengths",
//         label: "Core Lengths",
//         unit: "mm",
//         normalRange: "N/A",
//       },
//       {
//         name: "gleason_score",
//         label: "Gleason Score",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "percentage_involvement",
//         label: "Percentage of Core Involvement",
//         unit: "%",
//         normalRange: "N/A",
//       },
//       {
//         name: "perineural_invasion",
//         label: "Perineural Invasion",
//         unit: "",
//         normalRange: "Absent",
//         options: ["Present", "Absent"],
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Breast Biopsy": [
//       {
//         name: "specimen_type",
//         label: "Specimen Type",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Core Biopsy", "Excisional Biopsy", "Other"],
//       },
//       {
//         name: "tumor_size",
//         label: "Tumor Size",
//         unit: "cm",
//         normalRange: "N/A",
//       },
//       {
//         name: "histological_type",
//         label: "Histological Type",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "tumor_grade",
//         label: "Tumor Grade",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Grade 1", "Grade 2", "Grade 3"],
//       },
//       {
//         name: "lymphovascular_invasion",
//         label: "Lymphovascular Invasion",
//         unit: "",
//         normalRange: "Absent",
//         options: ["Present", "Absent"],
//       },
//       {
//         name: "hormone_receptor_status",
//         label: "Hormone Receptor Status",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "her2_status",
//         label: "HER2 Status",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Positive", "Negative", "Equivocal"],
//       },
//     ],
//     "Kidney Biopsy": [
//       {
//         name: "specimen_adequacy",
//         label: "Specimen Adequacy",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Adequate", "Suboptimal", "Inadequate"],
//       },
//       {
//         name: "number_of_glomeruli",
//         label: "Number of Glomeruli",
//         unit: "",
//         normalRange: "≥10",
//       },
//       {
//         name: "light_microscopy",
//         label: "Light Microscopy Findings",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "immunofluorescence",
//         label: "Immunofluorescence Findings",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "electron_microscopy",
//         label: "Electron Microscopy Findings",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Bone Marrow Biopsy": [
//       {
//         name: "specimen_adequacy",
//         label: "Specimen Adequacy",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "cellularity",
//         label: "Cellularity",
//         unit: "%",
//         normalRange: "40-60%",
//       },
//       {
//         name: "myeloid_series",
//         label: "Myeloid Series",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "erythroid_series",
//         label: "Erythroid Series",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "megakaryocytes",
//         label: "Megakaryocytes",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "iron_stores",
//         label: "Iron Stores",
//         unit: "",
//         normalRange: "Present",
//         options: ["Absent", "Present", "Increased"],
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Lymph Node Biopsy": [
//       {
//         name: "specimen_size",
//         label: "Specimen Size",
//         unit: "cm",
//         normalRange: "N/A",
//       },
//       {
//         name: "architecture",
//         label: "Architecture",
//         unit: "",
//         normalRange: "Preserved",
//         options: ["Preserved", "Partially Effaced", "Completely Effaced"],
//       },
//       {
//         name: "cellular_composition",
//         label: "Cellular Composition",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "special_stains",
//         label: "Special Stains",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "immunophenotype",
//         label: "Immunophenotype",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "diagnosis",
//         label: "Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//     "Frozen Section": [
//       {
//         name: "specimen_type",
//         label: "Specimen Type",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "frozen_section_diagnosis",
//         label: "Frozen Section Diagnosis",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "margin_status",
//         label: "Margin Status",
//         unit: "",
//         normalRange: "Negative",
//         options: ["Positive", "Negative", "Close"],
//       },
//       {
//         name: "correlation_with_final",
//         label: "Correlation with Final Diagnosis",
//         unit: "",
//         normalRange: "Concordant",
//         options: ["Concordant", "Discordant"],
//       },
//     ],
//     "Pap Smear": [
//       {
//         name: "specimen_adequacy",
//         label: "Specimen Adequacy",
//         unit: "",
//         normalRange: "Satisfactory",
//         options: ["Satisfactory", "Unsatisfactory"],
//       },
//       {
//         name: "epithelial_cell_abnormality",
//         label: "Epithelial Cell Abnormality",
//         unit: "",
//         normalRange: "Negative",
//         options: [
//           "Negative",
//           "ASC-US",
//           "ASC-H",
//           "LSIL",
//           "HSIL",
//           "Squamous Cell Carcinoma",
//         ],
//       },
//       {
//         name: "organisms",
//         label: "Organisms",
//         unit: "",
//         normalRange: "None",
//       },
//       {
//         name: "other_findings",
//         label: "Other Non-neoplastic Findings",
//         unit: "",
//         normalRange: "None",
//       },
//       {
//         name: "recommendation",
//         label: "Recommendation",
//         unit: "",
//         normalRange: "Routine screening",
//       },
//     ],
//     Immunohistochemistry: [
//       {
//         name: "specimen_type",
//         label: "Specimen Type",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "markers_tested",
//         label: "Markers Tested",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "staining_pattern",
//         label: "Staining Pattern",
//         unit: "",
//         normalRange: "N/A",
//       },
//       {
//         name: "intensity",
//         label: "Staining Intensity",
//         unit: "",
//         normalRange: "N/A",
//         options: ["Negative", "Weak", "Moderate", "Strong"],
//       },
//       {
//         name: "percentage_positive",
//         label: "Percentage of Positive Cells",
//         unit: "%",
//         normalRange: "N/A",
//       },
//       {
//         name: "interpretation",
//         label: "Interpretation",
//         unit: "",
//         normalRange: "N/A",
//       },
//     ],
//   },
//   "fluid-analysis": {
//   "Cerebrospinal Fluid (CSF) Analysis": [
//     {
//       name: "csf_collection_method",
//       label: "Collection Method",
//       unit: "",
//       normalRange: "Lumbar Puncture",
//       options: ["Lumbar Puncture", "Ventricular Shunt Tap", "Cisternal Puncture", "Other"]
//     },
//     {
//       name: "csf_opening_pressure",
//       label: "Opening Pressure",
//       unit: "cm H₂O",
//       normalRange: "10-20"
//     },
//     {
//       name: "csf_appearance",
//       label: "Appearance",
//       unit: "",
//       normalRange: "Clear and Colorless",
//       options: ["Clear and Colorless", "Cloudy/Turbid", "Xanthochromic", "Bloody", "Opalescent"]
//     },
//     {
//       name: "csf_rbc_count",
//       label: "RBC Count",
//       unit: "cells/µL",
//       normalRange: "0-5"
//     },
//     {
//       name: "csf_wbc_total_count",
//       label: "WBC Total Count",
//       unit: "cells/µL",
//       normalRange: "0-5 (Adults), 0-30 (Neonates)"
//     },
//     {
//       name: "csf_wbc_differential_neutrophils_pct",
//       label: "Neutrophils (%)",
//       unit: "%",
//       normalRange: "0-6"
//     },
//     {
//       name: "csf_wbc_differential_lymphocytes_pct",
//       label: "Lymphocytes (%)",
//       unit: "%",
//       normalRange: "60-70"
//     },
//     {
//       name: "csf_wbc_differential_monocytes_pct",
//       label: "Monocytes (%)",
//       unit: "%",
//       normalRange: "30-50"
//     },
//     {
//       name: "csf_wbc_differential_eosinophils_pct",
//       label: "Eosinophils (%)",
//       unit: "%",
//       normalRange: "0"
//     },
//     {
//       name: "csf_wbc_differential_basophils_pct",
//       label: "Basophils (%)",
//       unit: "%",
//       normalRange: "0"
//     },
//     {
//       name: "csf_protein_total",
//       label: "Protein (Total)",
//       unit: "mg/dL",
//       normalRange: "15-45 (Lumbar), 15-25 (Ventricular), 5-15 (Cisternal)"
//     },
//     {
//       name: "csf_glucose",
//       label: "Glucose",
//       unit: "mg/dL",
//       normalRange: "40-70"
//     },
//     {
//       name: "csf_serum_glucose_ratio",
//       label: "CSF/Serum Glucose Ratio",
//       unit: "",
//       normalRange: "0.6-0.7",
//       calculationDetails: {
//         formula: "csf_glucose / serum_glucose",
//         dependencies: ["csf_glucose", "serum_glucose"]
//       }
//     },
//     {
//       name: "csf_chloride",
//       label: "Chloride",
//       unit: "mEq/L",
//       normalRange: "118-132"
//     },
//     {
//       name: "csf_lactate",
//       label: "Lactate",
//       unit: "mmol/L",
//       normalRange: "1.1-2.4"
//     },
//     {
//       name: "csf_gram_stain",
//       label: "Gram Stain",
//       unit: "",
//       normalRange: "No organisms seen",
//       options: ["No organisms seen", "Gram-positive cocci seen", "Gram-negative rods seen", "Yeast seen", "Other"]
//     },
//     {
//       name: "csf_india_ink_stain",
//       label: "India Ink Stain",
//       unit: "",
//       normalRange: "Negative for Cryptococcus",
//       options: ["Negative", "Positive for Cryptococcus"]
//     },
//     {
//       name: "csf_afb_stain",
//       label: "AFB Stain",
//       unit: "",
//       normalRange: "No AFB seen",
//       options: ["No AFB seen", "AFB seen"]
//     },
//     {
//       name: "csf_bacterial_culture",
//       label: "Bacterial Culture",
//       unit: "",
//       normalRange: "No Growth"
//     },
//     {
//       name: "csf_fungal_culture",
//       label: "Fungal Culture",
//       unit: "",
//       normalRange: "No Growth"
//     },
//     {
//       name: "csf_viral_pcr_panel",
//       label: "Viral PCR Panel (e.g., HSV, VZV, Enterovirus)",
//       unit: "",
//       normalRange: "Not Detected for all targets"
//     },
//     {
//       name: "csf_cryptococcal_antigen",
//       label: "Cryptococcal Antigen (CrAg)",
//       unit: "",
//       normalRange: "Negative",
//       options: ["Positive", "Negative"]
//     },
//     {
//       name: "csf_oligoclonal_bands",
//       label: "Oligoclonal Bands (IgG)",
//       unit: "",
//       normalRange: "Negative (or <2 bands not present in serum)",
//       options: ["Positive (CSF specific bands present)", "Negative", "Pattern suggestive of systemic immune response"]
//     },
//     {
//       name: "csf_igg_index",
//       label: "IgG Index",
//       unit: "",
//       normalRange: "0.28-0.66",
//       calculationDetails: {
//         formula: "(csf_igg / serum_igg) / (csf_albumin / serum_albumin)",
//         dependencies: ["csf_igg", "serum_igg", "csf_albumin", "serum_albumin"]
//       }
//     },
//     {
//       name: "csf_vdrl_rpr",
//       label: "CSF VDRL/RPR",
//       unit: "",
//       normalRange: "Non-reactive",
//       options: ["Reactive", "Non-reactive"]
//     },
//     {
//       name: "csf_cytology",
//       label: "Cytology",
//       unit: "",
//       normalRange: "No malignant cells seen",
//       options: ["No malignant cells seen", "Malignant cells present", "Atypical cells present"]
//     }
//   ],

//   "Ascitic Fluid Analysis": [
//     {
//       name: "ascitic_fluid_source",
//       label: "Source",
//       unit: "",
//       normalRange: "Peritoneal Cavity (Paracentesis)"
//     },
//     {
//       name: "ascitic_fluid_appearance",
//       label: "Appearance",
//       unit: "",
//       normalRange: "Clear, Straw-colored",
//       options: ["Clear, Straw-colored", "Cloudy/Turbid", "Bloody", "Chylous (Milky)", "Bile-stained (Greenish)"]
//     },
//     {
//       name: "ascitic_fluid_rbc_count",
//       label: "RBC Count",
//       unit: "cells/µL",
//       normalRange: "<1000"
//     },
//     {
//       name: "ascitic_fluid_wbc_total_count",
//       label: "WBC Total Count",
//       unit: "cells/µL",
//       normalRange: "<500"
//     },
//     {
//       name: "ascitic_fluid_pmn_poly_count",
//       label: "Polymorphonuclear (PMN) Count",
//       unit: "cells/µL",
//       normalRange: "<250"
//     },
//     {
//       name: "ascitic_fluid_pmn_poly_pct",
//       label: "Polymorphonuclear (PMN) Percentage",
//       unit: "%",
//       normalRange: "<25%",
//       calculationDetails: {
//         formula: "(ascitic_fluid_pmn_poly_count / ascitic_fluid_wbc_total_count) * 100",
//         dependencies: ["ascitic_fluid_pmn_poly_count", "ascitic_fluid_wbc_total_count"]
//       }
//     },
//     {
//       name: "ascitic_fluid_total_protein",
//       label: "Total Protein",
//       unit: "g/dL",
//       normalRange: "Variable (used in SAAG and to classify transudate/exudate)"
//     },
//     {
//       name: "ascitic_fluid_albumin",
//       label: "Albumin",
//       unit: "g/dL",
//       normalRange: "Variable (used for SAAG calculation)"
//     },
//     {
//       name: "saag_serum_ascites_albumin_gradient",
//       label: "Serum-Ascites Albumin Gradient (SAAG)",
//       unit: "",
//       normalRange: "≥1.1 g/dL (suggests portal hypertension)",
//       calculationDetails: {
//         formula: "serum_albumin - ascitic_fluid_albumin",
//         dependencies: ["serum_albumin", "ascitic_fluid_albumin"]
//       }
//     },
//     {
//       name: "ascitic_fluid_glucose",
//       label: "Glucose",
//       unit: "mg/dL",
//       normalRange: "Similar to serum glucose (typically >50 mg/dL)"
//     },
//     {
//       name: "ascitic_fluid_ldh",
//       label: "Lactate Dehydrogenase (LDH)",
//       unit: "U/L",
//       normalRange: "Variable (often compared to serum LDH and upper limit of normal for serum LDH)"
//     },
//     {
//       name: "ascitic_fluid_ldh_ratio",
//       label: "Ascitic Fluid/Serum LDH Ratio",
//       unit: "",
//       normalRange: "<0.6 (suggests transudate if other criteria met)",
//       calculationDetails: {
//         formula: "ascitic_fluid_ldh / serum_ldh",
//         dependencies: ["ascitic_fluid_ldh", "serum_ldh"]
//       }
//     },
//     {
//       name: "ascitic_fluid_amylase",
//       label: "Amylase",
//       unit: "U/L",
//       normalRange: "Variable (usually < serum amylase, significantly elevated in pancreatitis-related ascites)"
//     },
//     {
//       name: "ascitic_fluid_lipase",
//       label: "Lipase",
//       unit: "U/L",
//       normalRange: "Variable (elevated in pancreatitis-related ascites)"
//     },
//     {
//       name: "ascitic_fluid_bilirubin",
//       label: "Bilirubin (Total)",
//       unit: "mg/dL",
//       normalRange: "Variable (elevated in biliary perforation)"
//     },
//     {
//       name: "ascitic_fluid_triglycerides",
//       label: "Triglycerides",
//       unit: "mg/dL",
//       normalRange: "Variable (>200 mg/dL suggests chylous ascites)"
//     },
//     {
//       name: "ascitic_fluid_gram_stain",
//       label: "Gram Stain",
//       unit: "",
//       normalRange: "No organisms seen"
//     },
//     {
//       name: "ascitic_fluid_bacterial_culture_aerobic",
//       label: "Bacterial Culture (Aerobic)",
//       unit: "",
//       normalRange: "No Growth"
//     },
//     {
//       name: "ascitic_fluid_bacterial_culture_anaerobic",
//       label: "Bacterial Culture (Anaerobic)",
//       unit: "",
//       normalRange: "No Growth"
//     },
//     {
//       name: "ascitic_fluid_afb_stain_culture",
//       label: "AFB Stain and Culture",
//       unit: "",
//       normalRange: "No AFB seen; No Growth"
//     },
//     {
//       name: "ascitic_fluid_fungal_stain_culture",
//       label: "Fungal Stain and Culture",
//       unit: "",
//       normalRange: "No fungal elements seen; No Growth"
//     },
//     {
//       name: "ascitic_fluid_cytology",
//       label: "Cytology",
//       unit: "",
//       normalRange: "No malignant cells seen"
//     }
//   ],

//   "Adenosine Deaminase (ADA) - Fluid": [
//     {
//       name: "ada_fluid_type",
//       label: "Fluid Type",
//       unit: "",
//       normalRange: "N/A",
//       options: ["Pleural Fluid", "Cerebrospinal Fluid (CSF)", "Ascitic Fluid", "Pericardial Fluid", "Synovial Fluid", "Other"]
//     },
//     {
//       name: "ada_fluid_level",
//       label: "Adenosine Deaminase (ADA) Level",
//       unit: "U/L",
//       normalRange: "Varies by fluid type and clinical indication (e.g., Pleural Fluid: <40 U/L)"
//     }
//   ]
// },

// };

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
