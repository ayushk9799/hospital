import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { PlusCircle, X } from 'lucide-react';

const initialBloodWorkFields = [
  { name: 'wbc', label: 'White Blood Cell Count (WBC)', unit: '10^3/µL', value: '' },
  { name: 'rbc', label: 'Red Blood Cell Count (RBC)', unit: '10^6/µL', value: '' },
  { name: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', value: '' },
  { name: 'hematocrit', label: 'Hematocrit', unit: '%', value: '' },
  { name: 'platelets', label: 'Platelet Count', unit: '10^3/µL', value: '' },
  { name: 'mcv', label: 'Mean Corpuscular Volume (MCV)', unit: 'fL', value: '' },
  { name: 'mch', label: 'Mean Corpuscular Hemoglobin (MCH)', unit: 'pg', value: '' },
  { name: 'mchc', label: 'Mean Corpuscular Hemoglobin Concentration (MCHC)', unit: 'g/dL', value: '' },
  { name: 'neutrophils', label: 'Neutrophils', unit: '%', value: '' },
  { name: 'lymphocytes', label: 'Lymphocytes', unit: '%', value: '' },
  { name: 'monocytes', label: 'Monocytes', unit: '%', value: '' },
  { name: 'eosinophils', label: 'Eosinophils', unit: '%', value: '' },
  { name: 'basophils', label: 'Basophils', unit: '%', value: '' },
  { name: 'glucose', label: 'Glucose', unit: 'mg/dL', value: '' },
  { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL', value: '' },
];

const CreateBloodWork = () => {
  const [bloodWorkFields, setBloodWorkFields] = useState(initialBloodWorkFields);
  const [newField, setNewField] = useState({ name: '', label: '', unit: '', value: '' });

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setBloodWorkFields(prevFields =>
      prevFields.map(field =>
        field.name === fieldName ? { ...field, value } : field
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Blood Work Data:', bloodWorkFields);
    // TODO: Implement API call to save blood work data
  };

  const handleAddField = () => {
    if (newField.name && newField.label && newField.unit) {
      setBloodWorkFields([...bloodWorkFields, { ...newField, value: '' }]);
      setNewField({ name: '', label: '', unit: '', value: '' });
    }
  };

  const handleRemoveField = (fieldName) => {
    setBloodWorkFields(bloodWorkFields.filter(field => field.name !== fieldName));
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Blood Work Report</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloodWorkFields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <Label htmlFor={field.name} className="mb-1">{field.label}</Label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => handleInputChange(e, field.name)}
                    className="mr-2"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500 w-16">{field.unit}</span>
                  {!initialBloodWorkFields.some(f => f.name === field.name) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(field.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Add Custom Field</h2>
            <div className="flex space-x-2">
              <Input
                placeholder="Field Name"
                value={newField.name}
                onChange={(e) => setNewField({...newField, name: e.target.value})}
              />
              <Input
                placeholder="Label"
                value={newField.label}
                onChange={(e) => setNewField({...newField, label: e.target.value})}
              />
              <Input
                placeholder="Unit"
                value={newField.unit}
                onChange={(e) => setNewField({...newField, unit: e.target.value})}
              />
              <Button type="button" onClick={handleAddField}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full">Save Blood Work Report</Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateBloodWork;