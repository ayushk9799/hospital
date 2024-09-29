import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { labCategories, labReportFields } from '../assets/Data';

export default function Settings() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [templateName, setTemplateName] = useState('');

  const handleAddStaff = () => {
    navigate('/addstaff');
  };

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleHospitalInfo = () => {
    navigate('/settings/hospital-info');
  };

  const formatTestKey = (test) => {
    return test.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
  };

  const handleTestSelection = (category, test) => {
    setSelectedTests(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [test]: !prev[category]?.[test]
      }
    }));

    // Initialize or clear selected fields for this test
    if (!selectedTests[category]?.[test]) {
      setSelectedFields(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [test]: {}
        }
      }));
    } else {
      setSelectedFields(prev => {
        const newFields = { ...prev };
        if (newFields[category]) {
          delete newFields[category][test];
        }
        return newFields;
      });
    }
  };

  const handleFieldSelection = (category, test, field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field.name]: {
        label: field.label,
        value: field.value,
        unit: field.unit,
        normalRange: field.normalRange,
        isSelected: !prev[field.name]?.isSelected
      }
    }));
  };

  const handleCreateTemplate = () => {
    const template = {
      name: templateName,
      fields: Object.entries(selectedFields)
        .filter(([_, field]) => field.isSelected)
        .reduce((acc, [key, field]) => {
          acc[key] = {
            label: field.label,
            value: field.value,
            unit: field.unit,
            normalRange: field.normalRange
          };
          return acc;
        }, {})
    };

    console.log('Created Template:', template);
    setIsOpen(false);
    setSelectedTests({});
    setSelectedFields({});
    setTemplateName('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-x-4">
        <Button onClick={handleAddStaff}>Add Staff</Button>
        <Button onClick={handleCreateRoom}>Create Room</Button>
        <Button onClick={handleHospitalInfo}>Hospital Info</Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Test Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Custom Test Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <ScrollArea className="h-[300px] pr-4">
                {labCategories.map((category) => (
                  <div key={category.name} className="mb-4">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {category.types.map((test) => (
                        <div key={test} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${category.name}-${test}`}
                              checked={selectedTests[category.name]?.[test] || false}
                              onCheckedChange={() => handleTestSelection(category.name, test)}
                            />
                            <label htmlFor={`${category.name}-${test}`} className="text-sm">
                              {test}
                            </label>
                          </div>
                          {selectedTests[category.name]?.[test] && 
                           labReportFields[category.name.toLowerCase()]?.[formatTestKey(test)] && (
                            <div className="ml-6 space-y-1">
                              {labReportFields[category.name.toLowerCase()][formatTestKey(test)].map((field) => (
                                <div key={field.name} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${field.name}`}
                                    checked={selectedFields[field.name]?.isSelected || false}
                                    onCheckedChange={() => handleFieldSelection(category.name, test, field)}
                                  />
                                  <label htmlFor={`${field.name}`} className="text-xs">
                                    {field.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </DialogContent>
        </Dialog>
      </div>
      {/* Other settings content */}
    </div>
  );
}