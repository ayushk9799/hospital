import React from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Pill,
  AlertTriangle,
  FileText,
  Edit,
  Printer,
  Stethoscope,
  Clipboard,
  DollarSign,
  Heart,
  Ruler,
  Weight,
  Thermometer,
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

const patientData = {
  id: "P001",
  name: "John Doe",
  age: 35,
  gender: "Male",
  bloodType: "A+",
  phone: "+1 (555) 123-4567",
  email: "john.doe..example.com",
  address: "123 Main St, Anytown, AN 12345",
  emergencyContact: "Jane Doe (Wife) - +1 (555) 987-6543",
  insuranceProvider: "HealthSure Inc.",
  insuranceNumber: "HS123456789",
  currentDiagnosis: "Hypertension, Type 2 Diabetes",
  vitalSigns: {
    height: "180 cm",
    weight: "85 kg",
    bloodPressure: "130/85 mmHg",
    heartRate: "72 bpm",
    temperature: "36.6°C",
    oxygenSaturation: "98%",
  },
  medicalHistory: [
    {
      condition: "Hypertension",
      diagnosedDate: "2018-03-15",
      status: "Ongoing",
    },
    {
      condition: "Type 2 Diabetes",
      diagnosedDate: "2019-07-22",
      status: "Managed",
    },
  ],
  allergies: ["Penicillin", "Peanuts"],
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
  ],
  appointments: [
    {
      date: "2023-06-15",
      time: "10:00 AM",
      doctor: "Dr. Smith",
      department: "Cardiology",
      status: "Completed",
    },
    {
      date: "2023-07-01",
      time: "2:30 PM",
      doctor: "Dr. Johnson",
      department: "Endocrinology",
      status: "Scheduled",
    },
  ],
  labResults: [
    {
      date: "2023-05-20",
      test: "Complete Blood Count",
      result: "Normal",
      doctor: "Dr. Brown",
    },
    {
      date: "2023-05-20",
      test: "Lipid Panel",
      result: "High Cholesterol",
      doctor: "Dr. Brown",
    },
  ],
  bills: [
    {
      date: "2023-06-15",
      description: "Cardiology Consultation",
      amount: 150,
      status: "Paid",
    },
    {
      date: "2023-05-20",
      description: "Laboratory Tests",
      amount: 200,
      status: "Pending",
    },
  ],
  doctorNotes: [
    {
      date: "2023-06-15",
      doctor: "Dr. Smith",
      note: "Patients blood pressure is still high. Increasing Lisinopril dosage to 20mg daily.",
    },
    {
      date: "2023-05-01",
      doctor: "Dr. Johnson",
      note: "Diabetes is well-managed. Continue current treatment plan.",
    },
  ],
  nurseNotes: [
    {
      date: "2023-06-15",
      nurse: "Nurse Williams",
      note: "Patient reported feeling dizzy this morning. Monitored blood pressure throughout the day.",
    },
    {
      date: "2023-05-01",
      nurse: "Nurse Davis",
      note: "Administered scheduled medications. Patient is compliant with treatment.",
    },
  ],
};

export default function PatientDetails() {
  return (
    <div className="container p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Profile</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            {/* <CardTitle>Personal Information</CardTitle> */}
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src="/placeholder.svg?height=64&width=64"
                  alt={patientData.name}
                />
                <AvatarFallback>
                  {patientData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold">{patientData.name}</h2>
                <p className="text-sm text-gray-500">ID: {patientData.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3 text-gray-500" />
                <span>{patientData.age} yrs, {patientData.gender}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-gray-500" />
                <span>Blood: {patientData.bloodType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-gray-500" />
                <span>{patientData.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-gray-500" />
                <span>{patientData.email}</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <MapPin className="h-3 w-3 text-gray-500" />
                <span>{patientData.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{patientData.emergencyContact}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{patientData.currentDiagnosis}</p>
          </CardContent>
        </Card>
      </div>

     <div className="grid grid-cols-3 gap-4">
     <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex flex-col items-center">
              <Ruler className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">Height</span>
              <span className="font-semibold">
                {patientData.vitalSigns.height}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Weight className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">Weight</span>
              <span className="font-semibold">
                {patientData.vitalSigns.weight}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Activity className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">Blood Pressure</span>
              <span className="font-semibold">
                {patientData.vitalSigns.bloodPressure}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">Heart Rate</span>
              <span className="font-semibold">
                {patientData.vitalSigns.heartRate}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Thermometer className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">Temperature</span>
              <span className="font-semibold">
                {patientData.vitalSigns.temperature}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Activity className="h-8 w-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-500">O2 Saturation</span>
              <span className="font-semibold">
                {patientData.vitalSigns.oxygenSaturation}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card >
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Provider:</p>
            <p>{patientData.insuranceProvider}</p>
          </div>
          <div>
            <p className="font-semibold">Policy Number:</p>
            <p>{patientData.insuranceNumber}</p>
          </div>
        </CardContent>
      </Card>
     </div>

      <Tabs defaultValue="medical-history" className="w-full">
        <TabsList>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="doctor-notes">Doctor Notes</TabsTrigger>
          <TabsTrigger value="nurse-notes">Nurse Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="medical-history">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>
                Patient's medical conditions and allergies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Conditions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Condition</TableHead>
                        <TableHead>Diagnosed Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientData.medicalHistory.map((condition, index) => (
                        <TableRow key={index}>
                          <TableCell>{condition.condition}</TableCell>
                          <TableCell>{condition.diagnosedDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                condition.status === "Ongoing"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {condition.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Allergies</h3>
                  <div className="flex flex-wrap gap-2">
                    {patientData.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline">
                        <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
              <CardDescription>
                Medications the patient is currently taking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientData.medications.map((medication, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {medication.name}
                      </TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>{medication.frequency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Past and upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientData.appointments.map((appointment, index) => (
                    <TableRow key={index}>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.doctor}</TableCell>
                      <TableCell>{appointment.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "Completed"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule New Appointment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="lab-results">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>Recent laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Doctor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientData.labResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.date}</TableCell>
                      <TableCell>{result.test}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            result.result === "Normal"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {result.result}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.doctor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Full Lab Reports
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>Bills</CardTitle>
              <CardDescription>Patient's billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientData.bills.map((bill, index) => (
                    <TableRow key={index}>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>{bill.description}</TableCell>
                      <TableCell>${bill.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bill.status === "Paid" ? "secondary" : "default"
                          }
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                View All Bills
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="doctor-notes">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Notes</CardTitle>
              <CardDescription>Notes from doctor consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.doctorNotes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{note.doctor}</span>
                      <span className="text-sm text-gray-500">{note.date}</span>
                    </div>
                    <p>{note.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Stethoscope className="mr-2 h-4 w-4" />
                Add Doctor Note
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="nurse-notes">
          <Card>
            <CardHeader>
              <CardTitle>Nurse Notes</CardTitle>
              <CardDescription>Notes from nursing staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.nurseNotes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{note.nurse}</span>
                      <span className="text-sm text-gray-500">{note.date}</span>
                    </div>
                    <p>{note.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Clipboard className="mr-2 h-4 w-4" />
                Add Nurse Note
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
