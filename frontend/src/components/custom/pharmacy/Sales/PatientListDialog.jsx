import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog"
import { Input } from "../../../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Search, X, RefreshCw } from 'lucide-react'
import { setSelectedPatient, fetchPatients } from '../../../../redux/slices/patientSlice'
import { Button } from "../../../ui/button"
import { ScrollArea } from "../../../ui/scroll-area"
import {useMediaQuery} from '../../../../hooks/use-media-query'

export default function PatientListDialog({ isOpen, setIsOpen, onPatientSelect }) {
  const [searchTerm, setSearchTerm] = useState("")
  const patients = useSelector((state) => state.patients.patientlist)
  const dispatch = useDispatch()
  const patientsStatus = useSelector((state) => state.patients.status)
  const filteredPatients = patients.filter(p => p.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  
  const isSmallScreen = useMediaQuery('(max-width: 640px)')
  const isMediumScreen = useMediaQuery('(max-width: 768px)')

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
      <DialogContent className={`${isSmallScreen ? 'w-full' : 'max-w-3xl'} max-h-[90vh] flex flex-col`}>
        <DialogHeader>
          <DialogTitle>Patient List</DialogTitle>
          <DialogDescription>Select a patient to continue</DialogDescription>
        </DialogHeader>
        <div className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row'} justify-between items-center gap-2`}>
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm w-full"
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
        <ScrollArea className="flex-grow h-[calc(90vh-200px)] pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {!isSmallScreen && <TableHead>Mobile</TableHead>}
                {!isMediumScreen && <TableHead>Gender</TableHead>}
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
                  {!isSmallScreen && <TableCell>{patient?.patient?.contactNumber}</TableCell>}
                  {!isMediumScreen && <TableCell>{patient?.patient?.gender}</TableCell>}
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
