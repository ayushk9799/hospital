import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStaffMembers } from "../redux/slices/staffSlice";
import {
  fetchConsultationFees,
  updateConsultationFee,
  updateConsultationTypes,
} from "../redux/slices/consultationFeeSlice";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { Plus, X, Settings2, IndianRupee } from "lucide-react";
import { cn } from "../lib/utils";

const ConsultationFees = () => {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.staff);
  const { doctorWiseFee, consultationTypes, status } = useSelector(
    (state) => state.consultationFees
  );
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const { toast } = useToast();
  const [newConsultationType, setNewConsultationType] = useState("");
  const [feeInputs, setFeeInputs] = useState({});
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [followUpSettings, setFollowUpSettings] = useState({
    followUpDateWithin: 14,
  });
  const [showFollowUpSettings, setShowFollowUpSettings] = useState(false);

  const handleDoctorChange = (value) => {
    setSelectedDoctor(value);
    const existingFee = doctorWiseFee.find((fee) => fee.doctor._id === value);
    if (existingFee) {
      const newFeeInputs = {};
      consultationTypes.forEach((type) => {
        newFeeInputs[type] = existingFee.consultationType?.[type] || "";
      });
      setFeeInputs(newFeeInputs);
      setFollowUpSettings({
        followUpDateWithin: existingFee.followUpDateWithin || 14,
      });
    } else {
      const newFeeInputs = {};
      consultationTypes.forEach((type) => {
        newFeeInputs[type] = "";
      });
      setFeeInputs(newFeeInputs);
      setFollowUpSettings({
        followUpDateWithin: 14,
      });
    }
  };

  const handleAddConsultationType = async () => {
    if (!newConsultationType) return;
    if (consultationTypes.includes(newConsultationType.toLowerCase())) {
      toast({
        title: "Error",
        description: "This consultation type already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTypes = [
        ...consultationTypes,
        newConsultationType.toLowerCase(),
      ];
      await dispatch(updateConsultationTypes(updatedTypes)).unwrap();
      setNewConsultationType("");
      toast({
        title: "Success",
        description: "Consultation type added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add consultation type",
        variant: "destructive",
      });
    }
  };

  const handleRemoveConsultationType = async (type) => {
    // Check if the type is being used in any fee data
    const isTypeInUse = doctorWiseFee.some(
      (fee) => fee.consultationType && fee.consultationType[type]
    );

    if (isTypeInUse) {
      toast({
        title: "Error",
        description: "Cannot remove a type that is being used by doctors",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTypes = consultationTypes.filter((t) => t !== type);
      await dispatch(updateConsultationTypes(updatedTypes)).unwrap();
      const newFeeInputs = { ...feeInputs };
      delete newFeeInputs[type];
      setFeeInputs(newFeeInputs);
      toast({
        title: "Success",
        description: "Consultation type removed successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove consultation type",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor",
        variant: "destructive",
      });
      return;
    }

    const consultationTypeMap = {};
    consultationTypes.forEach((type) => {
      consultationTypeMap[type] = Number(feeInputs[type]) || 0;
    });

    const feeData = {
      doctor: selectedDoctor,
      consultationType: consultationTypeMap,
      followUpDateWithin: Number(followUpSettings.followUpDateWithin),
    };

    try {
      await dispatch(updateConsultationFee(feeData)).unwrap();
      toast({
        title: "Success",
        description: "Consultation fees updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update consultation fees",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    dispatch(fetchStaffMembers());
    dispatch(fetchConsultationFees());
  }, [dispatch]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Consultation Fees Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTypeManager(!showTypeManager)}
          className="flex items-center gap-2"
        >
          <Settings2 className="w-4 h-4" />
          {showTypeManager ? "Hide" : "Manage"} Types
        </Button>
      </div>

      {showTypeManager && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Consultation Types</h2>
            <p className="text-sm text-muted-foreground">
              Add or remove consultation types. Types in use cannot be removed.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter new consultation type..."
                value={newConsultationType}
                onChange={(e) => setNewConsultationType(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAddConsultationType}>
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {consultationTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 p-2 rounded-md bg-secondary"
                >
                  <span className="capitalize">{type}</span>
                  <button
                    onClick={() => handleRemoveConsultationType(type)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {consultationTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No consultation types defined yet. Add your first type above.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center justify-between">
              <span>Set Consultation Fees</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFollowUpSettings(!showFollowUpSettings)}
                className="flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                {showFollowUpSettings ? "Hide" : "Show"} Settings
              </Button>
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a doctor and set their consultation fees
            </p>

            {showFollowUpSettings && (
              <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="followUpDays">Follow-up Period (Days)</Label>
                  <Input
                    id="followUpDays"
                    type="number"
                    min="1"
                    value={followUpSettings.followUpDateWithin}
                    onChange={(e) =>
                      setFollowUpSettings({
                        ...followUpSettings,
                        followUpDateWithin: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of days within which a patient is considered for
                    follow-up
                  </p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={handleDoctorChange}
                >
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {consultationTypes.map((type) => (
                  <div key={type} className="space-y-2">
                    <Label
                      htmlFor={type}
                      className="capitalize flex items-center gap-2"
                    >
                      {type}
                      <span className="text-xs text-muted-foreground">Fee</span>
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id={type}
                        type="number"
                        min="0"
                        value={feeInputs[type]}
                        onChange={(e) =>
                          setFeeInputs({ ...feeInputs, [type]: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                ))}
                {consultationTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No consultation types available. Please add types first.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  status === "loading" || consultationTypes.length === 0
                }
              >
                {status === "loading" ? "Saving..." : "Save Consultation Fees"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Current Fee Structure</h2>
            <p className="text-sm text-muted-foreground">
              Overview of consultation fees for all doctors
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Doctor Name</TableHead>
                    {consultationTypes.map((type) => (
                      <TableHead
                        key={type}
                        className="capitalize min-w-[120px]"
                      >
                        {type}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorWiseFee.map((fee) => (
                    <TableRow key={fee.doctor._id}>
                      <TableCell className="font-medium">
                        {fee.doctor.name || "Unknown Doctor"}
                      </TableCell>
                      {consultationTypes.map((type) => (
                        <TableCell key={type}>
                          ₹{fee.consultationType?.[type] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {(doctorWiseFee.length === 0 ||
                    consultationTypes.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={consultationTypes.length + 3}
                        className="text-center h-24 text-muted-foreground"
                      >
                        {consultationTypes.length === 0
                          ? "No consultation types defined yet"
                          : "No consultation fees set yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultationFees;
