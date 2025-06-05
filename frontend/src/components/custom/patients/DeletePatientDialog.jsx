import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { useDispatch } from "react-redux";
import { deletePatient } from "../../../redux/slices/patientSlice";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../hooks/use-toast";

const DeletePatientDialog = ({ isOpen, onOpenChange, patient, onDeleted }) => {
  const dispatch = useDispatch();
  const [deleteFullRecord, setDeleteFullRecord] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (open) => {
    if (isDeleting) return;
    if (!open) {
      setDeleteFullRecord(false);
    }
    onOpenChange(open);
  };

  const handleDelete = () => {
    if (!patient) return;

    setIsDeleting(true);
    let params = { patientId: patient.patient._id };
    if (!deleteFullRecord) {
      if (patient.type === "OPD") {
        params.visitId = patient._id;
      } else {
        params.admissionId = patient._id;
      }
    }

    dispatch(deletePatient(params)).unwrap().then(() => {
        onOpenChange(false);
        if (onDeleted) onDeleted();
        setDeleteFullRecord(false);
        toast({
          title: "Success",
          description: "Patient deleted successfully",
          variant: "success",
        });
      }).catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      }).finally(() => {
        setIsDeleting(false);
      });
  };

  if (!isOpen || !patient) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone and will permanently delete data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-4">
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="delete-full"
              checked={deleteFullRecord}
              onCheckedChange={setDeleteFullRecord}
              className="mt-1"
              disabled={isDeleting}
            />
            <div className="grid gap-1.5 leading-snug">
              <Label htmlFor="delete-full" className="font-semibold">
                Delete entire patient record
              </Label>
              <p className="text-sm text-muted-foreground">
                This will delete <strong>{patient.patient.name}</strong>'s
                master record and all associated visits and admissions.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            If unchecked, only the current {patient.type} record from{" "}
            {new Date(patient.bookingDate).toLocaleDateString()} will be
            deleted.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePatientDialog; 