import React from 'react'

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0 to 23 hours

const EVENTS = [
  { id: 1, name: "Patient Consultation", start: "08:30", end: "09:00", color: "from-blue-100 to-blue-50", textColor: "text-blue-800", borderColor: "border-blue-200" },
  { id: 2, name: "Surgery Prep", start: "09:15", end: "10:00", color: "from-green-100 to-green-50", textColor: "text-green-800", borderColor: "border-green-200" },
  { id: 3, name: "Surgery", start: "10:00", end: "12:30", color: "from-red-100 to-red-50", textColor: "text-red-800", borderColor: "border-red-200" },
  { id: 4, name: "Lunch Break", start: "12:30", end: "13:30", color: "from-yellow-100 to-yellow-50", textColor: "text-yellow-800", borderColor: "border-yellow-200" },
  { id: 5, name: "Team Meeting", start: "13:30", end: "14:15", color: "from-purple-100 to-purple-50", textColor: "text-purple-800", borderColor: "border-purple-200" },
  { id: 6, name: "Patient Rounds", start: "14:30", end: "16:00", color: "from-indigo-100 to-indigo-50", textColor: "text-indigo-800", borderColor: "border-indigo-200" },
  { id: 7, name: "Admin Work", start: "16:15", end: "17:45", color: "from-pink-100 to-pink-50", textColor: "text-pink-800", borderColor: "border-pink-200" },
]

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const calculateEventStyle = (start, end) => {
  const startMinutes = timeToMinutes(start) - 8 * 60 // Offset by 8 hours (8 AM start)
  const duration = timeToMinutes(end) - timeToMinutes(start)
  const topPercentage = (startMinutes / (12 * 60)) * 100
  const heightPercentage = (duration / (12 * 60)) * 100
  return { top: `${topPercentage}%`, height: `${heightPercentage}%` }
}

const AppointmentsBody = () => {
  return (
    <div className="w-full bg-white pr-2">
        <div className="relative" style={{ height: "1440px" }}> {/* 24 hours * 60 minutes */}
          <div className="absolute top-0 left-0 w-16 h-full flex flex-col border-r border-gray-200">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[60px] text-xs text-gray-500 text-right pr-4">
                {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>
          <div className="absolute top-2 left-10 right-0 h-full pl-4">
            {HOURS.flatMap((hour) => [
              <div key={`${hour}-full`} className="absolute w-full border-t border-gray-200" style={{ top: `${(hour / 24) * 100}%` }} />,
              <div key={`${hour}-half`} className="absolute w-full border-t border-gray-100" style={{ top: `${((hour + 0.5) / 24) * 100}%` }} />
            ])}
            {/* {EVENTS.map((event) => (
              <div
                key={event.id}
                className={`absolute left-4 right-4 p-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${event.borderColor} border`}
                style={{
                  ...calculateEventStyle(event.start, event.end),
                  background: `linear-gradient(135deg, ${event.color.split(' ')[1]}, ${event.color.split(' ')[3]})`,
                }}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${event.borderColor} mr-2`}></div>
                  <div>
                    <div className={`font-medium ${event.textColor}`}>{event.name}</div>
                    <div className={`text-xs ${event.textColor} opacity-75`}>{event.start} - {event.end}</div>
                  </div>
                </div>
              </div>
            ))} */}
          </div>
        </div>
    </div>
  )
}

export default AppointmentsBody