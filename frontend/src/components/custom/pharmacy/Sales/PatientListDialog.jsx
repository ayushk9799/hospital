import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog"
import { Input } from "../../../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Search, X, RefreshCw } from 'lucide-react'
import { setSelectedPatient } from '../../../../redux/slices/patientSlice'
import { fetchPatients } from '../../../../redux/slices/patientSlice'
import { Button } from "../../../ui/button"

export default function PatientListDialog({ isOpen, setIsOpen, onPatientSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const patients = useSelector((state) => state.patients.patientlist)
  const dispatch = useDispatch()
  const patientsStatus = useSelector((state) => state.patients.status)

  const filteredPatients = patients.filter(patient =>
    patient.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePatientSelect = (patient) => {
    dispatch(setSelectedPatient(patient))
    setIsOpen(false)
    onPatientSelect(true) // This will set shouldOpenMedicineSuggDialog to true in the parent component
  }

  const handleRefresh = () => {
    dispatch(fetchPatients())
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[500px]">
        <DialogHeader>
          <DialogTitle>Patient List</DialogTitle>
          <DialogDescription>Select a patient to continue</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-grow mr-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={patientsStatus === 'loading'}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Medications</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow 
                key={patient?.bookingNumber} 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handlePatientSelect(patient)}
              >
                <TableCell>{patient?.patient?.name}</TableCell>
                <TableCell>{patient?.patient?.contactNumber}</TableCell>
                <TableCell>{patient?.patient?.gender}</TableCell>
                <TableCell>{patient?.medications?.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
