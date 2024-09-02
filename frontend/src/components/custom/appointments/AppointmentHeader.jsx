import React, { useState } from 'react'
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, UserPlus } from "lucide-react"
import { Calendar } from "../../ui/calendar"
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"

const AppointmentHeader = () => {
  const [date, setDate] = useState(new Date())

  return (
    <header className="bg-white text-gray-800 px-4 py-2 flex justify-between items-center shadow-sm border-b border-gray-200 h-[50px]">
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-4 w-4" />
        <h1 className="text-base font-semibold">Appointment List</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="xs" className="text-gray-600 hover:bg-gray-100" onClick={() => setDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="text-base font-semibold">
              {format(date, 'EEEE, MMM d')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="xs" className="text-gray-600 hover:bg-gray-100" onClick={() => setDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Select>
          <SelectTrigger className="w-[160px] h-8 text-sm bg-gray-50 text-gray-800 border-gray-200 focus:ring-blue-500">
            <SelectValue placeholder="All Dr. Yogesh Bala..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dr. Yogesh Bala...</SelectItem>
          </SelectContent>
        </Select>
        {/* <Button variant="secondary" size="xs" className="bg-blue-500 text-white hover:bg-blue-600 h-8 px-5">Add Patient</Button> */}
        <Button variant="outline" size="xs" className="h-8 px-5">
          <UserPlus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>
    </header>
  )
}

export default AppointmentHeader