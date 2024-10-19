import { useState } from 'react'
import { Button } from "../../../ui/button"
import { ChevronRight, BriefcaseMedicalIcon, Eraser, DollarSign, Users } from "lucide-react"
import SalesTodayDialog from './SalesTodayDialog'
import PatientListDialog from './PatientListDialog'
import { useMediaQuery } from '../../../../hooks/use-media-query'

export default function Component({ onClearScreen, onPatientSelect }) {
  const [isSalesTodayOpen, setIsSalesTodayOpen] = useState(false)
  const [isPatientListOpen, setIsPatientListOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 640px)')

  return (
    <header className="flex items-center justify-between p-1 bg-gray-100 border-b">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="text-gray-600">
          <BriefcaseMedicalIcon className="h-4 w-4" />
        </Button>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="font-semibold text-gray-700 text-sm">Sales</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="default" 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          onClick={() => setIsSalesTodayOpen(true)}
        >
          {isMobile ? <DollarSign className="h-4 w-4" /> : "Sales Today"}
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
          onClick={() => setIsPatientListOpen(true)}
        >
          {isMobile ? <Users className="h-4 w-4" /> : "Patient List"}
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-red-600 hover:bg-red-700 text-white text-xs"
          onClick={onClearScreen}
        >
          {isMobile ? <Eraser className="h-4 w-4" /> : "Clear Screen"}
        </Button>
      </div>
      <SalesTodayDialog isOpen={isSalesTodayOpen} setIsOpen={setIsSalesTodayOpen} />
      <PatientListDialog 
        isOpen={isPatientListOpen} 
        setIsOpen={setIsPatientListOpen} 
        onPatientSelect={onPatientSelect}
      />
    </header>
  )
}
