import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
  Eye,
  Calendar,
  UserPlus,
  FileText,
  Heart,
  Bed,
  Stethoscope,
  Pill,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import OPDRegDialog from "../components/custom/registration/OPDRegDialog";
import IPDRegDialog from "../components/custom/registration/IPDRegDialog";

export default function PatientSearch() {
  const location = useLocation();
  const { searchQuery } = useParams();
  const navigate = useNavigate();
  const patients = location.state?.searchResults || [];
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isOPDRegDialogOpen, setIsOPDRegDialogOpen] = useState(false);
  const [selectedPatientForFollowUp, setSelectedPatientForFollowUp] =
    useState(null);
  const [isIPDRegDialogOpen, setIsIPDRegDialogOpen] = useState(false);

  useEffect(() => {
    if (patients.length > 0) {
      setSelectedPatient(patients[0]);
    }
  }, [patients]);

  const actions = [
    {
      name: "View / Edit",
      icon: Eye,
      action: () => navigate(`/patients/${selectedPatient._id}`),
    },
    {
      name: "OPD Follow Up",
      icon: UserPlus,
      action: () => {
        setSelectedPatientForFollowUp({
          name: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          contactNumber: selectedPatient.contactNumber,
          registrationNumber: selectedPatient.registrationNumber,
          _id: selectedPatient._id,
        });
        setIsOPDRegDialogOpen(true);
      },
    },
    { name: "IPD", icon: Bed, action: () => setIsIPDRegDialogOpen(true) },
    { 
      name: "Service", 
      icon: FileText, 
      action: () => navigate(`/opd-procedure/${selectedPatient._id}`, { state: { patient: selectedPatient } })
    },
    { name: "Time Slot Booking", icon: Calendar },
    { name: "EHR - General", icon: Heart },
    { name: "OT Booking", icon: Stethoscope },
    { name: "Pharmacy Sales", icon: Pill },
  ];

  const getLatestDate = (patient) => {
    const dates = [
      ...(patient.visits || []).map((visit) => parseISO(visit.bookingDate)),
      ...(patient.admissionDetails || []).map((admission) =>
        parseISO(admission.bookingDate)
      ),
    ];
    return dates.length > 0
      ? format(new Date(Math.max(...dates)), "dd-MM-yyyy")
      : "-";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-secondary p-4 rounded-lg">
        <h2 className="font-semibold">Search Results for: {searchQuery}</h2>
        <p>{patients.length} Registered patients found</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S No.</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Registration Number</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient, index) => (
              <TableRow
                key={patient._id}
                className={`cursor-pointer ${
                  selectedPatient?._id === patient._id ? "bg-blue-100" : ""
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.registrationNumber}</TableCell>
                <TableCell>{getLatestDate(patient)}</TableCell>
                <TableCell>{patient.address?.city || "-"}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.contactNumber}</TableCell>
                <TableCell>{patient.status || "OP"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPatient && (
        <>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedPatient.name}`}
                    alt={selectedPatient.name}
                  />
                  <AvatarFallback>
                    {selectedPatient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{selectedPatient.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{selectedPatient.gender}</Badge>
                    <Badge variant="outline">{selectedPatient.age} years</Badge>
                    {selectedPatient.bloodGroup && (
                      <Badge variant="outline">
                        {selectedPatient.bloodGroup}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>
                    {format(
                      new Date(selectedPatient.createdAt),
                      "MMM dd, hh:mm a"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedPatient.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>Reg:{selectedPatient.registrationNumber}</span>
                </div>
                {selectedPatient.address?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedPatient.address.city}</span>
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
                onClick={action.action}
              >
                <action.icon className="w-6 h-6" />
                <span>{action.name}</span>
              </Button>
            ))}
          </div>
        </>
      )}

      <OPDRegDialog
        open={isOPDRegDialogOpen}
        onOpenChange={setIsOPDRegDialogOpen}
        patientData={selectedPatientForFollowUp}
      />

      <IPDRegDialog
        open={isIPDRegDialogOpen}
        onOpenChange={setIsIPDRegDialogOpen}
        patientData={selectedPatient}
      />
    </div>
  );
}
