import React, { useState, useEffect } from 'react'

const MINUTES_PER_DAY = 24 * 60
const INTERVAL_MINUTES = 5

const EVENTS = [
  { id: 1, name: "Patient Consultation", start: "8:30", end: "8:45", color: "from-blue-100 to-blue-50", textColor: "text-blue-800", borderColor: "border-blue-200" },
  { id: 2, name: "Quick Check-up", start: "9:00", end: "9:10", color: "from-green-100 to-green-50", textColor: "text-green-800", borderColor: "border-green-200" },
  { id: 3, name: "Surgery Prep", start: "9:15", end: "10:00", color: "from-red-100 to-red-50", textColor: "text-red-800", borderColor: "border-red-200" },
  { id: 3, name: "Surgery Prep", start: "13:15", end: "13:30", color: "from-red-100 to-red-50", textColor: "text-red-800", borderColor: "border-red-200" },
  { id: 3, name: "Surgery Prep", start: "1:15", end: "1:30", color: "from-red-100 to-red-50", textColor: "text-red-800", borderColor: "border-red-200" },
  // ... other events ...
]

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const calculateEventStyle = (start, end) => {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  
  const topPercentage = (startMinutes / MINUTES_PER_DAY) * 100
  const heightPercentage = ((endMinutes - startMinutes) / MINUTES_PER_DAY) * 100

  return {
    top: `${topPercentage}%`,
    height: `${heightPercentage}%`
  }
}

const getCurrentTime = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes
  return {
    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    percentage: (totalMinutes / MINUTES_PER_DAY) * 100
  }
}

const AppointmentsBody = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full bg-white pr-2">
      <div className="relative" style={{ height: "2880px" }}> {/* 24 hours * 60 minutes * 2 (for better visibility) */}
        <div className="absolute top-0 left-0 w-16 h-full flex flex-col border-r border-gray-200">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="h-[120px] text-xs text-gray-500 text-right pr-4">
              {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>
        <div className="absolute top-2 left-10 right-0 h-full pl-4">
          {Array.from({ length: MINUTES_PER_DAY / INTERVAL_MINUTES }).map((_, index) => (
            <div 
              key={index} 
              className={`absolute w-full border-t ${index % 12 === 0 ? 'border-gray-500' : 'border-gray-200'}`} 
              style={{ top: `${(index * INTERVAL_MINUTES / MINUTES_PER_DAY) * 100}%` }} 
            />
          ))}
          {EVENTS.map((event) => (
            <div
              key={event.id}
              className={`
                absolute left-6 right-1 p-1 rounded-lg overflow-hidden 
                transition-all duration-200 hover:shadow-lg 
                border-2 ${event.borderColor} shadow
                flex items-center
              `}
              style={{
                ...calculateEventStyle(event.start, event.end),
                background: `linear-gradient(135deg, ${event.color.split(' ')[1]} 0%, ${event.color.split(' ')[3]} 100%)`,
              }}
            >
              <div className="flex items-center w-full">
                <div className={`w-2 h-2 rounded-full ${event.borderColor} mr-1 flex-shrink-0`}></div>
                <div className="flex-1 flex items-center min-w-0">
                  <div className={`text-xs font-medium ${event.textColor} truncate mr-1`}>{event.name}</div>
                  <div className={`text-xs ${event.textColor} opacity-75 whitespace-nowrap`}>
                    {event.start} - {event.end}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Current time line */}
          <div 
            className="absolute left-6 right-0 h-0.5 bg-red-500 z-10"
            style={{ top: `${currentTime.percentage}%` }}
          >
            <div className="absolute -top-2 -left-16 bg-red-500 text-white text-xs py-1 px-2 rounded">
              {currentTime.formatted}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsBody