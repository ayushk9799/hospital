import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { fetchTemplates, updateDiagnosisTemplate } from "../redux/slices/templatesSlice";
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
      setSelectedDiagnoses([...selectedDiagnoses, newDiagnosis.trim()]);
      setNewDiagnosis("");
    }
  };

  const handleRemoveDiagnosis = (diagnosis) => {
    setSelectedDiagnoses(selectedDiagnoses.filter((d) => d !== diagnosis));
  };

  const handleSave = () => {
    dispatch(updateDiagnosisTemplate(selectedDiagnoses));
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h1 className="text-3xl font-bold mb-4">Customization</h1>
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-2xl">Diagnosis Customization</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Add new diagnosis"
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDiagnosis()}
              className="flex-grow"
            />
            <Button onClick={handleAddDiagnosis} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Add Diagnosis
            </Button>
          </div>
          <ScrollArea className="flex-grow border rounded-lg p-4 mb-4">
            {selectedDiagnoses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No diagnoses added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedDiagnoses.map((diagnosis, index) => (
                  <div key={index} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    <span className="mr-2">{diagnosis}</span>
                    <button
                      onClick={() => handleRemoveDiagnosis(diagnosis)}
                      className="text-gray-500 hover:text-red-500 focus:outline-none"
                    >
                      <X className="h-4 w-4" />
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