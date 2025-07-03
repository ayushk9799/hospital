import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { fetchTemplates, updateTemplate } from "../redux/slices/templatesSlice";
import {
  updateDoctorData,
  resetDoctorData,
  fetchDoctorData,
  copyDoctorData,
  clearCopiedData,
} from "../redux/slices/doctorDataSlice";
import { fetchStaffMembers } from "../redux/slices/staffSlice";
import { X, Plus, ChevronLeft, Save, Copy, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";

export default function Customization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newComorbidity, setNewComorbidity] = useState("");
  const [newMedicine, setNewMedicine] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [selectedComorbidities, setSelectedComorbidities] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const {
    diagnosisTemplate = [],
    comorbidities = [],
    medicinelist = [],
  } = useSelector((state) => state.templates);

  const { doctors } = useSelector((state) => state.staff);
  const {
    status,
    error,
    updateStatus,
    updateError,
    copiedData,
    currentDoctorData,
  } = useSelector((state) => state.doctorData);

  useEffect(() => {
    dispatch(fetchTemplates());
    dispatch(fetchStaffMembers());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedDoctor) {
      if (selectedDiagnoses !== diagnosisTemplate)
        setSelectedDiagnoses(diagnosisTemplate);
      if (selectedComorbidities !== comorbidities)
        setSelectedComorbidities(comorbidities);
      if (selectedMedicines !== medicinelist)
        setSelectedMedicines(medicinelist);
    }
  }, [diagnosisTemplate, selectedDoctor]);

  const handleAddItem = (
    newItem,
    setNewItem,
    selectedItems,
    setSelectedItems
  ) => {
    if (newItem.trim()) {
      setSelectedItems([...selectedItems, ...newItem.trim().split(",")]);
      setNewItem("");
    }
  };
  const handleRemoveItem = (item, selectedItems, setSelectedItems) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  const handleDoctorChange = async (doctorId) => {
    setSelectedDoctor(doctorId);
    if (doctorId) {
      try {
        // Fetch doctor specific data when a doctor is selected
        const result = await dispatch(fetchDoctorData(doctorId)).unwrap();
        if (result) {
          setSelectedDiagnoses(result.diagnosis || []);
          setSelectedComorbidities(result.comorbidities || []);
          setSelectedMedicines(result.medicines || []);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch doctor data",
          variant: "destructive",
        });
      }
    } else {
      // Reset to template data when no doctor is selected
      setSelectedDiagnoses(diagnosisTemplate);
      setSelectedComorbidities(comorbidities);
      setSelectedMedicines(medicinelist);
      dispatch(resetDoctorData());
    }
  };

  const handleSave = async () => {
    try {
      if (selectedDoctor) {
        // If doctor selected, save to DoctorData
        const result = await dispatch(
          updateDoctorData({
            doctor: selectedDoctor,
            medicines: selectedMedicines,
            diagnosis: selectedDiagnoses,
            comorbidities: selectedComorbidities,
            complaints: [], // Adding this as per schema, with default empty array
          })
        ).unwrap();

        toast({
          title: "Success",
          variant: "success",
          description: "Doctor-specific customization saved successfully",
        });
      } else {
        // If no doctor selected, save to global templates
        await dispatch(
          updateTemplate({
            diagnosisTemplate: selectedDiagnoses,
            comorbidities: selectedComorbidities,
            medicinelist: selectedMedicines,
          })
        );

        toast({
          title: "Success",
          variant: "success",
          description: "Global templates updated successfully",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: updateError || "Failed to save customization",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCopy = () => {
    if (selectedDoctor) {
      dispatch(copyDoctorData());
    } else {
      // When no doctor is selected, copy the current template data
      const templateData = {
        diagnosis: selectedDiagnoses,
        comorbidities: selectedComorbidities,
        medicines: selectedMedicines,
      };
      // Since we don't have a specific action for copying template data,
      // we'll manually set it in the Redux store or handle it locally
      dispatch(copyDoctorData(templateData));
    }
    toast({
      title: "Success",
      variant: "success",
      description: "Customization data copied successfully",
    });
  };

  const handlePaste = () => {
    if (copiedData) {
      setSelectedDiagnoses(copiedData.diagnosis);
      setSelectedComorbidities(copiedData.comorbidities);
      setSelectedMedicines(copiedData.medicines);
      toast({
        title: "Success",
        variant: "success",
        description: "Customization data pasted successfully",
      });
    }
  };

  const renderSection = (
    title,
    placeholder,
    newItem,
    setNewItem,
    selectedItems,
    setSelectedItems
  ) => (
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-2">{title}</h2>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <Input
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" &&
            handleAddItem(newItem, setNewItem, selectedItems, setSelectedItems)
          }
          className="w-full sm:flex-grow"
        />
        <Button
          onClick={() =>
            handleAddItem(newItem, setNewItem, selectedItems, setSelectedItems)
          }
          className="w-full sm:w-auto whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      <ScrollArea className="flex-grow border rounded-lg p-2 sm:p-4">
        {selectedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No items added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 text-gray-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors hover:bg-gray-200 whitespace-nowrap"
              >
                <span className="mr-1 sm:mr-2">{item}</span>
                <button
                  onClick={() =>
                    handleRemoveItem(item, selectedItems, setSelectedItems)
                  }
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-2 sm:p-4">
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">Customization</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedDoctor}
              onValueChange={handleDoctorChange}
              disabled={status === "loading"}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue
                  placeholder={
                    status === "loading"
                      ? "Loading..."
                      : "Select a doctor (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
              title="Copy customization"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {copiedData && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePaste}
                className="h-8 w-8"
                title="Paste customization"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="whitespace-nowrap"
              disabled={status === "loading" || updateStatus === "loading"}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateStatus === "loading" ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-2 sm:p-4 border-2">
          {status === "loading" ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Loading doctor data...</p>
            </div>
          ) : (
            <>
              {renderSection(
                "Diagnosis Customization",
                "Add new diagnosis like this (Diagnosis1, Diagnosis2) in comma separated form, then add then save changes",
                newDiagnosis,
                setNewDiagnosis,
                selectedDiagnoses,
                setSelectedDiagnoses
              )}
              {renderSection(
                "Comorbidities Customization",
                "Add new comorbidities like this (Comorbidites1, Comorbidites2) in comma separated form, then add then save changes",
                newComorbidity,
                setNewComorbidity,
                selectedComorbidities,
                setSelectedComorbidities
              )}
              {renderSection(
                "Medicine List Customization",
                "Add new medicine like this (Medicine1, Medicine2) in comma separated form, then add then save changes",
                newMedicine,
                setNewMedicine,
                selectedMedicines,
                setSelectedMedicines
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
