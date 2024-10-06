import React, { useState } from 'react'
import { Button } from "../../ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, subDays } from 'date-fns'

const AppointmentHeader = () => {
  const [date, setDate] = useState(new Date())

  const handleDateChange = (direction) => {
    setDate(prevDate => direction === 'prev' ? subDays(prevDate, 1) : addDays(prevDate, 1))
  }

  return (
    <header className="bg-white text-gray-800 px-4 py-2 flex justify-between items-center shadow-sm border-b border-gray-200 h-[50px]">
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-4 w-4" />
        <h1 className="text-base font-semibold">Appointment List</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-600 hover:bg-gray-100" 
          onClick={() => handleDateChange('prev')}
          disabled={format(date, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-base font-semibold min-w-[80px] text-center">
          {format(date, 'MMM d')}
        </span>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-600 hover:bg-gray-100" 
          onClick={() => handleDateChange('next')}
          disabled={format(date, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-[100px]"></div>
    </header>
  )
}

export default AppointmentHeader