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
import { fetchTemplates, updateTemplate } from "../redux/slices/templatesSlice";
import { X, Plus, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Customization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newComorbidity, setNewComorbidity] = useState("");
  const [newMedicine, setNewMedicine] = useState("");

  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [selectedComorbidities, setSelectedComorbidities] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const {
    diagnosisTemplate = [],
    comorbidities = [],
    medicinelist = [],
  } = useSelector((state) => state.templates);
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDiagnoses !== diagnosisTemplate)
      setSelectedDiagnoses(diagnosisTemplate);
    if (selectedComorbidities !== comorbidities)
      setSelectedComorbidities(comorbidities);
    if (selectedMedicines !== medicinelist) setSelectedMedicines(medicinelist);
  }, [diagnosisTemplate]);

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

  const handleSave = () => {
    dispatch(
      updateTemplate({
        diagnosisTemplate: selectedDiagnoses,
        comorbidities: selectedComorbidities,
        medicinelist: selectedMedicines,
      })
    );
  };

  const handleBack = () => {
    navigate(-1);
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
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">Customization</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-2 sm:p-4 border-2">
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
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
