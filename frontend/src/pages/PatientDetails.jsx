import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Backend_URL } from "../assets/Data";
import { User, Phone, Mail, MapPin, Calendar, Activity, AlertTriangle, FileText, Edit, Printer, Heart, Thermometer, Scale, Ruler, Droplet, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { parse, format } from 'date-fns';
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { labReportFields } from '../assets/Data';

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`${Backend_URL}/api/patients/${patientId}`, {headers:{'Content-Type':'application/json'}, credentials:'include'});
        const data = await response.json();
        setPatientData(data);
        console.log(data);
        // Set the most recent visit/admission as the default selected
        const allDates = [
          ...(data.visits || []).map(visit => ({ date: visit.bookingDate, type: 'visit', data: visit })),
          ...(data.admissionDetails || []).map(admission => ({ date: admission.bookingDate, type: 'admission', data: admission }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (allDates.length > 0) {
          setSelectedVisit(allDates[0].date);
          setActiveTab(allDates[0].data.reasonForVisit ? 'reason' : (allDates[0].data.diagnosis ? 'diagnosis' : 'reason'));
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };
    fetchPatientDetails();
  }, [patientId]);

  if (!patientData) return <div>Loading...</div>;

  const allDates = [
    ...(patientData.visits || []).map(visit => ({ date: visit.bookingDate, type: 'visit', data: visit })),
    ...(patientData.admissionDetails || []).map(admission => ({ date: admission.bookingDate, type: 'admission', data: admission }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const selectedItem = allDates.find(item => item.date === selectedVisit);

  const renderVisitDetails = () => {
    if (!selectedVisit || !patientData) return null;

    const visitData = patientData.visits.find(v => v.bookingDate === selectedVisit) || 
                      patientData.admissionDetails.find(a => a.bookingDate === selectedVisit);

    if (!visitData) return null;

    const isIPD = 'admissionDate' in visitData;

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground mb-4">
          <TabsTrigger value="reason" className="px-3">Reason</TabsTrigger>
          <TabsTrigger value="diagnosis" className="px-3">Diagnosis</TabsTrigger>
          <TabsTrigger value="treatment" className="px-3">Treatment</TabsTrigger>
          <TabsTrigger value="medications" className="px-3">Medications</TabsTrigger>
          <TabsTrigger value="labTests" className="px-3">Lab Tests</TabsTrigger>
          <TabsTrigger value="vitals" className="px-3">Vitals</TabsTrigger>
          <TabsTrigger value="labReports" className="px-3">Lab Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="reason">
          <Card>
            <CardHeader>
              <CardTitle>Reason for Visit</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{visitData.reasonForVisit}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{visitData.diagnosis}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="treatment">
          <Card>
            <CardHeader>
              <CardTitle>Treatment</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{visitData.treatment}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {visitData.medications && visitData.medications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitData.medications.map((medication, index) => (
                      <TableRow key={index}>
                        <TableCell>{medication.name}</TableCell>
                        <TableCell>{medication.frequency}</TableCell>
                        <TableCell>{medication.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No medications prescribed.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="labTests">
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
            </CardHeader>
            <CardContent>
              {visitData.labTests && visitData.labTests.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {visitData.labTests.map((test, index) => (
                    <li key={index}>{test}</li>
                  ))}
                </ul>
              ) : (
                <p>No lab tests ordered.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              {isIPD ? (
                <div>
                  <h4 className="font-semibold mb-2">Admission Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <VitalItem
                      icon={<Activity className="h-8 w-8 text-blue-500" />}
                      label="Blood Pressure"
                      value={visitData.vitals?.admission?.bloodPressure}
                      unit="mmHg"
                    />
                    <VitalItem
                      icon={<Heart className="h-8 w-8 text-red-500" />}
                      label="Heart Rate"
                      value={visitData.vitals?.admission?.heartRate}
                      unit="bpm"
                    />
                    <VitalItem
                      icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                      label="Temperature"
                      value={visitData.vitals?.admission?.temperature}
                      unit="°C"
                    />
                    <VitalItem
                      icon={<Scale className="h-8 w-8 text-green-500" />}
                      label="Weight"
                      value={visitData.vitals?.admission?.weight}
                      unit="kg"
                    />
                    <VitalItem
                      icon={<Ruler className="h-8 w-8 text-purple-500" />}
                      label="Height"
                      value={visitData.vitals?.admission?.height}
                      unit="cm"
                    />
                    <VitalItem
                      icon={<Droplet className="h-8 w-8 text-cyan-500" />}
                      label="Oxygen Saturation"
                      value={visitData.vitals?.admission?.oxygenSaturation}
                      unit="%"
                    />
                    <VitalItem
                      icon={<Wind className="h-8 w-8 text-teal-500" />}
                      label="Respiration Rate"
                      value={visitData.vitals?.admission?.respiratoryRate}
                      unit="breaths/min"
                    />
                  </div>
                  <h4 className="font-semibold mb-2">Discharge Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <VitalItem
                      icon={<Activity className="h-8 w-8 text-blue-500" />}
                      label="Blood Pressure"
                      value={visitData.vitals?.discharge?.bloodPressure}
                      unit="mmHg"
                    />
                    <VitalItem
                      icon={<Heart className="h-8 w-8 text-red-500" />}
                      label="Heart Rate"
                      value={visitData.vitals?.discharge?.heartRate}
                      unit="bpm"
                    />
                    <VitalItem
                      icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                      label="Temperature"
                      value={visitData.vitals?.discharge?.temperature}
                      unit="°C"
                    />
                    <VitalItem
                      icon={<Droplet className="h-8 w-8 text-cyan-500" />}
                      label="Oxygen Saturation"
                      value={visitData.vitals?.discharge?.oxygenSaturation}
                      unit="%"
                    />
                    <VitalItem
                      icon={<Wind className="h-8 w-8 text-teal-500" />}
                      label="Respiration Rate"
                      value={visitData.vitals?.discharge?.respiratoryRate}
                      unit="breaths/min"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <VitalItem
                    icon={<Activity className="h-8 w-8 text-blue-500" />}
                    label="Blood Pressure"
                    value={visitData.vitals?.bloodPressure}
                    unit="mmHg"
                  />
                  <VitalItem
                    icon={<Heart className="h-8 w-8 text-red-500" />}
                    label="Heart Rate"
                    value={visitData.vitals?.heartRate}
                    unit="bpm"
                  />
                  <VitalItem
                    icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                    label="Temperature"
                    value={visitData.vitals?.temperature}
                    unit="°C"
                  />
                  <VitalItem
                    icon={<Scale className="h-8 w-8 text-green-500" />}
                    label="Weight"
                    value={visitData.vitals?.weight}
                    unit="kg"
                  />
                  <VitalItem
                    icon={<Ruler className="h-8 w-8 text-purple-500" />}
                    label="Height"
                    value={visitData.vitals?.height}
                    unit="cm"
                  />
                  <VitalItem
                    icon={<Droplet className="h-8 w-8 text-cyan-500" />}
                    label="Oxygen Saturation"
                    value={visitData.vitals?.oxygenSaturation}
                    unit="%"
                  />
                  <VitalItem
                    icon={<Wind className="h-8 w-8 text-teal-500" />}
                    label="Respiration Rate"
                    value={visitData.vitals?.respiratoryRate}
                    unit="breaths/min"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="labReports">
          <Card>
            <CardHeader>
              <CardTitle>Lab Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {visitData.labReports && visitData.labReports.length > 0 ? (
                visitData.labReports.map((report, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {report.name}
                      <span className="text-sm font-normal ml-2 text-gray-500">
                        {report.date ? new Date(report.date).toLocaleDateString("en-IN") : ""}
                      </span>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Normal Range</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(report.report).map(([key, data]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{data.label}</TableCell>
                            <TableCell>{data.value}</TableCell>
                            <TableCell>{data.unit}</TableCell>
                            <TableCell>{data.normalRange}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              ) : (
                <p>No lab reports available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Patient Profile</h1>
        <div className="space-x-2">
          <Button variant="outline" size="sm" className="hover:bg-gray-100">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-gray-100">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="grid md:grid-cols-3 gap-4 p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-14 w-14 ring-2 ring-primary ring-offset-2">
              <AvatarImage src="/placeholder.svg" alt={patientData.name} />
              <AvatarFallback>{patientData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{patientData.name}</h2>
              <p className="text-xs text-gray-500">ID: {patientData.registrationNumber}</p>
              <Badge variant="outline" className="mt-1 text-xs">{patientData.bloodType}</Badge>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <InfoItem icon={<User className="h-4 w-4" />} label="Age & Gender" value={`${patientData.age} yrs, ${patientData.gender}`} />
            <InfoItem icon={<Phone className="h-4 w-4" />} label="Contact" value={patientData.contactNumber} />
            <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={patientData.email} />
          </div>
          <div className="text-sm">
            <InfoItem icon={<MapPin className="h-4 w-4" />} label="Address" value={patientData.address} />
          </div>
        </CardContent>
      </Card>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Visit History</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {allDates.map((item) => (
            <Button
              key={item.date}
              variant={selectedVisit === item.date ? "default" : "outline"}
              size="sm"
              className={`${selectedVisit === item.date ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedVisit(item.date)}
            >
              <span className="mr-1">{format(item.date, 'dd MMM yyyy')}</span>
              <Badge variant="secondary" className="text-xs">
                {item.type === 'visit' ? 'OPD' : 'IPD'}
              </Badge>
            </Button>
          ))}
        </div>
        {renderVisitDetails()}
      </div>
    </div>
  );
}

// New component for info items
function InfoItem({ icon, label, value, className = "" }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="font-medium text-gray-700 text-xs">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}

// New component for individual vital items
const VitalItem = ({ icon, label, value, unit }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
    <div className="mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold">
        {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  </div>
);