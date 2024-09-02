import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Command,
  CommandItem,
  CommandList,
  CommandGroup
} from '../../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

const suggestedMedicines = [
  "Paracetamol", "Ibuprofen", "Amoxicillin", "Metformin",
  "Aspirin", "Ciprofloxacin", "Doxycycline", "Lisinopril",
  "Atorvastatin", "Omeprazole", "Simvastatin", "Levothyroxine"
];

const PatientBill = () => {
  const [patientType, setPatientType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [items, setItems] = useState([]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: '', price: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const [medicineSuggestions, setMedicineSuggestions] = useState(suggestedMedicines);
  const [isMedicineOpen, setIsMedicineOpen] = useState(false);

  const handleMedicineInputChange = (index, value) => {
    updateItem(index, 'name', value);
    setMedicineSuggestions(suggestedMedicines.filter(med => med.toLowerCase().includes(value.toLowerCase())));
    setIsMedicineOpen(true);
  };

  const handleMedicineSelect = (index, value) => {
    updateItem(index, 'name', value);
    setIsMedicineOpen(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Bill</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Select onValueChange={setPatientType} className="w-1/3">
            <SelectTrigger>
              <SelectValue placeholder="Patient type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opd">OPD</SelectItem>
              <SelectItem value="ipd">IPD</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {(patientType === 'opd' || patientType === 'ipd') && (
            <Input
              placeholder="Registration Number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-2/3"
            />
          )}
        </div>

        {patientName && (
          <div className="text-sm font-medium">Patient Name: {patientName}</div>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex space-x-2">
              <div className="relative w-1/2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between w-full",
                        !item.name && "text-muted-foreground"
                      )}
                    >
                      {item.name || "Select medicine"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <Input
                        placeholder="Type a command or search..."
                        type="text"
                        value={item.name}
                        onChange={(e) => handleMedicineInputChange(index, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                      />
                      <CommandList>
                        
                        <CommandGroup>
                          {medicineSuggestions.map((med) => (
                            <CommandItem
                              key={med}
                              onSelect={() => handleMedicineSelect(index, med)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  item.name === med ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {med}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                className="w-1/4"
              />
              <Input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                className="w-1/4"
              />
            </div>
          ))}
        </div>

        <Button onClick={addItem} variant="outline" className="w-full">
          Add Medicine
        </Button>

        <div className="text-right font-medium">
          Total: ₹{total.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientBill;