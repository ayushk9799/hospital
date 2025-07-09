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
import { dischargeSummaryTemplateStringDefault } from "../templates/dischargesummary";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { convertTo12Hour } from "../assets/Data";
import { Label } from "../components/ui/label";
import { fetchItems } from "../redux/slices/pharmacySlice";
import { Badge } from "../components/ui/badge";
import {
  X,
  ChevronRight,
  PlusCircle,
  Trash2,
  Search,
  ArrowLeft,
  Check,
} from "lucide-react";
import TemplateLabReport from "./TemplateLabReport";
import { fetchVisitDetails } from "../redux/slices/patientSlice.js";
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
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
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
import {
  getFormConfig,
} from "../config/dischargeSummaryConfig";
import { searchBabyByNumber } from "../redux/slices/babySlice";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";

const convertTo24Hour = (time12, meridiem) => {
  if (!time12) return "";
  let [hours, minutes] = time12.split(":");
  hours = parseInt(hours);

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
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
          className={`flex py-2 items-center ${
            field.width === "half" ? "sm:col-span-1" : "sm:col-span-2"
          }`}
        >
          <Label htmlFor={field.id} className="w-36 font-bold">
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
        <div className="flex items-center py-2">
          <Label htmlFor={field.id} className="w-36 font-bold">
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
        <div className="py-3">
          <Label htmlFor={field.id} className="text-xl italic">{field.label}</Label>
          {field.templates && field.templates.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
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
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 border border-gray-300 hover:border-gray-500 hover:primary/2 hover:shadow-md hover:text-[15px]
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
                    <div className="absolute z-50 invisible group-hover:visible bg-popover text-popover-foreground p-3 rounded-lg shadow-lg min-w-[200px] w-[400px] mt-2 left-0 whitespace-pre-wrap text-sm border border-gray-300">
                      {/* <div className="font-semibold mb-1">
                        Template Preview:
                      </div> */}
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
            className="mt-1 min-h-[9rem] text-[15px]"
            {...extraProps}
          />
        </div>
      );
    case "time": {
      let x = value.split(" ");
      const timeValue = value ? x[0] : "";
      let meridiem = value ? x[1] || "AM" : "AM";
      if (x.length === 1) {
        meridiem = convertTo12Hour(timeValue).split(" ")[1];
      }
      // Convert from 12-hour format to 24-hour format for input value
      const time24 = timeValue;

      return (
        <div className="flex items-center py-2 gap-2">
          <Label htmlFor={field.id} className="w-36 font-bold">
            {label?.toUpperCase() || field.label}:
          </Label>
          <div className="flex gap-2">
            <Input
              id={field.id}
              name={field.id}
              type="time"
              value={convertTo12Hour(time24).split(" ")[0]}
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
          ? value
              .map((v) => {
                if (typeof v === "string") {
                  return v.trim();
                }
                return v.name;
              })
              .filter((c) => c?.trim() !== "")
              .map((c) => ({ name: c }))
          : [];

      // Convert suggestions to proper format if needed
      const formattedSuggestions = Array.isArray(suggestions)
        ? suggestions.map((s) => (typeof s === "string" ? { name: s } : s))
        : [];

      return (
        <div>
          <Label className="text-xl italic" htmlFor={field.id}>{field.label}</Label>
          <div className="space-y-1">
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
      <ScrollArea className="w-full border rounded-lg">
        <div className="min-w-[800px]">
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
                      onChange={(e) =>
                        updateBaby(index, "weight", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={baby.date}
                      onChange={(e) =>
                        updateBaby(index, "date", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateBaby(index, "apgar", e.target.value)
                      }
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
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
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
  const [hasDischarged, setHasDischarged] = useState(false);
  const dischargeSummaryTemplates = useSelector(
    (state) => state.templates.dischargeSummaryTemplateArray
  );
  const [selectedTemplateDischargeSummary] = useState(
    dischargeSummaryTemplates[0] || {
      name: "Template 1",
      value: dischargeSummaryTemplateStringDefault,
    }
  );

  const [formConfig, setFormConfig] = useState(() => {
    const baseConfig = getFormConfig();

    // Use template from navigation state if available
    if (
      location.state?.selectedTemplate?.value ||
      location.state?.selectedTemplate
    ) {
      return (
        location.state.selectedTemplate.value ||
        location.state.selectedTemplate ||
        baseConfig
      );
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
    ...(labTestsTemplate?.map((template) => ({
      name: template.name,
      isTemplate: true,
    })) || []),
  ];

  const initialFormData = {
    admissionDate: "",
    dateDischarged: "",
    bookingTime: "",
    timeDischarged: "",
    diagnosis: "",
    clinicalSummary: "",
    treatment: "",
    conditionOnAdmission: "",
    conditionOnDischarge: "",
    comorbidityHandling: "separate",

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
    investigations: [{ name: "", category: "", isIncluded: true }],
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
      "bookingTime",
      "timeDischarged",
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
    // fieldIds.forEach((fieldId) => {
    //   if (data?.[fieldId] !== undefined && !standardFields.includes(fieldId)) {
    //     mergedData[fieldId] = data?.[fieldId];
    //   }
    // });

    fieldIds.forEach((fieldId) => {
      // Get value from nested path
      const value = fieldId.includes(".")
        ? fieldId.split(".").reduce((obj, key) => obj?.[key], data)
        : data?.[fieldId];

      if (value !== undefined && !standardFields.includes(fieldId)) {
        // Set value in mergedData, supporting nested paths
        if (fieldId.includes(".")) {
          const keys = fieldId.split(".");
          let temp = mergedData;

          // Traverse or create nested structure
          keys.forEach((key, index) => {
            if (index === keys.length - 1) {
              temp[key] = value;
            } else {
              temp[key] = temp[key] || {};
              temp = temp[key];
            }
          });
        } else {
          mergedData[fieldId] = value;
        }
      }
    });

    return mergedData;
  };
  useEffect(() => {
    const fetchPatient = async () => {
      if (hasDischarged) return;

      if (!patientFromStore && !dischargeData) {
        try {
          if (patientId) {
            const result = await dispatch(
              fetchVisitDetails({ id: patientId, type: "IPD" })
            ).unwrap();
            const { labReport, ...rest } = result;
            setPatient(rest);

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
        const { labReport, ...rest } = dischargeData;
        setPatient(rest);
        if (dischargeData.formConfig || formConfig) {
          const mergedData = mergeDataWithFormFields(
            dischargeData.dischargeData || dischargeData,
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
        const { labReport, ...rest } = patientFromStore;
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
    hasDischarged,
  ]);

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
    if (patient && !hasDischarged) {
      setFormData((prevData) => ({
        ...prevData,
        admissionDate: patient.bookingDate
          ? new Date(patient.bookingDate).toISOString().split("T")[0]
          : "",
        dateDischarged: patient.dateDischarged
          ? new Date(patient.dateDischarged).toISOString().split("T")[0]
          : "",
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
            ? patient.labReports.map((report) => ({
                ...report,
                isIncluded: true,
              }))
            : [{ name: "", category: "", isIncluded: true }],
        medicineAdvice: patient.medicineAdvice ||
          patient.medicineAdvice ||
          patient.dischargeData?.medicineAdvice || [
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
  }, [patient, hasDischarged]);

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInvestigationChange = (index, suggestion) => {
    const updatedInvestigations = [...formData.investigations];
    updatedInvestigations[index] = {
      name: suggestion.name,
      category: suggestion.category || "",
      isIncluded: true, // Add default value for new investigations
    };
    setFormData((prev) => ({ ...prev, investigations: updatedInvestigations }));
  };

  const handleAddInvestigation = () => {
    setFormData((prev) => ({
      ...prev,
      investigations: [
        ...prev.investigations,
        { name: "", category: "", isIncluded: true },
      ],
    }));
  };

  const toggleInvestigation = (index) => {
    setFormData((prev) => ({
      ...prev,
      investigations: prev.investigations.map((inv, i) =>
        i === index ? { ...inv, isIncluded: !inv.isIncluded } : inv
      ),
    }));
  };

  const handleRemoveInvestigation = (index) => {
    setFormData((prev) => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== index),
    }));
  };

  const handleComorbidityHandlingChange = (value) => {
    setFormData((prev) => ({ ...prev, comorbidityHandling: value }));
  };

  const { toast } = useToast();
  const { status: dischargeStatus, savingStatus } = useSelector(
    (state) => state.discharge
  );

  const medicineNameRefs = useRef([]);
  const dosageRefs = useRef([]);
  const durationRefs = useRef([]);
  const addMedicineBtnRef = useRef(null);
  const prevMedicineAdviceLength = useRef(
    formData.medicineAdvice?.length || 0
  );

  useEffect(() => {
    const currentLength = formData.medicineAdvice?.length || 0;
    if (currentLength > prevMedicineAdviceLength.current) {
      medicineNameRefs.current[currentLength - 1]?.focus();
    }
    prevMedicineAdviceLength.current = currentLength;
  }, [formData.medicineAdvice]);

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
      comorbidities: (() => {
        const data = formData.comorbidities;
        // If it's a string, split it into array
        if (typeof data === "string") {
          return data.split(",").map((item) => item.trim());
        }
        // If it's already an array, handle different formats
        if (Array.isArray(data)) {
          return data
            .map((c) => {
              if (typeof c === "string") {
                return c.trim();
              }
              return c.name;
            })
            .filter((c) => c?.trim() !== "");
        }
        // Default to empty array if neither string nor array
        return [];
      })(),
      medicineAdvice: formData.medicineAdvice
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          dosage: m.dosage,
        })),
      investigations: formData.investigations
        .filter((inv) => inv.name.trim() !== "" && inv.isIncluded)
        .map((i) => ({
          name: i.name,
          category: i.category,
          report: i.report,
          date: i.date || new Date().toISOString(),
        })),
    };

    try {
      await dispatch(dischargePatient(dischargePayload)).unwrap();
      setHasDischarged(true);
      toast({
        title: "Success",
        description: "Patient discharged successfully",
        variant: "success",
      });
      handlePrint();
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
      comorbidities: (() => {
        const data = formData.comorbidities;
        // If it's a string, split it into array
        if (typeof data === "string") {
          return data.split(",").map((item) => item.trim());
        }
        // If it's already an array, handle different formats
        if (Array.isArray(data)) {
          return data
            .map((c) => {
              if (typeof c === "string") {
                return c.trim();
              }
              return c.name;
            })
            .filter((c) => c?.trim() !== "");
        }
        // Default to empty array if neither string nor array
        return [];
      })(),
      medicineAdvice: formData.medicineAdvice
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          dosage: m.dosage,
        })),
      investigations: formData.investigations
        .filter((inv) => inv.name.trim() !== "" && inv.isIncluded)
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

  return (
    <div className="container mx-auto py-2 sm:py-4 px-2 sm:px-4 lg:px-6 max-w-7xl">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground py-2 sm:py-3">
          <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 text-primary-foreground hover:text-primary hover:bg-primary-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg sm:text-xl">
                Discharge Summary
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            {formConfig.sections.map((section) => (
              <div
                key={section.id}
                className={` bg-white rounded-lg p-2 sm:p-4`}
              >
                {section.title && (
                  <h2 className="text-base sm:text-lg font-semibold mb-2 text-primary">
                    {section.title}
                  </h2>
                )}
                <div className=" gap-2 sm:gap-4 text-sm sm:text-base py-4">
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
                        <div key={field.id} className=" py-6">
                          <Label className="text-xl italic" htmlFor={field.id}>{field.label}</Label>
                          <div className="space-y-2 mt-1">
                            {formData.investigations.map(
                              (investigation, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                                >
                                  <div className="sm:col-span-3">
                                    <SearchSuggestion
                                      suggestions={allLabTests}
                                      placeholder="Select investigation"
                                      value={investigation.name}
                                      setValue={(value) =>
                                        handleInvestigationChange(index, {
                                          name: value,
                                        })
                                      }
                                      onSuggestionSelect={(suggestion) =>
                                        handleInvestigationChange(
                                          index,
                                          suggestion
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      type="button"
                                      variant={
                                        investigation.isIncluded
                                          ? "default"
                                          : "outline"
                                      }
                                      size="icon"
                                      onClick={() => toggleInvestigation(index)}
                                      aria-label="Toggle Investigation"
                                      disabled={!investigation.name}
                                    >
                                      {investigation.isIncluded ? (
                                        <Check
                                          className="h-4 w-4 text-white-500"
                                          strokeWidth={4}
                                        />
                                      ) : (
                                        <X
                                          className="h-4 w-4 text-red-500 font-bold"
                                          strokeWidth={4}
                                        />
                                      )}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleOpenLabReport(investigation)
                                      }
                                      aria-label="Open Lab Report"
                                      disabled={!investigation.name}
                                    >
                                      <ChevronRight className="h-5 w-5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() =>
                                        handleRemoveInvestigation(index)
                                      }
                                      disabled={
                                        formData.investigations.length === 1
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            )}
                            <Button
                              onClick={handleAddInvestigation}
                              variant="outline"
                              className="mt-2 font-semibold"
                              type="button"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" /> Add
                              Investigation
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    if (field.type === "medicineAdvice") {
                      return (
                        <div key={field.id} className=" py-4">
                          <Label className="text-xl italic" htmlFor={field.id}>{field.label}</Label>
                          <div className="space-y-1">
                            {formData[field.id]?.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-1"
                              >
                                <div
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <SearchSuggestion
                                    ref={(el) =>
                                      (medicineNameRefs.current[index] = el)
                                    }
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
                                      {
                                        handleMedicineAdviceSuggestionSelect(
                                          index,
                                          suggestion,
                                          field.id
                                        );
                                        dosageRefs.current[index]?.focus();
                                      }
                                    }
                                  />
                                </div>
                                <Input
                                  ref={(el) => (dosageRefs.current[index] = el)}
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
                                      durationRefs.current[index]?.focus();
                                    }
                                  }}
                                />
                                <Input
                                  ref={(el) => (durationRefs.current[index] = el)}
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
                                      addMedicineBtnRef.current?.focus();
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    removeMedicineAdvice(index, field.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              ref={addMedicineBtnRef}
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
                        field.id === "admittedTime" ||
                        field.id === "bookingTime"
                      ) {
                        value =
                          (field.id === "admittedTime"
                            ? formData.admittedTime || formData.bookingTime
                            : formData[field.id]) || "";
                        onChange = handleInputChange;
                      } else {
                        // Get the value directly from patientInfo without fallback to relation
                        value =
                          patientInfo[field.id] || formData?.[field.id] || "";

                        // Only set relation-specific value if this field is actually the relation field
                        if (field.id === patientInfo?.relation?.toLowerCase()) {
                          value =
                            patientInfo[patientInfo.relation.toLowerCase()] ||
                            "";
                          label = patientInfo.relation;
                        }

                        onChange = handlePatientInfoChange;
                      }
                    } else {
                      value = field.id.includes(".")
                        ? field.id
                            .split(".")
                            .reduce((obj, key) => obj?.[key], formData)
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
                      onComorbidityHandlingChange:
                        handleComorbidityHandlingChange,
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
            ))}

            <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="w-full sm:w-auto text-sm sm:text-base py-2 px-4"
              >
                Print
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                variant="outline"
                disabled={savingStatus === "loading" || !patientId}
                className="w-full sm:w-auto text-sm sm:text-base py-2 px-4"
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
                className="w-full sm:w-auto text-sm sm:text-base py-2 px-4"
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

      {/* Lab Report Modal */}
      {isLabReportOpen && selectedInvestigation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full sm:w-11/12 md:w-3/4 lg:w-2/3 p-3 sm:p-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-semibold">
                Lab Report: {selectedInvestigation.name}
              </h2>
              <Button
                onClick={handleCloseLabReport}
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            {selectedTemplate ? (
              <TemplateLabReport
                template={selectedTemplate}
                patientData={patient}
                onSave={handleSaveLabReport}
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
                return (
                  <div>
                    <h1>No Template Found</h1>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Print Preview */}
      <div style={{ display: "none" }} className="print-content">
        <DischargeSummaryPDF
          ref={componentRef}
          formData={{
            ...formData,
            admittedTime:
              formData.admittedTime || convertTo12Hour(formData.bookingTime),
            investigations: formData.investigations
              .filter(
                (inv) => inv.name.trim() !== "" && inv.report && inv.isIncluded
              )
              .map((inv) => ({
                name: inv.name,
                report: inv.report,
                date: inv.date || new Date().toISOString(),
              })),
            comorbidities: (() => {
              const data = formData.comorbidities;
              // If it's a string, split it into array
              if (typeof data === "string") {
                return data.split(",").map((item) => item.trim());
              }
              // If it's already an array, handle different formats
              if (Array.isArray(data)) {
                return data
                  .map((c) => {
                    if (typeof c === "string") {
                      return c.trim();
                    }
                    return c.name;
                  })
                  .filter((c) => c.trim() !== "");
              }
              // Default to empty array if neither string nor array
              return [];
            })(),
          }}
          formConfig={formConfig}
          patient={patientInfo}
          hospital={hospital}
          templateString={selectedTemplateDischargeSummary?.value}
        />
      </div>
    </div>
  );
}
