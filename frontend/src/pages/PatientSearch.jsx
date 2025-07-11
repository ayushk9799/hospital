import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  UserPlus,
  FileText,
  Bed,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import OPDRegDialog from "../components/custom/registration/OPDRegDialog";
import IPDRegDialog from "../components/custom/registration/IPDRegDialog";
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { searchPatients } from "../redux/slices/patientSlice";
import OPDProcedureDialog from "../components/custom/procedures/OPDProcedureDialog";

export default function PatientSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResultsData = location.state?.searchResults || {};
  const patients = searchResultsData.patients || [];
  const totalPatients = searchResultsData.totalPatients || 0;
  const currentPage = searchResultsData.currentPage || 1;
  const totalPages = searchResultsData.totalPages || 1;

  const searchQuery = location.state?.searchQuery || "";
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isOPDRegDialogOpen, setIsOPDRegDialogOpen] = useState(false);
  const [selectedPatientForFollowUp, setSelectedPatientForFollowUp] =
    useState(null);
  const [isIPDRegDialogOpen, setIsIPDRegDialogOpen] = useState(false);
  const [isOPDProcedureDialogOpen, setIsOPDProcedureDialogOpen] =
    useState(false);
  const [patientDataForProcedureDialog, setPatientDataForProcedureDialog] =
    useState(null);

  const dispatch = useDispatch();

  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (patients.length === 1) {
      setSelectedPatient(patients[0]);
    } else {
      setSelectedPatient(null);
    }
  }, [patients]);

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && searchQuery) {
      try {
        const limit = 10; // Assuming a default limit of 10, matches backend and thunk
        const resultAction = await dispatch(
          searchPatients({ searchQuery:searchQuery.trim(), page: newPage, limit })
        );

        if (searchPatients.fulfilled.match(resultAction)) {
          const { results } = resultAction.payload;
          // The thunk now returns a structure like: { results: { patients, totalPatients, currentPage, totalPages }, searchQuery, ... }
          // We need to ensure `navigate` receives the searchResults in the expected format.
          navigate(location.pathname, {
            state: {
              searchResults: results, // This should be { patients, totalPatients, currentPage, totalPages }
              searchQuery: searchQuery,
            },
          });
        } else {
          // Handle rejected case if needed, e.g., show a toast
          console.error(
            "Failed to fetch new page:",
            resultAction.payload || resultAction.error
          );
          // Optionally, add user-facing error handling here
        }
      } catch (error) {
        console.error("Error dispatching searchPatients:", error);
        // Optionally, add user-facing error handling here
      }
    }
  };

  const actions = [
    {
      name: "View / Edit",
      icon: Eye,
      action: () => navigate(`/patient-overview/${selectedPatient._id}`),
    },
    {
      name: "OPD Follow Up",
      icon: UserPlus,
      action: () => {
        setSelectedPatientForFollowUp({
          name: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          address: selectedPatient.address,
          contactNumber: selectedPatient.contactNumber,
          registrationNumber: selectedPatient.registrationNumber,
          lastVisit: selectedPatient.lastVisit,
          lastVisitType: selectedPatient.lastVisitType,
          visits: selectedPatient.visits,
          admissionDetails: selectedPatient.admissionDetails,
          _id: selectedPatient._id,
        });
        setIsOPDRegDialogOpen(true);
      },
    },
    { name: "IPD", icon: Bed, action: () => setIsIPDRegDialogOpen(true) },
    {
      name: "OPD Procedure",
      icon: FileText,
      action: () => {
        setPatientDataForProcedureDialog({
          name: selectedPatient.name,
          registrationNumber: selectedPatient.registrationNumber,
          gender: selectedPatient.gender,
          age: selectedPatient.age,
          contactNumber: selectedPatient.contactNumber,
          address: selectedPatient.address,
          _id: selectedPatient._id,
        });
        setIsOPDProcedureDialogOpen(true);
      },
    }
  ];

  const getLatestDate = (patient) => {
    if (patient.lastVisit) {
      return format(parseISO(patient.lastVisit), "dd-MM-yyyy");
    }
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

  const PatientCard = ({ patient }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold capitalize mr-2">
                {patient.name}
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={action.name}
                    onSelect={() => action.action(patient)}
                  >
                    {action.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground">
            Reg: {patient.registrationNumber}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground">Last Visit:</p>
              <p className="text-sm font-medium">{getLatestDate(patient)}</p>
            </div>
            {patient.lastVisitType && (
              <div className="flex gap-2 items-center">
                <p className="text-sm text-muted-foreground">Visit Type:</p>
                <p className="text-sm font-medium">{patient.lastVisitType}</p>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground">Age:</p>
              <p className="text-sm font-medium">{patient.age}</p>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground">Mobile:</p>
              <p className="text-sm font-medium">{patient.contactNumber}</p>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground">Gender:</p>
              <p className="text-sm font-medium">{patient.gender}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Search Results for: {searchQuery}</CardTitle>
          <CardDescription>
            Displaying {patients.length} of {totalPatients} Registered patients
            found. Page {currentPage} of {totalPages}.
          </CardDescription>
        </div>
        {patients.length > 0 && totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching with a different query
            </p>
          </div>
        ) : (
          <>
            {isSmallScreen ? (
              <div>
                {patients.map((patient) => (
                  <PatientCard key={patient._id} patient={patient} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S No.</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Last Visit Type</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient, index) => (
                      <TableRow
                        key={patient._id}
                        className={`cursor-pointer ${
                          selectedPatient?._id === patient._id
                            ? "bg-blue-100 hover:bg-blue-200"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {patient.name}
                        </TableCell>
                        <TableCell>{patient.registrationNumber}</TableCell>
                        <TableCell>{getLatestDate(patient)}</TableCell>
                        <TableCell>{patient.lastVisitType || "-"}</TableCell>
                        <TableCell>{patient.address || "-"}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.contactNumber}</TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action) => (
                                <DropdownMenuItem
                                  key={action.name}
                                  onSelect={() => action.action(patient)}
                                >
                                  {action.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedPatient && !isSmallScreen && (
              <>
                <Card className="mt-4">
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
                        <h2 className="font-semibold">
                          {selectedPatient.name}
                        </h2>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {selectedPatient.gender}
                          </Badge>
                          <Badge variant="outline">
                            {selectedPatient.age} years
                          </Badge>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {actions.map((action) => (
                    <Button
                      key={action.name}
                      variant="outline"
                      className="flex items-center justify-start space-x-2 h-16"
                      onClick={() => action.action(selectedPatient)}
                    >
                      <action.icon className="w-6 h-6" />
                      <span>{action.name}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}
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

        <OPDProcedureDialog
          open={isOPDProcedureDialogOpen}
          onOpenChange={setIsOPDProcedureDialogOpen}
          initialPatientData={patientDataForProcedureDialog}
        />
      </CardContent>
    </Card>
  );
}
