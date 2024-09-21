import { useState } from 'react'
import { Button } from "../../../ui/button"
import { ChevronRight, BriefcaseMedicalIcon } from "lucide-react"
import SalesTodayDialog from './SalesTodayDialog'

export default function Component() {
  const [isSalesTodayOpen, setIsSalesTodayOpen] = useState(false)

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
          Sales Today
        </Button>
        <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
          Patient List
        </Button>
      </div>
      <SalesTodayDialog isOpen={isSalesTodayOpen} setIsOpen={setIsSalesTodayOpen} />
    </header>
  )
}