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

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`${Backend_URL}/api/patients/${patientId}`,{headers:{'Content-Type':'application/json'},credentials:'include'});
        const data = await response.json();
        setPatientData(data);
        if (data.visits && data.visits.length > 0) {
          setSelectedVisit(data.visits[data.visits.length - 1]._id);
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
console.log(allDates);
console.log(patientData);
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

      <Tabs defaultValue={allDates[0]?.date}>
        <TabsList className="flex space-x-2 overflow-x-auto">
          {allDates.map((item) => (
            <TabsTrigger key={item.date} value={item.date} className="px-4 py-2">
              {item.date}
            </TabsTrigger>
          ))}
        </TabsList>
        {allDates.map((item) => (
          <TabsContent key={item.date} value={item.date}>
            <Card>
              <CardHeader>
                <CardTitle>{item.type === 'visit' ? 'Visit Details' : 'IPD Admission Details'}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.type === 'visit' ? (
                  <div>
                    <p>Date: {item.data?.bookingDate}</p>
                    <p>Booking Number: {item.data?.bookingNumber}</p>
                    <p>Department: {item.data?.department}</p>
                    <p>Doctor: {item.data?.doctor?.name}</p>
                    <p>Reason for Visit: {item.data?.reasonForVisit}</p>
                    <p>Diagnosis: {item.data?.diagnosis}</p>
                    <p>Treatment: {item.data?.treatment}</p>
                  </div>
                ) : (
                  <div>
                    <p>Admission Date: {item.data?.bookingDate}</p>
                    <p>Discharge Date: {item.data?.dateDischarged || 'Not discharged'}</p>
                    <p>Reason for Admission: {item.data?.reasonForAdmission}</p>
                    <p>Assigned Doctor: {item.data?.assignedDoctor?.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
