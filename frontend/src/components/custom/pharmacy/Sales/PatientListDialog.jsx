import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog"
import { Input } from "../../../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Search, X, RefreshCw } from 'lucide-react'
import { setSelectedPatient } from '../../../../redux/slices/patientSlice'
import { fetchPatients } from '../../../../redux/slices/patientSlice'
import { Button } from "../../../ui/button"
import { ScrollArea } from "../../../ui/scroll-area"

export default function PatientListDialog({ isOpen, setIsOpen, onPatientSelect }) {
  const [searchTerm, setSearchTerm] = useState("")
  // const [filteredPatients, setFilteredPatients] = useState([])
  const patients = useSelector((state) => state.patients.patientlist)
  const dispatch = useDispatch()
  const patientsStatus = useSelector((state) => state.patients.status)
  const filteredPatients = patients.filter(p => p.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  
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
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Patient List</DialogTitle>
          <DialogDescription>Select a patient to continue</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center">
          <div className="relative flex-grow mr-4">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm"
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
            size="sm"
          >
            {patientsStatus === 'loading' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
        <ScrollArea className="flex-grow h-[calc(80vh-200px)] pr-2">
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
                  key={patient?._id} 
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
