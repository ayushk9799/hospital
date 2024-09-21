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
  DollarSign,
  Building,
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
  id: "66ea972e8317a263bc18aa37",
  name: "Raviket",
  role: "Admin",
  department: "Oncology",
  email: "america@gmail.com",
  phone: "", // Not provided in the data
  status: "Active", // Assuming active since there's no status field
  joinDate: "2019-02-18",
  shift: {
    type: "Morning",
    hours: {
      start: "09:31",
      end: "14:31"
    }
  },
  education: [], // Using qualifications, but it's empty in the provided data
  certifications: [], // Empty in the provided data
  schedule: [], // Not provided in the data
  recentPatients: [], // Using currentPatients, but it's empty in the provided data
  employeeID: "123455",
  username: "iam_ayush691",
  yearsOfExperience: 5,
  address: "DM residence road ,banka-813102 ,Bihar",
  dateOfBirth: "2019-02-18",
  gender: "Male",
  salary: 50000,
  payrollInfo: {
    bankName: "bank of india",
    accountNumber: "123455234543",
    ifscCode: "12343234"
  }
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
                <User className="h-4 w-4 text-gray-500" />
                <span>{staffMember.username}</span>
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
              <Badge variant="default">
                {staffMember.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Shift:</span>
              <span>{staffMember.shift.type}</span>
            </div>
            <div className="flex align-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Time In:</span>
                <span>{staffMember.shift.hours.start}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-semibold">Time Out:</span>
                <span>{staffMember.shift.hours.end}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Employee Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Employee ID:</span>
              <span>{staffMember.employeeID}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Experience:</span>
              <span>{staffMember.yearsOfExperience} years</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Info</TabsTrigger>
            <TabsTrigger value="education">Education & Certifications</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Date of Birth:</span>
                    <span>{staffMember.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Gender:</span>
                    <span>{staffMember.gender}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Building className="h-4 w-4 text-gray-500 mt-1" />
                    <span className="font-semibold">Address:</span>
                    <span>{staffMember.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Salary:</span>
                    <span>₹{staffMember.salary}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Bank Name:</span>
                    <span>{staffMember.payrollInfo.bankName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">Account Number:</span>
                    <span>{staffMember.payrollInfo.accountNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">IFSC Code:</span>
                    <span>{staffMember.payrollInfo.ifscCode}</span>
                  </div>
                </div>
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
                    {staffMember.education.length > 0 ? (
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
                    ) : (
                      <p>No education information available.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Certifications
                    </h3>
                    {staffMember.certifications.length > 0 ? (
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
                    ) : (
                      <p>No certification information available.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <StaffMonthlyCalender />
      </div>
    </div>
  );
}
