import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table'
import { Checkbox } from '../../../ui/checkbox'
import { Button } from '../../../ui/button'

const MedicineSuggDialog = ({ isOpen, setIsOpen, selectedPatient, onConfirm }) => {
  const [selectedMedicines, setSelectedMedicines] = useState([])

  useEffect(() => {
    if (selectedPatient) {
      setSelectedMedicines([]) // Reset selections when a new patient is selected
    }
  }, [selectedPatient])

  const calculateQuantity = (frequency, duration) => {
    const frequencySum = frequency.split('-').reduce((sum, num) => sum + parseInt(num), 0);
    return frequencySum * parseInt(duration);
  }

  const handleCheckboxChange = (medication) => {
    setSelectedMedicines(prev => {
      const existingIndex = prev.findIndex(item => item.name === medication.name);
      if (existingIndex !== -1) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        const quantity = calculateQuantity(medication.frequency, medication.duration);
        return [...prev, { name: medication.name, quantity }];
      }
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allMedicines = selectedPatient?.medications?.map(medication => ({
        name: medication.name,
        quantity: calculateQuantity(medication.frequency, medication.duration)
      }));
      setSelectedMedicines(allMedicines);
    } else {
      setSelectedMedicines([]);
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedMedicines);
    setIsOpen(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedPatient?.patient?.name}'s Medications</DialogTitle>
          <DialogDescription>Select the medications you want to prescribe</DialogDescription>
        </DialogHeader>
        {selectedPatient?.medications?.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectedMedicines.length === selectedPatient?.medications?.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Medication Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPatient?.medications?.map((medication, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMedicines.some(item => item.name === medication.name)}
                        onCheckedChange={() => handleCheckboxChange(medication)}
                      />
                    </TableCell>
                    <TableCell>{medication?.name}</TableCell>
                    <TableCell>{medication?.frequency}</TableCell>
                    <TableCell>{medication?.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DialogFooter>
              <Button onClick={handleConfirm}>Confirm</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-4">
            <p>No medications found for this patient.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MedicineSuggDialog
