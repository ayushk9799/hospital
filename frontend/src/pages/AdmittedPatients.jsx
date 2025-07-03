import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Baby,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import {
  fetchAdmittedPatients,
  fetchAdmittedPatientsSearch,
  fetchDischargedPatientsByDate,
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
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { formatCurrency } from "../assets/Data";

export default function AdmittedPatients() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admittedPatientsStatus } = useSelector((state) => state.patients);
  const [admittedPatients, setAdmittedPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showBilling, setShowBilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const savedConfig = useSelector(
    (state) => state.templates.dischargeFormTemplateArray
  );
  const oldConfig = useSelector(
    (state) => state.templates.dischargeFormTemplates
  );

  useEffect(() => {
    dispatch(fetchAdmittedPatients())
      .unwrap()
      .then((res) => {
        setAdmittedPatients(res);
      });
  }, []);

  const getRelevantTemplates = (patient) => {
    // If patient is discharged, only return their formConfig
    if (patient.status === "Discharged" && patient.formConfig) {
      return [patient.formConfig];
    }

    // For non-discharged patients, return relevant templates
    return (
      savedConfig?.filter((template) => {
        const isDefault = template.isDefault;
        const doctorIds =
          template.associatedDoctors?.map((doc) => doc._id?.toString()) || [];
        const patientDoctorId = patient.assignedDoctor._id?.toString();
        return isDefault || doctorIds.includes(patientDoctorId);
      }) || []
    );
  };

  const handleDischarge = (patientId, patient, id) => {
    // Get relevant templates based on patient's assigned doctor
    const relevantTemplates = getRelevantTemplates(patient);

    // If id is provided, find that specific template, otherwise use first relevant template
    const selectedTemplate = id
      ? relevantTemplates?.find((t) => t._id === id)
      : relevantTemplates?.[0] || oldConfig;
    navigate(`/patients/discharge/${patientId}`, {
      state: {
        ignoreList: true,
        dischargeData: patient,
        selectedTemplate: selectedTemplate || null,
      },
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
        admissionDate: patient.dischargeData?.admissionDate || patient.bookingDate,
        dischargeDate: patient.dischargeData?.dateDischarged,
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

  const handleDateSearch = () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    dispatch(fetchDischargedPatientsByDate(date))
      .unwrap()
      .then((res) => {
        setAdmittedPatients(res);
        setCalendarOpen(false);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "getting server error",
          variant: "destructive",
        });
      })
      .finally(() => {});
  };

  return (
    <div className="">
      {!showBilling ? (
        <Card className="w-full">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="h-6 w-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <CardTitle className="text-xl font-bold">
                  Admitted Patients
                </CardTitle>
              </div>

              {/* Mobile View */}
              <div className="flex flex-row items-center gap-2 w-full sm:hidden">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search by UHID..."
                    value={searchQuery}
                    onChange={handleInputChangeSearch}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-white/90 border-0 pr-8 text-black w-full"
                  />
                  <Search
                    className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
                    onClick={handleSearch}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white text-black hover:bg-white/75"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="end">
                    <div className="flex flex-col gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date
                              ? format(date, "PPP")
                              : "Date wise discharged"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                          <div className="p-2 border-t">
                            <Button
                              className="w-full"
                              onClick={handleDateSearch}
                            >
                              Search
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        onClick={() => navigate("/patients/discharge")}
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Create Discharge
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Desktop View */}
              <div className="hidden sm:flex flex-row items-center gap-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search by UHID..."
                    value={searchQuery}
                    onChange={handleInputChangeSearch}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-white/90 border-0 pr-8 text-black w-72"
                  />
                  <Search
                    className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
                    onClick={handleSearch}
                  />
                </div>

                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "bg-white text-black hover:bg-white/75 w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Date wise discharged"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                    <div className="p-2 border-t">
                      <Button className="w-full" onClick={handleDateSearch}>
                        Search
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={() => navigate("/patients/discharge")}
                  variant="secondary"
                  className="bg-white text-black hover:bg-white"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Create Discharge
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              {admittedPatientsStatus === "loading" ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <span className="text-muted-foreground">
                    Loading patients...
                  </span>
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[140px]">UHID No.</TableHead>
                          <TableHead className="w-[120px]">IPD No.</TableHead>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="w-[150px]">
                            Operation Name
                          </TableHead>
                          <TableHead className="w-[120px]">
                            Admission Date
                          </TableHead>
                          <TableHead className="text-right w-[100px]">
                            Amount (₹)
                          </TableHead>
                          <TableHead className="text-right w-[120px]">
                            Paid (₹)
                          </TableHead>
                          <TableHead className="text-right w-[120px]">
                            Due (₹)
                          </TableHead>
                          <TableHead className="text-center w-[120px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admittedPatients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <span>No admitted patients found</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          admittedPatients.map((patient) => (
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
                                {patient?.operationName?.length > 20
                                  ? `${patient.operationName.substring(
                                      0,
                                      20
                                    )}...`
                                  : patient?.operationName}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(patient.admissionDate),
                                  "dd/MM/yyyy"
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-bold">
                                {formatCurrency(patient.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-bold text-green-600">
                                {formatCurrency(patient.amountPaid)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-bold text-red-600">
                                {formatCurrency(patient.amountDue)}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex gap-2 justify-end pr-4">
                                  {patient.department
                                    ?.toLowerCase()
                                    .includes("obstetric") &&
                                    patient?.patient?.gender?.toLowerCase() ===
                                      "female" && (
                                      <>
                                        <Button
                                          onClick={() =>
                                            navigate(
                                              `/patients/${patient._id}/babies`,
                                              {
                                                state: {
                                                  motherData: {
                                                    ...patient.patient,
                                                    bookingDate:
                                                      patient.bookingDate,
                                                    bookingTime:
                                                      patient.bookingTime,
                                                  },
                                                },
                                              }
                                            )
                                          }
                                          variant="outline"
                                          size="sm"
                                          className="border-pink-200 hover:border-pink-300 hover:bg-pink-50 inline-flex items-center gap-1"
                                        >
                                          <Baby className="h-4 w-4 text-pink-500" />
                                        </Button>
                                      </>
                                    )}
                                  <Button
                                    onClick={() => handleOpenBill(patient)}
                                    variant="outline"
                                    size="sm"
                                    className="inline-flex items-center"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Bills
                                  </Button>

                                  {(() => {
                                    const relevantTemplates =
                                      getRelevantTemplates(patient);

                                    if (relevantTemplates.length === 0) {
                                      return (
                                        <Button
                                          onClick={() =>
                                            handleDischarge(
                                              patient._id,
                                              patient
                                            )
                                          }
                                          variant="default"
                                          size="sm"
                                          className=" h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          {patient.status === "Discharged"
                                            ? "View/Edit"
                                            : "Discharge"}
                                        </Button>
                                      );
                                    }

                                    if (relevantTemplates.length === 1) {
                                      return (
                                        <Button
                                          onClick={() =>
                                            handleDischarge(
                                              patient._id,
                                              patient,
                                              relevantTemplates[0]._id
                                            )
                                          }
                                          variant="default"
                                          size="sm"
                                          className=" h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          {patient.status === "Discharged"
                                            ? "View/Edit"
                                            : "Discharge"}
                                        </Button>
                                      );
                                    }

                                    return (
                                      <Select
                                        onValueChange={(id) =>
                                          handleDischarge(
                                            patient._id,
                                            patient,
                                            id
                                          )
                                        }
                                      >
                                        <SelectTrigger className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8">
                                          <SelectValue placeholder="Discharge" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {relevantTemplates.map((template) => (
                                            <SelectItem
                                              key={template._id}
                                              value={template._id}
                                            >
                                              {template.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    );
                                  })()}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile view - shown only on mobile */}
                  <div className="block md:hidden px-2 py-1">
                    {admittedPatients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground m-4">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <span>No admitted patients found</span>
                      </div>
                    ) : (
                      admittedPatients.map((patient) => (
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
                                    UHID No:{" "}
                                    {patient.patient.registrationNumber}
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
                                    {formatCurrency(patient.totalAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Paid:
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(patient.amountPaid)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Due:
                                  </span>
                                  <span className="font-medium text-red-600">
                                    {formatCurrency(patient.amountDue)}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-1.5">
                                {patient.department
                                  ?.toLowerCase()
                                  .includes("obstetric") &&
                                  patient?.patient?.gender?.toLowerCase() ===
                                    "female" && (
                                    <Button
                                      onClick={() =>
                                        navigate(
                                          `/patients/${patient._id}/babies`,
                                          {
                                            state: {
                                              motherData: {
                                                ...patient.patient,
                                                bookingDate:
                                                  patient?.bookingDate,
                                                bookingTime:
                                                  patient?.bookingTime,
                                              },
                                            },
                                          }
                                        )
                                      }
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 min-w-[120px] h-8 text-xs border-pink-200 hover:border-pink-300 hover:bg-pink-50 inline-flex items-center justify-center gap-1"
                                    >
                                      <Baby className="h-3 w-3 text-pink-500" />
                                      Babies
                                    </Button>
                                  )}

                                <Button
                                  onClick={() => handleOpenBill(patient)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 min-w-[120px] h-8 text-xs inline-flex items-center justify-center gap-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  Bills
                                </Button>

                                <Button
                                  onClick={() => handleAddServices(patient)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 min-w-[120px] h-8 text-xs inline-flex items-center justify-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Services
                                </Button>

                                {(() => {
                                  const relevantTemplates =
                                    getRelevantTemplates(patient);

                                  if (relevantTemplates.length === 0) {
                                    return (
                                      <Button
                                        onClick={() =>
                                          handleDischarge(patient._id, patient)
                                        }
                                        variant="default"
                                        size="sm"
                                        className="  h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        {patient.status === "Discharged"
                                          ? "View/Edit"
                                          : "Discharge"}
                                      </Button>
                                    );
                                  }

                                  if (relevantTemplates.length === 1) {
                                    return (
                                      <Button
                                        onClick={() =>
                                          handleDischarge(
                                            patient._id,
                                            patient,
                                            relevantTemplates[0]._id
                                          )
                                        }
                                        variant="default"
                                        size="sm"
                                        className="  h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        {patient.status === "Discharged"
                                          ? "View/Edit"
                                          : "Discharge"}
                                      </Button>
                                    );
                                  }

                                  return (
                                    <Select
                                      onValueChange={(id) =>
                                        handleDischarge(
                                          patient._id,
                                          patient,
                                          id
                                        )
                                      }
                                    >
                                      <SelectTrigger className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8">
                                        <SelectValue placeholder="Discharge" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {relevantTemplates.map((template) => (
                                          <SelectItem
                                            key={template._id}
                                            value={template._id}
                                          >
                                            {template.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  );
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
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
