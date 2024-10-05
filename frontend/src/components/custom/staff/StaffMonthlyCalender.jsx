import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { cn } from "../../../lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip"

// Sample data for a month
const monthData = {
  '2023-07-01': { hours: 8, patients: 5, status: 'present' },
  '2023-07-02': { hours: 0, patients: 0, status: 'off' },
  '2023-07-03': { hours: 7.5, patients: 4, status: 'present' },
  '2023-07-04': { hours: 8, patients: 6, status: 'present' },
  '2023-07-05': { hours: 8, patients: 5, status: 'present' },
  '2023-07-06': { hours: 4, patients: 2, status: 'half-day' },
  '2023-07-07': { hours: 8, patients: 7, status: 'present' },
  '2023-07-08': { hours: 0, patients: 0, status: 'off' },
  '2023-07-09': { hours: 0, patients: 0, status: 'off' },
  '2023-07-10': { hours: 8, patients: 5, status: 'present' },
  '2023-07-11': { hours: 8, patients: 6, status: 'present' },
  '2023-07-12': { hours: 0, patients: 0, status: 'sick' },
  '2023-07-13': { hours: 8, patients: 4, status: 'present' },
  '2023-07-14': { hours: 8, patients: 5, status: 'present' },
  '2023-07-15': { hours: 0, patients: 0, status: 'off' },
  '2023-07-16': { hours: 0, patients: 0, status: 'off' },
  '2023-07-17': { hours: 8, patients: 6, status: 'present' },
  '2023-07-18': { hours: 8, patients: 5, status: 'present' },
  '2023-07-19': { hours: 8, patients: 7, status: 'present' },
  '2023-07-20': { hours: 8, patients: 4, status: 'present' },
  '2023-07-21': { hours: 8, patients: 5, status: 'present' },
  '2023-07-22': { hours: 0, patients: 0, status: 'off' },
  '2023-07-23': { hours: 0, patients: 0, status: 'off' },
  '2023-07-24': { hours: 8, patients: 6, status: 'present' },
  '2023-07-25': { hours: 8, patients: 5, status: 'present' },
  '2023-07-26': { hours: 8, patients: 4, status: 'present' },
  '2023-07-27': { hours: 8, patients: 6, status: 'present' },
  '2023-07-28': { hours: 8, patients: 5, status: 'present' },
  '2023-07-29': { hours: 0, patients: 0, status: 'off' },
  '2023-07-30': { hours: 0, patients: 0, status: 'off' },
  '2023-07-31': { hours: 8, patients: 5, status: 'present' },
}

export default function StaffMonthlyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 6, 1)) // July 2023

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

  const navigateMonth = (direction) => {
    setCurrentMonth(prevMonth => direction === 'prev' ? subMonths(prevMonth, 1) : addMonths(prevMonth, 1))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'half-day': return 'bg-yellow-100 text-yellow-800'
      case 'off': return 'bg-gray-100 text-gray-800'
      case 'sick': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Monthly Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center bg-muted rounded-md px-3 py-1">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>{format(currentMonth, 'MMMM yyyy')}</span>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Staff attendance and work summary for the month</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="text-center bg-white/70 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-lg text-gray-600">We're working on something exciting!</p>
            <div className="mt-4 w-16 h-1 bg-blue-400 mx-auto rounded-full"></div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 opacity-40">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold">
              {day}
            </div>
          ))}
          {dateRange.map((day, dayIdx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayData = monthData[dateKey]
            return (
              <TooltipProvider key={day.toString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-20 border rounded-md p-1 flex flex-col",
                        !isSameMonth(day, currentMonth) && "bg-gray-50 text-gray-400",
                        isSameDay(day, new Date()) && "border-blue-500"
                      )}
                    >
                      <div className="text-right">{format(day, 'd')}</div>
                      {dayData && (
                        <div className="flex-grow flex flex-col justify-between">
                          <Badge className={cn("w-full justify-center", getStatusColor(dayData.status))}>
                            {dayData.status}
                          </Badge>
                          {dayData.status !== 'off' && (
                            <div className='flex justify-between mt-auto'>
                              <div className="flex items-center justify-center text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {dayData.hours}h
                              </div>
                              <div className="flex items-center justify-center text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {dayData.patients}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date: {format(day, 'MMMM d, yyyy')}</p>
                    {dayData && (
                      <>
                        <p>Status: {dayData.status}</p>
                        <p>Hours worked: {dayData.hours}</p>
                        <p>Patients seen: {dayData.patients}</p>
                      </>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}