import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorData,
  updateDoctorData,
  resetDoctorData,
} from "../redux/slices/doctorDataSlice";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { Badge } from "../components/ui/badge";

export default function DoctorDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const { currentDoctorData, status, error } = useSelector(
    (state) => state.doctorData
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    medicines: [],
    diagnosis: [],
    comorbidities: [],
  });
  const [inputs, setInputs] = useState({
    medicines: "",
    diagnosis: "",
    comorbidities: "",
  });

  useEffect(() => {
    if (doctorId) {
      dispatch(fetchDoctorData(doctorId));
    }
    return () => {
      dispatch(resetDoctorData());
    };
  }, [dispatch, doctorId]);

  useEffect(() => {
    if (currentDoctorData) {
      setFormData({
        medicines: currentDoctorData.medicines || [],
        diagnosis: currentDoctorData.diagnosis || [],
        comorbidities: currentDoctorData.comorbidities || [],
      });
    }
  }, [currentDoctorData]);

  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode, data is already set from currentDoctorData
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    const updatedData = {
      doctor: doctorId,
      ...formData,
    };
    dispatch(updateDoctorData(updatedData)).then(() => {
      setIsEditing(false);
      setInputs({ medicines: "", diagnosis: "", comorbidities: "" });
    });
  };

  const handleAddItem = (field) => {
    const value = inputs[field].trim();
    if (value) {
      const newItems = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && !formData[field].includes(item));

      if (newItems.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], ...newItems],
        }));
      }
      setInputs((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRemoveItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleBack = () => {
    navigate("/settings/doctor-wise-data");
  };

  const renderFieldEditor = (field, label) => (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {formData[field].map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {item}
            <button
              onClick={() => handleRemoveItem(field, index)}
              className="rounded-full outline-none focus:ring-1 focus:ring-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={inputs[field]}
          onChange={(e) => setInputs({ ...inputs, [field]: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem(field);
            }
          }}
          placeholder={`Add ${label.toLowerCase()}(s), comma-separated...`}
        />
      </div>
    </div>
  );

  const renderFieldView = (field, label) => (
    <div>
      <h4 className="text-sm font-semibold mb-2">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {currentDoctorData[field] && currentDoctorData[field].length > 0 ? (
          currentDoctorData[field].map((item, index) => (
            <Badge key={index}>{item}</Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No {field} listed.</p>
        )}
      </div>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Doctor Details</h1>
        </div>
        {!isEditing && <Button onClick={handleEditToggle}>Edit</Button>}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {currentDoctorData?.doctor?.name || "Loading..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {renderFieldEditor("medicines", "Medicines")}
              {renderFieldEditor("diagnosis", "Diagnosis")}
              {renderFieldEditor("comorbidities", "Comorbidities")}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleEditToggle}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {renderFieldView("medicines", "Medicines")}
              {renderFieldView("diagnosis", "Diagnosis")}
              {renderFieldView("comorbidities", "Comorbidities")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
