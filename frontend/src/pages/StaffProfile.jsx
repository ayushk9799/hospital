import React from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Stethoscope,
  FileText,
  Edit,
  Printer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import StaffMonthlyCalender from "../components/custom/staff/StaffMonthlyCalender";

const staffMember = {
  id: 1,
  name: "Dr. John Smith",
  role: "Senior Cardiologist",
  department: "Cardiology",
  email: "john.smith..hospital.com",
  phone: "+1 (555) 123-4567",
  status: "Active",
  joinDate: "2015-03-15",
  shift: "Day",
  education: [
    { degree: "MD", institution: "Harvard Medical School", year: "2005" },
    {
      degree: "Residency in Internal Medicine",
      institution: "Massachusetts General Hospital",
      year: "2008",
    },
    {
      degree: "Fellowship in Cardiology",
      institution: "Johns Hopkins Hospital",
      year: "2011",
    },
  ],
  certifications: [
    { name: "Board Certified in Cardiovascular Disease", year: "2012" },
    { name: "Advanced Cardiac Life Support (ACLS)", year: "2021" },
  ],
  schedule: [
    { day: "Monday", hours: "8:00 AM - 5:00 PM" },
    { day: "Tuesday", hours: "8:00 AM - 5:00 PM" },
    { day: "Wednesday", hours: "8:00 AM - 12:00 PM" },
    { day: "Thursday", hours: "8:00 AM - 5:00 PM" },
    { day: "Friday", hours: "8:00 AM - 5:00 PM" },
  ],
  recentPatients: [
    {
      id: "P001",
      name: "Alice Johnson",
      date: "2023-06-15",
      diagnosis: "Hypertension",
    },
    {
      id: "P002",
      name: "Bob Williams",
      date: "2023-06-14",
      diagnosis: "Arrhythmia",
    },
    {
      id: "P003",
      name: "Carol Davis",
      date: "2023-06-13",
      diagnosis: "Coronary Artery Disease",
    },
  ],
};

export default function StaffProfile() {
  return (
    <div className="div space-y-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Profile</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            {/* <CardTitle>Personal Information</CardTitle> */}
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src="/placeholder.svg?height=64&width=64"
                  alt={staffMember.name}
                />
                <AvatarFallback>
                  {staffMember.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {staffMember.name}
                </h2>
                <p className="text-gray-500">{staffMember.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{staffMember.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{staffMember.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span>{staffMember.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Joined on {staffMember.joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Status:</span>
              <Badge
                variant={
                  staffMember.status === "Active" ? "default" : "secondary"
                }
              >
                {staffMember.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Shift:</span>
              <span>{staffMember.shift}</span>
            </div>
            <div className="flex align-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Time In:</span>
                <span>9:00 AM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-semibold">Time Out:</span>
                <span>5:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Future Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Status:</span>
              <span>Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="education">
              Education & Certifications
            </TabsTrigger>
            <TabsTrigger value="patients">Recent Patients</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Dr. Smith's regular working hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMember.schedule.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{day.day}</TableCell>
                        <TableCell>{day.hours}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education & Certifications</CardTitle>
                <CardDescription>
                  Academic background and professional certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Education</h3>
                    <ul className="space-y-2">
                      {staffMember.education.map((edu, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-sm text-gray-600">
                              {edu.institution}, {edu.year}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Certifications
                    </h3>
                    <ul className="space-y-2">
                      {staffMember.certifications.map((cert, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Award className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-gray-600">
                              Obtained in {cert.year}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>
                  Patients seen in the last few days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Diagnosis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMember.recentPatients.map((patient, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {patient.id}
                        </TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.date}</TableCell>
                        <TableCell>{patient.diagnosis}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Patient List
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <StaffMonthlyCalender />
      </div>
    </div>
  );
}
