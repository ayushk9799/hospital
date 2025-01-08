import React, { useEffect, useState } from "react";
import {
  FileText,
  ArrowLeft,
  Plus,
  Search,
  LogOut,
  Pencil,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";

import {
  fetchAdmittedPatients,
  fetchAdmittedPatientsSearch,
} from "../redux/slices/patientSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { format } from "date-fns";
import CreateServiceBill from "./CreateServiceBill";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";

export default function AdmittedPatients() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const { admittedPatients, admittedPatientsStatus } = useSelector(
  //   (state) => state.patients
  // );
  const [admittedPatients, setAdmittedPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showBilling, setShowBilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAdmittedPatients())
      .unwrap()
      .then((res) => {
        setAdmittedPatients(res);
      });
  }, []);

  const handleDischarge = (patientId, patient) => {
    navigate(`/patients/discharge/${patientId}`, {
      state: { ignoreList: true, dischargeData: patient },
    });
  };

  const handleOpenBill = (patient) => {
    setSelectedPatient({
      patientData: {
        _id: patient._id,
        name: patient.patient.name,
        registrationNumber: patient.patient.registrationNumber,
        ipdNumber: patient.ipdNumber,
        age: patient.patient.age,
        gender: patient.patient.gender,
        contactNumber: patient.patient.contactNumber,
        address: patient.patient.address,
        bookingDate: patient.bookingDate,
        type: "IPD",
      },
      initialBillData: {
        operationName: patient.operationName,

        services: [patient.bills.services[0]] || [],
      },
    });
    setShowBilling(true);
  };

  const handleCloseBill = () => {
    setShowBilling(false);
    setSelectedPatient(null);
    // Refresh admitted patients data
    dispatch(fetchAdmittedPatients());
  };

  const handleAddServices = (patient) => {
    navigate(`/patients/add-services/${patient._id}`, {
      state: {
        patientData: {
          _id: patient._id,
          name: patient.patient.name,
          registrationNumber: patient.patient.registrationNumber,
          ipdNumber: patient.ipdNumber,
          age: patient.patient.age,
          gender: patient.patient.gender,
          contactNumber: patient.patient.contactNumber,
          address: patient.patient.address,
          bookingDate: patient.bookingDate,
          type: "IPD",
        },
        initialBillData: {
          operationName: patient.operationName,
          services: [patient.bills.services[0]] || [],
        },
      },
    });
  };
  const handleSearch = () => {
    if (searchQuery.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }
    dispatch(fetchAdmittedPatientsSearch(searchQuery.trim()))
      .unwrap()
      .then((res) => {
        setAdmittedPatients(res);
      });
  };
  const handleInputChangeSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="">
      {!showBilling ? (
        <Card className="w-full">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex flex-row justify-between items-center gap-2">
              <CardTitle className="text-xl font-bold">
                Admitted Patients
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  {/* Desktop Search */}
                  <div className="hidden sm:block relative">
                    <Input
                      type="text"
                      placeholder="Search by UHID..."
                      value={searchQuery}
                      onChange={handleInputChangeSearch}
                      className="bg-white/90 border-0 pr-8 text-black w-72"
                    />
                    <Search
                      className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
                      onClick={handleSearch}
                    />
                  </div>

                  {/* Mobile Search */}
                  <div className="sm:hidden flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Search by UHID..."
                      value={searchQuery}
                      onChange={handleInputChangeSearch}
                      className="bg-white/90 border-0 pr-8 text-black w-[40px] focus:w-[200px] transition-all duration-300"
                    />
                    <Search
                      className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
                      onClick={handleSearch}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/patients/discharge")}
                  variant="secondary"
                  className="bg-white/90 text-black hover:bg-white/75"
                >
                  <Pencil className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:block">Create Discharge</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[140px]">UHID No.</TableHead>
                      <TableHead className="w-[120px]">IPD No.</TableHead>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="w-[120px]">
                        Admission Date
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Amount (₹)
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Paid (₹)
                      </TableHead>
                      <TableHead className="text-right w-[120px]">
                        Due (₹)
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        Bills
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        Service
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admittedPatients.map((patient) => (
                      <TableRow
                        key={patient._id}
                        className="border-b hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {patient.patient.registrationNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {patient.ipdNumber || "-"}
                        </TableCell>
                        <TableCell>{patient.patient.name}</TableCell>
                        <TableCell>
                          {format(
                            new Date(patient.admissionDate),
                            "dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-bold">
                          {patient.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-bold text-green-600">
                          {patient.amountPaid.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-bold text-red-600">
                          {patient.amountDue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => handleOpenBill(patient)}
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Bills
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          {" "}
                          <Button
                            onClick={() => handleAddServices(patient)}
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Services
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() =>
                              handleDischarge(patient._id, patient)
                            }
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {patient.status === "Discharged"
                              ? "View/Edit Discharge Summary"
                              : "Discharge"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view - shown only on mobile */}
              <div className="block md:hidden">
                {admittedPatients.map((patient) => (
                  <Card key={patient._id} className="mb-2 mx-2">
                    <CardContent className="p-3">
                      <div className="space-y-1.5">
                        {/* Header - Name and Registration */}
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-base">
                            {patient.patient.name}
                          </h3>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>
                              UHID No: {patient.patient.registrationNumber}
                            </div>
                            <div>IPD No: {patient.ipdNumber || "-"}</div>
                          </div>
                        </div>

                        {/* Info Grid - 2 columns */}
                        <div className="grid grid-cols-2 text-xs gap-x-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Admission:
                            </span>
                            <span>
                              {format(
                                new Date(patient.admissionDate),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="font-medium">
                              ₹{patient.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Paid:</span>
                            <span className="font-medium text-green-600">
                              ₹{patient.amountPaid.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due:</span>
                            <span className="font-medium text-red-600">
                              ₹{patient.amountDue.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1.5">
                          <Button
                            onClick={() => handleOpenBill(patient)}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs inline-flex items-center justify-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Bills
                          </Button>

                          <Button
                            onClick={() => handleAddServices(patient)}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs inline-flex items-center justify-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add Services
                          </Button>

                          <Button
                            onClick={() =>
                              handleDischarge(patient._id, patient)
                            }
                            variant="default"
                            size="sm"
                            className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Discharge
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleCloseBill}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admitted Patients
            </Button>
          </div>
          <CreateServiceBill
            isEmbedded={true}
            patientData={{ ...selectedPatient.patientData }}
            initialBillDatas={selectedPatient.initialBillData}
            onClose={handleCloseBill}
          />
        </div>
      )}
    </div>
  );
}
