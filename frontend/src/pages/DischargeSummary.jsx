import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { fetchItems } from "../redux/slices/pharmacySlice";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import {
  X,
  CalendarIcon,
  ChevronRight,
  PlusCircle,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import TemplateLabReport from "./TemplateLabReport";
import {
  fetchVisitDetails,
  fetchRegistrationDetails,
} from "../redux/slices/patientSlice.js";
import { useLocation } from "react-router-dom";
import MultiSelectInput from "../components/custom/MultiSelectInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { fetchTemplates } from "../redux/slices/templatesSlice";
import { labCategories, labReportFields } from "../assets/Data";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import CreateLabReport from "./CreateLabReport";
import { useReactToPrint } from "react-to-print";
import DischargeSummaryPDF from "../components/custom/reports/DischargeSummaryPDF";
import {
  dischargePatient,
  saveDischargeData,
} from "../redux/slices/dischargeSlice";
import { useToast } from "../hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "../hooks/use-toast";
import { updateTemplate } from "../redux/slices/templatesSlice";
import {
  getFormConfig,
  mergeFormConfig,
  DEFAULT_FORM_CONFIG,
} from "../config/dischargeSummaryConfig";
import FormCustomizer from "../components/custom/FormCustomizer";
import { searchBabyByNumber } from "../redux/slices/babySlice";

// Time conversion helper functions
const convertTo12Hour = (time24) => {
  if (!time24) return "";
  const [hours24, minutes] = time24.split(":");
  let hours12 = parseInt(hours24);
  const meridiem = hours12 >= 12 ? "PM" : "AM";

  if (hours12 === 0) hours12 = 12;
  else if (hours12 > 12) hours12 -= 12;

  return `${hours12.toString().padStart(2, "0")}:${minutes} ${meridiem}`;
};

const convertTo24Hour = (time12, meridiem) => {
  console.log(time12, meridiem);
  if (!time12) return "";
  let [hours, minutes] = time12.split(":");
  hours = parseInt(hours);

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const LabReportTable = ({ report }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Test</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Normal Range</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(report).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>{value.label}</TableCell>
            <TableCell>{value.value}</TableCell>
            <TableCell>{value.unit}</TableCell>
            <TableCell>{value.normalRange}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const FormField = ({
  field,
  value,
  label,
  onChange,
  suggestions,
  extraProps = {},
}) => {
  const handleDiagnosisChange = (newDiagnoses) => {
    const diagnosisString = newDiagnoses.map((d) => d.name).join(", ");
    onChange({
      target: {
        name: field.id,
        value: diagnosisString,
      },
    });
  };

  const handleTemplateSelect = (content) => {
    onChange({
      target: {
        name: field.id,
        value: content,
      },
    });
  };

  switch (field.type) {
    case "text":
      return (
        <div
          className={`flex items-center ${
            field.width === "half" ? "sm:col-span-1" : "sm:col-span-2"
          }`}
        >
          <Label htmlFor={field.id} className="w-24 font-bold">
            {label?.toUpperCase() || field.label}:
          </Label>
          <Input
            id={field.id}
            name={field.id}
            value={value}
            onChange={onChange}
            className="h-8"
            {...extraProps}
          />
        </div>
      );
    case "date":
      return (
        <div className="flex items-center">
          <Label htmlFor={field.id} className="w-24 font-bold">
            {field.label}:
          </Label>
          <Input
            id={field.id}
            name={field.id}
            type="date"
            value={value}
            onChange={onChange}
            className="h-8"
            {...extraProps}
          />
        </div>
      );
    case "textarea":
      return (
        <div className="py-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          {field.templates && field.templates.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {field.templates.map((template, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => {
                      if (value === template.content) {
                        // Deselect if already selected
                        handleTemplateSelect("");
                      } else {
                        handleTemplateSelect(template.content);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${
                        value === template.content
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    type="button"
                  >
                    {template.name}
                  </button>

                  {/* Hover Preview - Only show when not selected */}
                  {value !== template.content && (
                    <div className="absolute z-50 invisible group-hover:visible bg-popover text-popover-foreground p-3 rounded-lg shadow-lg min-w-[200px] max-w-[400px] mt-2 left-0 whitespace-pre-wrap text-sm border">
                      <div className="font-semibold mb-1">
                        Template Preview:
                      </div>
                      {template.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Textarea
            id={field.id}
            name={field.id}
            value={value}
            onChange={onChange}
            className="mt-1 min-h-[9rem] leading-tight"
            {...extraProps}
          />
        </div>
      );
    case "time": {
      const timeValue = value ? value.split(" ")[0] : "";
      const meridiem = value ? value.split(" ")[1] || "AM" : "AM";

      // Convert from 12-hour format to 24-hour format for input value
      const time24 = timeValue;

      return (
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="w-24 font-bold">
            {label?.toUpperCase() || field.label}:
          </Label>
          <div className="flex gap-2">
            <Input
              id={field.id}
              name={field.id}
              type="time"
              value={time24}
              onChange={(e) => {
                const newTime24 = e.target.value;
                if (newTime24) {
                  const time12 = convertTo12Hour(newTime24).split(" ");
                  onChange({
                    target: {
                      name: field.id,
                      value: `${time12[0]} ${time12[1] || meridiem}`,
                    },
                  });
                }
              }}
              className="h-8 w-32"
              {...extraProps}
            />
            <Select
              value={meridiem}
              onValueChange={(newMeridiem) => {
                if (timeValue) {
                  const newTime24 = convertTo24Hour(timeValue, newMeridiem);
                  const time12 = convertTo12Hour(newTime24).split(" ");
                  onChange({
                    target: {
                      name: field.id,
                      value: `${time12[0]} ${newMeridiem}`,
                    },
                  });
                }
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
    case "multiselect":
      // Convert value to array of objects if it's a string
      const selectedValues =
        typeof value === "string"
          ? value
              .split(",")
              .map((v) => ({ name: v.trim() }))
              .filter((v) => v.name)
          : Array.isArray(value)
          ? value.map((v) => (typeof v === "string" ? { name: v } : v))
          : [];

      // Convert suggestions to proper format if needed
      const formattedSuggestions = Array.isArray(suggestions)
        ? suggestions.map((s) => (typeof s === "string" ? { name: s } : s))
        : [];

      return (
        <div>
          <Label htmlFor={field.id}>{field.label}</Label>
          <div className="mt-1 space-y-2">
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((val, index) => (
                <Badge
                  key={index}
                  variant="primary"
                  className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 text-sm rounded"
                >
                  {val.name}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => {
                      const newValues = selectedValues.filter(
                        (_, i) => i !== index
                      );
                      if (field.id === "diagnosis") {
                        handleDiagnosisChange(newValues);
                      } else {
                        onChange({
                          target: {
                            name: field.id,
                            value: newValues.map((v) => v.name).join(", "),
                          },
                        });
                      }
                    }}
                  />
                </Badge>
              ))}
            </div>
            <MultiSelectInput
              suggestions={formattedSuggestions}
              selectedValues={selectedValues}
              setSelectedValues={(newValues) => {
                if (field.id === "diagnosis") {
                  handleDiagnosisChange(newValues);
                } else {
                  onChange({
                    target: {
                      name: field.id,
                      value: newValues.map((v) => v.name).join(", "),
                    },
                  });
                }
              }}
              placeholder={`Select ${field.label.toLowerCase()}`}
              {...extraProps}
            />
            {field.extraComponent === "ComorbidityHandling" && (
              <Select
                onValueChange={(value) => {
                  if (extraProps.onComorbidityHandlingChange) {
                    extraProps.onComorbidityHandlingChange(value);
                  }
                }}
                defaultValue={extraProps.comorbidityHandling || "separate"}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Handle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="separate">Separate</SelectItem>
                  <SelectItem value="clinical_summary">
                    Clinical Summary
                  </SelectItem>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={field.id}
            checked={value}
            onChange={(e) =>
              onChange({ target: { name: field.id, value: e.target.checked } })
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor={field.id}>{field.label}</Label>
        </div>
      );
    case "babyTable":
      if (!extraProps.showBabyDetails) return null;
      return (
        <div>
          <Label htmlFor={field.id}>{field.label}</Label>
          <BabyTable
            value={value || []}
            onChange={(newValue) =>
              onChange({ target: { name: field.id, value: newValue } })
            }
          />
        </div>
      );
    default:
      return null;
  }
};

// Add new component for baby table
const BabyTable = ({ value = [], onChange }) => {
  const dispatch = useDispatch();
  const { searchResults, searchStatus } = useSelector((state) => state.babies);

  const addBaby = () => {
    onChange([
      ...value,
      { number: "", sex: "", weight: "", date: "", time: "", apgar: "" },
    ]);
  };

  const removeBaby = (index) => {
    const newBabies = value.filter((_, i) => i !== index);
    // Renumber remaining babies
    const renumberedBabies = newBabies.map((baby, i) => ({
      ...baby,
      number: i + 1,
    }));
    onChange(renumberedBabies);
  };

  const updateBaby = (index, field, newValue) => {
    const newBabies = value.map((baby, i) => {
      if (i === index) {
        return { ...baby, [field]: newValue };
      }
      return baby;
    });
    onChange(newBabies);
  };

  // Function to format time input
  const handleTimeChange = (index, value) => {
    let [hours, minutes] = value.split(":");
    hours = parseInt(hours);

    if (hours === 0) hours = 12;
    if (hours > 12) hours = hours - 12;

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;

    updateBaby(index, "time", formattedTime);
  };

  // Add this effect to handle search results
  useEffect(() => {
    if (searchStatus === "succeeded" && searchResults.length > 0) {
      const latestResult = searchResults[0];
      const updatedBabies = value.map((baby) => {
        if (baby.number === latestResult.birthCounter) {
          return {
            ...baby,
            sex: latestResult.gender.toLowerCase(),
            weight: latestResult.weight,
            date: latestResult.dateOfBirth.split("T")[0],
            time: latestResult.timeOfBirth,
            apgar: Object.values(latestResult.apgarScore).join(","),
          };
        }
        return baby;
      });
      onChange(updatedBabies);
    }
  }, [searchResults, searchStatus]);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Baby No.</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Weight (g)</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>APGAR Score</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {value.map((baby, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="relative">
                  <Input
                    type="text"
                    value={baby.number}
                    onChange={(e) =>
                      updateBaby(index, "number", e.target.value)
                    }
                    className="flex-1 pr-10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-transparent "
                      onClick={(event) => {
                        event.stopPropagation();
                        baby.number &&
                          dispatch(searchBabyByNumber(baby.number));
                      }}
                    >
                      <Search className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={baby.sex}
                  onValueChange={(newValue) =>
                    updateBaby(index, "sex", newValue)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={baby.weight}
                  onChange={(e) => updateBaby(index, "weight", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={baby.date}
                  onChange={(e) => updateBaby(index, "date", e.target.value)}
                />
              </TableCell>
              <TableCell className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={baby.time?.split(" ")[0] || ""}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="w-24"
                />
                <Select
                  value={baby.time?.split(" ")[1] || "AM"}
                  onValueChange={(value) => {
                    const time = baby.time?.split(" ")[0] || "";
                    updateBaby(index, "time", `${time} ${value}`);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={baby.apgar}
                  onChange={(e) => updateBaby(index, "apgar", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeBaby(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button type="button" variant="outline" onClick={addBaby}>
        <PlusCircle className="h-4 w-4 mr-2" /> Add Baby
      </Button>
    </div>
  );
};

export default function DischargeSummary() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const ignoreList = location.state?.ignoreList || false;
  const dischargeData = location.state?.dischargeData || null;
  const dischargeSummaryTemplates = useSelector(
    (state) => state.templates.dischargeSummaryTemplateArray
  );
  const [selectedTemplateDischargeSummary, setSelectedTemplateDischargeSummary] = useState(
    dischargeSummaryTemplates[0] || { name: "", value: "" }
  );
  const savedConfig = useSelector(
    (state) => state.templates.dischargeFormTemplates
  );
  const [formConfig, setFormConfig] = useState(() => {
    const baseConfig = getFormConfig();
    if (savedConfig) {
      return savedConfig;
    }
    return baseConfig;
  });

  const {
    diagnosisTemplate = [],
    comorbidities = [],
    medicinelist = [],
  } = useSelector((state) => state.templates);
  // Get initial patient from Redux store
  const patientFromStore = useSelector((state) =>
    state.patients.patientlist.find((p) => p._id === patientId)
  );
  const labTestsTemplate = useSelector(
    (state) => state.templates.labTestsTemplate
  );

  const allLabTests = [
    ...labCategories.flatMap((category) =>
      category.types.map((type) => ({ name: type }))
    ),
    ...(labTestsTemplate?.map((template) => ({
      name: template.name,
      isTemplate: true,
    })) || []),
  ];

  const initialFormData = {
    admissionDate: "",
    dateDischarged: "",
    diagnosis: "",
    clinicalSummary: "",
    treatment: "",
    conditionOnAdmission: "",
    conditionOnDischarge: "",
    vitals: {
      admission: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
      discharge: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
    },
    investigations: [{ name: "", category: "" }],
    medicineAdvice: [{ name: "", dosage: "", duration: "" }],
    notes: "",
    comorbidities: [{ name: "" }],
    hasBabyDetails: false,
    babies: [],
  };

  // Initialize form data state with initial values
  const [formData, setFormData] = useState(initialFormData);

  // Helper function to get all field IDs from form config
  const getAllFieldIds = (config) => {
    const fieldIds = new Set();
    config.sections.forEach((section) => {
      section.fields.forEach((field) => {
        fieldIds.add(field.id);
      });
    });
    return fieldIds;
  };

  // Helper function to merge data with form fields
  const mergeDataWithFormFields = (data, config) => {
    const fieldIds = getAllFieldIds(config);
    const mergedData = { ...initialFormData };

    // First, handle standard fields
    const standardFields = [
      "admissionDate",
      "dateDischarged",
      "diagnosis",
      "clinicalSummary",
      "treatment",
      "conditionOnAdmission",
      "conditionOnDischarge",
      "notes",
      "comorbidities",
    ];

    standardFields.forEach((field) => {
      if (data?.[field] !== undefined) {
        mergedData[field] = data[field];
      }
    });

    // Handle special array fields
    if (data?.medicineAdvice?.length > 0) {
      mergedData.medicineAdvice = data.medicineAdvice.map((m) => ({
        name: m.name || "",
        dosage: m.dosage || "",
        duration: m.duration || "",
      }));
    }

    if (data?.investigations?.length > 0) {
      mergedData.investigations = data.investigations.map((i) => ({
        name: i.name || "",
        category: i.category || "",
        report: i.report || null,
        date: i.date || null,
      }));
    }

    if (data?.comorbidities?.length > 0) {
      mergedData.comorbidities = data.comorbidities.map((c) =>
        typeof c === "string" ? { name: c } : c
      );
    }

    // Handle vitals
    if (data?.vitals) {
      mergedData.vitals = {
        admission: {
          ...initialFormData.vitals.admission,
          ...(data.vitals.admission || {}),
        },
        discharge: {
          ...initialFormData.vitals.discharge,
          ...(data.vitals.discharge || {}),
        },
      };
    }

    // Handle custom fields from form config
    fieldIds.forEach((fieldId) => {
      if (data?.[fieldId] !== undefined && !standardFields.includes(fieldId)) {
        mergedData[fieldId] = data?.[fieldId];
      }
    });

    return mergedData;
  };

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientFromStore && !dischargeData) {
        try {
          if (patientId) {
            const result = await dispatch(
              fetchVisitDetails({ id: patientId, type: "IPD" })
            ).unwrap();
            setPatient(result);

            if (result.dischargeData && result.formConfig) {
              const mergedData = mergeDataWithFormFields(
                result.dischargeData,
                result.formConfig
              );
              setFormData(mergedData);
              setFormConfig(result.formConfig);
            }
          }
        } catch (error) {
          console.error("Error fetching patient details:", error);
        }
      } else if (dischargeData) {
        setPatient(dischargeData);

        if (dischargeData.formConfig || formConfig) {
          const mergedData = mergeDataWithFormFields(
            dischargeData.dischargeData,
            dischargeData.formConfig || formConfig
          );

          setFormData(mergedData);
        }

        setPatientInfo({
          name: dischargeData.patientName || dischargeData.patient?.name || "",
          age: dischargeData.patient?.age || "",
          gender: dischargeData.patient?.gender || "",
          contactNumber:
            dischargeData.contactNumber ||
            dischargeData.patient?.contactNumber ||
            "",
          address: dischargeData.patient?.address || "",
          roomNumber: dischargeData.assignedRoom?.roomNumber || "",
          registrationNumber: dischargeData.registrationNumber || "",
          ipdNumber: dischargeData.ipdNumber || "",
          relation: dischargeData.relation
            ? dischargeData.relation?.toLowerCase()
            : "",
          ...(dischargeData.relation
            ? {
                [dischargeData.relation?.toLowerCase()]:
                  dischargeData.guardianName || "",
              }
            : {}),
        });
      } else if (!ignoreList) {
        setPatient(patientFromStore);
      }
    };

    fetchPatient();
  }, [
    dispatch,
    patientId,
    patientFromStore,
    location.state?.patient,
    dischargeData,
    ignoreList,
    formConfig,
  ]);

  const medicines = useSelector((state) => state.pharmacy.items);
  const itemsStatus = useSelector((state) => state.pharmacy.itemsStatus);
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const templateStatus = useSelector((state) => state.templates.status);
  useEffect(() => {
    if (itemsStatus === "idle") {
      dispatch(fetchItems());
    }
  }, [dispatch, itemsStatus]);
  useEffect(() => {
    if (templateStatus === "idle") {
      dispatch(fetchTemplates());
    }
  }, [dispatch, templateStatus]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLabReportOpen, setIsLabReportOpen] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    contactNumber: "",
    address: "",
    roomNumber: "",
    registrationNumber: "",
    ipdNumber: "",
  });
  useEffect(() => {
    if (patient) {
      setFormData((prevData) => ({
        ...prevData,
        admissionDate: patient.bookingDate
          ? new Date(patient.bookingDate).toISOString().split("T")[0]
          : "",
        dateDischarged: patient.dateDischarged || "",
        diagnosis: Array.isArray(patient.diagnosis)
          ? patient.diagnosis.join(", ")
          : patient.diagnosis || "",
        clinicalSummary: patient.clinicalSummary || "",
        treatment: patient.treatment || "",
        conditionOnAdmission: patient.conditionOnAdmission || "",
        conditionOnDischarge: patient.conditionOnDischarge || "",
        vitals: {
          admission: {
            bloodPressure: patient.vitals?.admission?.bloodPressure || "",
            heartRate: patient.vitals?.admission?.heartRate || "",
            temperature: patient.vitals?.admission?.temperature || "",
            oxygenSaturation: patient.vitals?.admission?.oxygenSaturation || "",
            respiratoryRate: patient.vitals?.admission?.respiratoryRate || "",
          },
          discharge: {
            bloodPressure: patient.vitals?.discharge?.bloodPressure || "",
            heartRate: patient.vitals?.discharge?.heartRate || "",
            temperature: patient.vitals?.discharge?.temperature || "",
            oxygenSaturation: patient.vitals?.discharge?.oxygenSaturation || "",
            respiratoryRate: patient.vitals?.discharge?.respiratoryRate || "",
          },
        },
        investigations:
          patient.labReports?.length > 0
            ? patient.labReports
            : [{ name: "", category: "" }],
        medicineAdvice: patient.medicineAdvice || [
          { name: "", dosage: "", duration: "" },
        ],
        notes: patient.notes || "",
        comorbidities: patient.comorbidities?.map((comorbidity) => ({
          name: comorbidity,
        })) || [{ name: "" }],
      }));

      setPatientInfo({
        name: patient.patient?.name || patient.name || "",
        age: patient.patient?.age || patient.age || "",
        gender: patient.patient?.gender || patient.gender || "",
        relation: patient.relation ? patient.relation?.toLowerCase() : "",
        ...(patient.relation
          ? { [patient.relation?.toLowerCase()]: patient.guardianName || "" }
          : {}),
        contactNumber:
          patient.patient?.contactNumber || patient.contactNumber || "",
        address: patient.patient?.address || patient.address || "",
        roomNumber:
          patient.assignedRoom?.roomNumber || patient.roomNumber || "",
        registrationNumber:
          patient.registrationNumber || patient.registrationNumber || "",
        ipdNumber: patient.ipdNumber || "",
      });
    }
  }, [patient]);

  const [selectedReport, setSelectedReport] = useState(null);

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleInvestigationChange = (index, suggestion) => {
    const updatedInvestigations = [...formData.investigations];
    updatedInvestigations[index] = {
      name: suggestion.name,
      category: suggestion.category || "",
    };
    setFormData((prev) => ({ ...prev, investigations: updatedInvestigations }));
  };

  const handleAddInvestigation = () => {
    setFormData((prev) => ({
      ...prev,
      investigations: [...prev.investigations, { name: "", category: "" }],
    }));
  };

  const handleRemoveInvestigation = (index) => {
    setFormData((prev) => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== index),
    }));
  };

  const handleComorbiditiesChange = (newComorbidities) => {
    setFormData((prev) => ({ ...prev, comorbidities: newComorbidities }));
  };

  const handleRemoveSelected = (name) => {
    setFormData((prev) => ({
      ...prev,
      comorbidities: prev.comorbidities.filter((val) => val.name !== name),
    }));
  };

  const handleComorbidityHandlingChange = (value) => {
    setFormData((prev) => ({ ...prev, comorbidityHandling: value }));
  };

  const { toast } = useToast();
  const { status: dischargeStatus, savingStatus } = useSelector(
    (state) => state.discharge
  );

  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  // Add this selector to get the current user's permissions
  const userPermissions = useSelector(
    (state) => state.user?.userData?.permissions || []
  );
  const hasDischargePermission = userPermissions.includes("can_discharge");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add permission check
    if (!hasDischargePermission) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to discharge patients.",
        variant: "destructive",
      });
      return;
    }

    const dischargePayload = {
      patientId: patientId || patient._id,
      ...formData,
      formConfig,
      comorbidities: formData.comorbidities.map((c) => c.name),
      medicineAdvice: formData.medicineAdvice
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          dosage: m.dosage,
        })),
      investigations: formData.investigations
        .filter((inv) => inv.name.trim() !== "")
        .map((i) => ({
          name: i.name,
          category: i.category,
          report: i.report,
          date: i.date || new Date().toISOString(),
        })),
    };

    try {
      await dispatch(dischargePatient(dischargePayload)).unwrap();
      toast({
        title: "Success",
        description: "Patient discharged successfully",
        variant: "success",
      });

      setIsPrintDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to discharge patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const savePayload = {
      patientId: patientId || patient._id,
      ...formData,
      formConfig,
      comorbidities: formData.comorbidities.map((c) => c.name),
      medicineAdvice: formData.medicineAdvice
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          dosage: m.dosage,
        })),
      investigations: formData.investigations
        .filter((inv) => inv.name.trim() !== "")
        .map((i) => ({
          name: i.name,
          category: i.category,
          report: i.report,
          date: i.date || new Date().toISOString(),
        })),
    };

    try {
      await dispatch(saveDischargeData(savePayload)).unwrap();
      toast({
        title: "Success",
        description: "Discharge data saved successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save discharge data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      selectedTest: suggestion.name,
      selectedCategory: suggestion.category,
    }));
  };

  const handleOpenLabReport = (investigation) => {
    // Check if this investigation matches any template
    const matchingTemplate = labTestsTemplate?.find(
      (template) =>
        template.name.toLowerCase() === investigation.name.toLowerCase()
    );

    if (matchingTemplate) {
      setSelectedTemplate(matchingTemplate);
    } else {
      setSelectedTemplate(null);
    }
    setSelectedInvestigation(investigation);

    setIsLabReportOpen(true);
  };

  const handleCloseLabReport = () => {
    setSelectedInvestigation(null);
    setSelectedTemplate(null);
    setIsLabReportOpen(false);
  };

  const handleSaveLabReport = (reportData) => {
    const updatedInvestigations = formData.investigations.map((inv) =>
      inv.name.toLowerCase() === selectedInvestigation.name.toLowerCase()
        ? {
            ...inv,
            name: reportData.name,
            report: reportData.report,
            date: reportData.date,
          }
        : inv
    );

    // If the investigation doesn't exist, add it to the list
    if (
      !updatedInvestigations.some(
        (inv) => inv.name.toLowerCase() === reportData.name.toLowerCase()
      )
    ) {
      updatedInvestigations.push({
        name: reportData.name,
        report: reportData.report,
        date: reportData.date,
      });
    }

    setFormData((prev) => ({
      ...prev,
      investigations: updatedInvestigations,
    }));

    // Update selectedInvestigation to show the new data immediately
    setSelectedInvestigation({
      name: reportData.name,
      report: reportData.report,
      date: reportData.date,
    });

    // Show success toast
    toast({
      title: "Success",
      description: "Lab report saved successfully",
      variant: "success",
    });

    handleCloseLabReport();
  };

  const handleMedicineAdviceChange = (index, field, value, id) => {
    setFormData((prev) => ({
      ...prev,
      [id]: prev[id].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleMedicineAdviceSuggestionSelect = (index, suggestion, id) => {
    handleMedicineAdviceChange(index, "name", suggestion.name, id);
  };

  const addMedicineAdvice = (id) => {
    setFormData((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), { name: "", dosage: "", duration: "" }],
    }));
  };

  const removeMedicineAdvice = (index, id) => {
    setFormData((prev) => ({
      ...prev,
      [id]: prev[id]?.filter((_, i) => i !== index),
    }));
  };

  const handleVitalsChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [type]: {
          ...prev.vitals[type],
          [field]: value,
        },
      },
    }));
  };

  const getCategoryAndTypeForTest = (testName) => {
    for (const category of labCategories) {
      if (category.types.includes(testName)) {
        const type = testName;
        return { category: category.name.toLowerCase(), type };
      }
    }
    return {
      category: "other",
      type: testName.toLowerCase().replace(/\s+/g, "-"),
    };
  };

  const renderVitalsInputs = (type) => (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center">
        <span className="w-24">BP:</span>
        <Input
          placeholder="mmHg"
          value={formData.vitals[type].bloodPressure}
          onChange={(e) =>
            handleVitalsChange(type, "bloodPressure", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">HR:</span>
        <Input
          placeholder="bpm"
          type="number"
          value={formData.vitals[type].heartRate}
          onChange={(e) =>
            handleVitalsChange(type, "heartRate", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">Temp:</span>
        <Input
          placeholder="°C"
          type="number"
          value={formData.vitals[type].temperature}
          onChange={(e) =>
            handleVitalsChange(type, "temperature", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">SpO2:</span>
        <Input
          placeholder="%"
          type="number"
          value={formData.vitals[type].oxygenSaturation}
          onChange={(e) =>
            handleVitalsChange(type, "oxygenSaturation", e.target.value)
          }
          className="h-8"
        />
      </div>
      <div className="flex items-center">
        <span className="w-24">RR:</span>
        <Input
          placeholder="breaths/min"
          type="number"
          value={formData.vitals[type].respiratoryRate}
          onChange={(e) =>
            handleVitalsChange(type, "respiratoryRate", e.target.value)
          }
          className="h-8"
        />
      </div>
    </div>
  );

  // Get the diagnosis template from the Redux store
  // Add a new state for custom diagnosis input
  const [customDiagnosis, setCustomDiagnosis] = useState("");

  // Add this state to track custom diagnoses
  const [customDiagnosesList, setCustomDiagnosesList] = useState([]);

  // Modify the handleAddDiagnosis function
  const handleAddDiagnosis = (diagnosis) => {
    if (!diagnosis.trim()) return;

    const currentDiagnoses = formData.diagnosis
      ? formData.diagnosis.split(", ")
      : [];

    // Add to custom diagnoses list if it's not in the template
    if (
      !diagnosisTemplate.includes(diagnosis) &&
      !customDiagnosesList.includes(diagnosis)
    ) {
      setCustomDiagnosesList((prev) => [...prev, diagnosis]);
    }

    if (currentDiagnoses.includes(diagnosis)) {
      setFormData((prev) => ({
        ...prev,
        diagnosis: prev.diagnosis
          .split(", ")
          .filter((d) => d !== diagnosis)
          .join(", "),
      }));
    } else {
      // Add the diagnosis if it's not selected
      setFormData((prev) => ({
        ...prev,
        diagnosis: prev.diagnosis
          ? `${prev.diagnosis}, ${diagnosis}`
          : diagnosis,
      }));
    }
    setCustomDiagnosis("");
  };

  // Add this new function to check for matches
  const getMatchingDiagnoses = (input) => {
    if (!input) return [];
    return diagnosisTemplate.filter((diagnosis) =>
      diagnosis.toLowerCase().startsWith(input.toLowerCase())
    );
  };

  const handleDiagnosisChange = (newDiagnoses) => {
    const diagnosisString = newDiagnoses.map((d) => d.name).join(", ");
    setFormData((prev) => ({ ...prev, diagnosis: diagnosisString }));
  };

  const handleRemoveDiagnosis = (name) => {
    const currentDiagnoses = formData.diagnosis.split(", ");
    const updatedDiagnoses = currentDiagnoses
      .filter((d) => d !== name)
      .join(", ");
    setFormData((prev) => ({ ...prev, diagnosis: updatedDiagnoses }));
  };

  // if (!patient)
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       Loading...
  //     </div>
  //   );

  const renderTextArea = (name, label) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className="mt-1 min-h-[6rem] leading-tight"
      />
    </div>
  );

  // Add this function to handle registration search
  const handleRegistrationSearch = async () => {
    if (!patientInfo.registrationNumber) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(
        fetchRegistrationDetails({
          registrationNumber: patientInfo.registrationNumber,
          type: "IPD",
        })
      ).unwrap();

      if (result) {
        setPatient(result);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    }
  };

  // Add this function near your other handler functions
  const handleBack = () => {
    navigate(-1); // This will go back to the previous page
  };

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @media print {
        @page {
          size: A4;
           margin:20mm;
          
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .print-only {
          display: block !important;
        }
        .no-print {
          display: none !important;
        }
        .print-content {
          position: relative;
          min-height: 100vh;
         padding:20px;
        }
      }
    `,
  });

  // Add this function to handle print confirmation
  const handlePrintConfirm = (shouldPrint) => {
    setIsPrintDialogOpen(false);
    if (shouldPrint) {
      handlePrint();
    }
    navigate("/patients/admitted");
  };

  // Get user role from Redux store or props

  // Initialize form configuration based on user role and any saved custom config

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customConfig, setCustomConfig] = useState(null);

  const handleCustomizeForm = () => {
    setShowCustomizer(true);
  };

  const handleSaveCustomConfig = async (newConfig) => {
    try {
      await dispatch(
        updateTemplate({ dischargeFormTemplates: newConfig })
      ).unwrap();

      setFormConfig(newConfig);
      setShowCustomizer(false);
      toast({
        title: "Success",
        description: "Form template saved successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form template",
        variant: "destructive",
      });
    }
  };

  const handleCancelCustomize = () => {
    setShowCustomizer(false);
  };

  // Render form sections based on configuration
  const renderFormSection = (section) => {
    return (
      <div key={section.id} className={section.className}>
        {section.title && (
          <h2 className="text-lg font-semibold mb-2 text-primary">
            {section.title}
          </h2>
        )}
        <div className="gap-2 text-sm">
          {section.fields.map((field) => {
            // Handle special components separately
            if (field.type === "vitals") {
              return (
                <div key={field.id} className=" py-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {renderVitalsInputs(field.prefix)}
                </div>
              );
            }

            if (field.type === "investigations") {
              return (
                <div key={field.id} className=" py-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <div className="space-y-2 mt-2">
                    {formData.investigations.map((investigation, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2"
                      >
                        <div className="sm:col-span-3">
                          <SearchSuggestion
                            suggestions={allLabTests}
                            placeholder="Select investigation"
                            value={investigation.name}
                            setValue={(value) =>
                              handleInvestigationChange(index, { name: value })
                            }
                            onSuggestionSelect={(suggestion) =>
                              handleInvestigationChange(index, suggestion)
                            }
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenLabReport(investigation)}
                            aria-label="Open Lab Report"
                            disabled={!investigation.name}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveInvestigation(index)}
                            disabled={formData.investigations.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={handleAddInvestigation}
                      variant="outline"
                      className="mt-2 font-semibold"
                      type="button"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Investigation
                    </Button>
                  </div>
                </div>
              );
            }

            if (field.type === "medicineAdvice") {
              return (
                <div key={field.id} className=" py-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <div className="space-y-2 mt-2">
                    {formData[field.id]?.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2"
                      >
                        <div
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                        >
                          <SearchSuggestion
                            suggestions={medicinelist?.map((item) => ({
                              name: item,
                            }))}
                            placeholder="Select medicine/advice"
                            value={item.name}
                            setValue={(value) =>
                              handleMedicineAdviceChange(
                                index,
                                "name",
                                value,
                                field.id
                              )
                            }
                            onSuggestionSelect={(suggestion) =>
                              handleMedicineAdviceSuggestionSelect(
                                index,
                                suggestion,
                                field.id
                              )
                            }
                          />
                        </div>
                        <Input
                          type="text"
                          placeholder="Dosage"
                          value={item.dosage}
                          onChange={(e) =>
                            handleMedicineAdviceChange(
                              index,
                              "dosage",
                              e.target.value,
                              field.id
                            )
                          }
                          className="font-medium"
                          onKeyDown={(e) => {
                            // Prevent form submission on Enter key
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                        />
                        <Input
                          type="text"
                          placeholder="Duration"
                          value={item.duration}
                          onChange={(e) =>
                            handleMedicineAdviceChange(
                              index,
                              "duration",
                              e.target.value,
                              field.id
                            )
                          }
                          className="font-medium"
                          onKeyDown={(e) => {
                            // Prevent form submission on Enter key
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeMedicineAdvice(index, field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button" // Add type="button" to prevent form submission
                      onClick={() => addMedicineAdvice(field.id)}
                      variant="outline"
                      className="mt-2 font-semibold"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add
                      Medicine/Advice
                    </Button>
                  </div>
                </div>
              );
            }

            // For standard form fields
            let value;
            let onChange;
            let label;
            // Check if this is a patientInfo field
            if (section.id === "patientInfo") {
              // Special handling for admission and discharge dates
              if (
                field.id === "admissionDate" ||
                field.id === "dateDischarged" ||
                field.id === "timeDischarged" ||
                field.id === "admittedTime"
              ) {
                value = formData[field.id] || "";
                onChange = handleInputChange;
              } else {
                value =
                  patientInfo[field.id] ||
                  patientInfo?.[patientInfo?.relation] ||
                  formData?.[field.id] ||
                  "";
                if (!patientInfo?.[field.id]) {
                  label = patientInfo?.relation;

                }
                onChange = handlePatientInfoChange;

               
              }
            } else {
              value = field.id.includes(".")
                ? field.id.split(".").reduce((obj, key) => obj[key], formData)
                : formData[field.id];

              onChange = (e) => {
                if (field.type === "multiselect") {
                  const newValue = Array.isArray(e)
                    ? e.map((v) => v.name).join(", ")
                    : e.target.value;
                  handleInputChange({
                    target: {
                      name: field.id,
                      value: newValue,
                    },
                  });
                } else {
                  handleInputChange(e);
                }
              };
            }

            // Get suggestions based on the field configuration
            let suggestions = [];
            if (field.suggestions) {
              switch (field.suggestions) {
                case "diagnosisTemplate":
                  suggestions = diagnosisTemplate;
                  break;
                case "comorbidities":
                  suggestions = comorbidities;
                  break;
                case "medicinelist":
                  suggestions = medicinelist;
                  break;
                default:
                  try {
                    suggestions = eval(field.suggestions) || [];
                  } catch (e) {
                    console.error("Error evaluating suggestions:", e);
                  }
              }
            }

            // Add extra props for baby table
            const extraProps = {
              ...field.extraProps,
              onComorbidityHandlingChange: handleComorbidityHandlingChange,
              comorbidityHandling: formData.comorbidityHandling,
              showBabyDetails: field.dependsOn
                ? formData[field.dependsOn]
                : true,
            };

            return (
              <FormField
                key={field.id}
                field={field}
                value={value}
                label={label}
                onChange={onChange}
                suggestions={suggestions}
                extraProps={extraProps}
              />
            );
          })}
        </div>
      </div>
    );
  };
  // Add a new useEffect to handle form config changes
  useEffect(() => {
    if (savedConfig) {
      // Update form fields based on saved configuration
      const patientInfoSection = savedConfig.sections.find(
        (section) => section.id === "patientInfo"
      );
      if (patientInfoSection) {
        const updatedPatientInfo = {};
        patientInfoSection.fields.forEach((field) => {
          updatedPatientInfo[field.id] = patientInfo[field.id] || "";
        });
        setPatientInfo((prevInfo) => ({
          ...prevInfo,
          ...updatedPatientInfo,
        }));
      }
    }
  }, [savedConfig]);

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4 max-w-5xl">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 text-primary-foreground hover:text-primary hover:bg-primary-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">Discharge Summary</CardTitle>
            </div>
            <Button
              variant="ghost"
              onClick={handleCustomizeForm}
              className="text-primary-foreground hover:text-primary hover:bg-primary-foreground"
            >
              Customize Form
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {formConfig.sections.map(renderFormSection)}

            <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="w-full sm:w-auto"
              >
                Print
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                variant="outline"
                disabled={savingStatus === "loading" || !patientId}
                className="w-full sm:w-auto"
              >
                {savingStatus === "loading" ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={
                  dischargeStatus === "loading" ||
                  !patientId ||
                  !hasDischargePermission
                }
                className="w-full sm:w-auto"
              >
                {!hasDischargePermission
                  ? "No Permission to Discharge"
                  : dischargeStatus === "loading"
                  ? "Discharging..."
                  : "Discharge"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Customizer Modal */}
      {showCustomizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <FormCustomizer
            config={DEFAULT_FORM_CONFIG}
            enabledFields={formConfig}
            onSave={handleSaveCustomConfig}
            onCancel={handleCancelCustomize}
          />
        </div>
      )}

      {/* Lab Report Modal */}
      {isLabReportOpen && selectedInvestigation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 p-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Lab Report: {selectedInvestigation.name}
              </h2>
              <Button
                onClick={handleCloseLabReport}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {selectedTemplate ? (
              <TemplateLabReport
                template={selectedTemplate}
                patientData={patient}
                onClose={(reportData) => {
                  if (reportData) {
                    handleSaveLabReport(reportData);
                  } else {
                    handleCloseLabReport();
                  }
                }}
                component="DischargeSummary"
                searchWhere="ipd"
              />
            ) : (
              (() => {
                const { category, type } = getCategoryAndTypeForTest(
                  selectedInvestigation.name
                );
                return (
                  <CreateLabReport
                    category={category}
                    type={type}
                    patientData={patient}
                    formData={formData}
                    onClose={handleCloseLabReport}
                    onSave={handleSaveLabReport}
                    onFindingsDisplay={true}
                    searchWhere="ipd"
                  />
                );
              })()
            )}
          </div>
        </div>
      )}
      <div style={{ display: "none" }} className="print-content">
        <DischargeSummaryPDF
          ref={componentRef}
          formData={{
            ...formData,
            investigations: formData.investigations
              .filter((inv) => inv.name.trim() !== "" && inv.report)
              .map((inv) => ({
                name: inv.name,
                report: inv.report,
                date: inv.date || new Date().toISOString(),
              })),
          }}
          formConfig={formConfig}
          patient={patientInfo}
          hospital={hospital}
          templateString={selectedTemplateDischargeSummary?.value}

        />
      </div>

      {/* Print Confirmation Dialog */}
      {isPrintDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Print Confirmation</h2>
            <p className="mb-6">
              Would you like to print the discharge summary?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handlePrintConfirm(false)}
              >
                No
              </Button>
              <Button onClick={() => handlePrintConfirm(true)}>Yes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
