import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Eye, Calendar, UserPlus, FileText, Heart, Bed, FileCheck, Stethoscope, Wallet, Pill, Package, Sticker } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react"
import { format } from "date-fns"

export default function PatientSearch() {   
  const patients = [
    { id: 1, name: "Shivam Mishra", regId: "134", regDate: "Dec 12, 2022, 7:05:49 PM", city: "-", age: 7, gender: "M", mobile: "9999999999", status: "OP" },
    { id: 2, name: "Arun", regId: "397", regDate: "Sep 7, 2023, 1:35:07 PM", city: "-", age: 5, gender: "M", mobile: "9999999999", status: "OP" },
    { id: 3, name: "AJAY", regId: "635", regDate: "Feb 5, 2024, 10:42:23 AM", city: "-", age: 32, gender: "M", mobile: "9999999999", status: "OP" },
    { id: 4, name: "rajesh", regId: "920", regDate: "May 9, 2024, 12:50:32 PM", city: "-", age: 0, gender: "M", mobile: "9999999999", status: "OP" },
    { id: 5, name: "abir", regId: "921", regDate: "May 9, 2024, 12:59:25 PM", city: "-", age: 4, gender: "M", mobile: "9899999999", status: "OP" },
  ]

  const actions = [
    { name: "View / Edit", icon: Eye },
    { name: "Follow Up", icon: UserPlus },
    { name: "Admission", icon: Bed },
    { name: "Service", icon: FileText },
    { name: "Time Slot Booking", icon: Calendar },
    { name: "EHR - General", icon: Heart },
    { name: "OT Booking", icon: Stethoscope },
    { name: "Pharmacy Sales", icon: Pill },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-secondary p-4 rounded-lg">
        <h2 className="font-semibold">For detailed information, please click on the Patient name from the list below</h2>
        <p>5 Registered patients for 9999999</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S No.</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Reg.ID</TableHead>
              <TableHead>Reg.Date</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.regId}</TableCell>
                <TableCell>{patient.regDate}</TableCell>
                <TableCell>{patient.city}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.mobile}</TableCell>
                <TableCell>{patient.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patients[0].name}`} alt={patients[0].name} />
              <AvatarFallback>{patients[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{patients[0].name}</h2>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{patients[0].gender}</Badge>
                <Badge variant="outline">{patients[0].age} years</Badge>
                {/* Add blood group badge if available */}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>{format(new Date(patients[0].regDate), "MMM dd, hh:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{patients[0].mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Reg:{patients[0].regId}</span>
            </div>
            {patients[0].city !== "-" && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{patients[0].city}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant="outline"
            className="flex items-center justify-start space-x-2 h-16"
          >
            <action.icon className="w-6 h-6" />
            <span>{action.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
