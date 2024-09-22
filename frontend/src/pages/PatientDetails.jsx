import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Backend_URL } from "../assets/Data";
import { User, Phone, Mail, MapPin, Calendar, Activity, AlertTriangle, FileText, Edit, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-7 mb-4">
          <TabsTrigger value="reason">Reason</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labTests">Lab Tests</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="labReports">Lab Reports</TabsTrigger>
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
              <div className="grid grid-cols-2 gap-4">
                <div><strong>BP:</strong> {visitData.vitals?.bloodPressure}</div>
                <div><strong>Pulse:</strong> {visitData.vitals?.heartRate}</div>
                <div><strong>Temp:</strong> {visitData.vitals?.temperature}</div>
                <div><strong>Weight:</strong> {visitData.vitals?.weight}</div>
                <div><strong>Height:</strong> {visitData.vitals?.height}</div>
                <div><strong>Oxygen Saturation:</strong> {visitData.vitals?.oxygenSaturation}</div>
                <div><strong>Respiration Rate:</strong> {visitData.vitals?.respiratoryRate}</div>
              </div>
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
                visitData.labReports.map((report, index) => {
                  const category = Object.keys(labReportFields).find(key => 
                    labReportFields[key].hasOwnProperty(report.name)
                  );
                  const reportFields = category ? labReportFields[category][report.name] : [];
                  
                  return (
                    <div key={index} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {report.name.replace(/-/g, ' ').toUpperCase()} 
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
                          {reportFields.map((field) => (
                            <TableRow key={field.name}>
                              <TableCell className="font-medium">{field.label}</TableCell>
                              <TableCell>{report.report[field.name] || 'N/A'}</TableCell>
                              <TableCell>{field.unit}</TableCell>
                              <TableCell>{field.normalRange}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })
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

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" alt={patientData.name} />
              <AvatarFallback>{patientData.name}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{patientData.name}</h2>
              <p className="text-sm text-gray-500">ID: {patientData.registrationNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{patientData.age} yrs, {patientData.gender}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span>Blood: {patientData.bloodType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{patientData.contactNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{patientData.email}</span>
            </div>
            <div className="flex items-center space-x-2 col-span-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{patientData.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 mt-4">
        {allDates.map((item) => (
          <Button
            key={item.date}
            variant="outline"
            className={`px-4 py-2 ${selectedVisit === item.date ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setSelectedVisit(item.date)}
          >
            {item.date}
          </Button>
        ))}
      </div>
     
      {renderVisitDetails()}
    </div>
  );
}
