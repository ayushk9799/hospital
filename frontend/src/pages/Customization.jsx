import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { fetchTemplates, updateTemplate } from "../redux/slices/templatesSlice";
import { X, Plus } from "lucide-react";

export default function Customization() {
  const dispatch = useDispatch();
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const diagnosisTemplate = useSelector((state) => state.templates.diagnosisTemplate || []);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  useEffect(() => {
    setSelectedDiagnoses(diagnosisTemplate);
  }, [diagnosisTemplate]);

  const handleAddDiagnosis = () => {
    if (newDiagnosis.trim()) {
      setSelectedDiagnoses([...selectedDiagnoses, ...(newDiagnosis.trim().split(","))]);
      setNewDiagnosis("");
    }
  };

  const handleRemoveDiagnosis = (diagnosis) => {
    setSelectedDiagnoses(selectedDiagnoses.filter((d) => d !== diagnosis));
  };

  const handleSave = () => {
    console.log(selectedDiagnoses)
    dispatch(updateTemplate({ diagnosisTemplate: selectedDiagnoses }));
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Customization</h1>
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl sm:text-2xl">Diagnosis Customization</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Input
              placeholder="Add new diagnosis"
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDiagnosis()}
              className="w-full sm:flex-grow"
            />
            <Button onClick={handleAddDiagnosis} className="w-full sm:w-auto whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Add Diagnosis
            </Button>
          </div>
          <ScrollArea className="flex-grow border rounded-lg p-2 sm:p-4 mb-4">
            {selectedDiagnoses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No diagnoses added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedDiagnoses.map((diagnosis, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 text-gray-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors hover:bg-gray-200 whitespace-nowrap"
                  >
                    <span className="mr-1 sm:mr-2">{diagnosis}</span>
                    <button
                      onClick={() => handleRemoveDiagnosis(diagnosis)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
