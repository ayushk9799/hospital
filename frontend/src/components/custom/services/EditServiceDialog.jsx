import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { updateService } from "../../../redux/slices/serviceSlice";
import { useToast } from "../../../hooks/use-toast";
import { cn } from "../../../lib/utils";
import { Switch } from "../../ui/switch";
import { Trash2, Plus } from "lucide-react";

const categoryOptions = [
  "Consultation",
  "Lab",
  "General",
  "OPD Procedure",
  "Surgery",
  "Sub Category",
  "Other",
];

export default function EditServiceDialog({ isOpen, onClose, service }) {
  const dispatch = useDispatch();
  const updateServiceStatus = useSelector(
    (state) => state.services.updateServiceStatus
  );
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState("");
  const [subdivisions, setSubdivisions] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringLogic, setRecurringLogic] = useState({
    frequency: "daily",
    dailyPrecision: "precise",
    resetTime: "00:00",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setRate(service.rate?.toString());
      setSubdivisions(service.subdivisions || []);
      setIsRecurring(service.isRecurring || false);
      setRecurringLogic({
        frequency: service.recurringLogic?.frequency || "daily",
        dailyPrecision: service.recurringLogic?.dailyPrecision || "precise",
        resetTime: service.recurringLogic?.resetTime || "00:00",
      });
    }
  }, [service]);

  const handleAddSubdivision = () => {
    setSubdivisions([...subdivisions, { name: "", rate: "" }]);
  };

  const handleRemoveSubdivision = (index) => {
    setSubdivisions(subdivisions.filter((_, i) => i !== index));
  };

  const handleSubdivisionChange = (index, field, value) => {
    const newSubdivisions = [...subdivisions];
    newSubdivisions[index] = {
      ...newSubdivisions[index],
      [field]: field === "rate" ? parseFloat(value) : value,
    };
    setSubdivisions(newSubdivisions);
  };

  const validateSubdivisions = () => {
    if (subdivisions.length === 0) return true;
    const sumOfRates = subdivisions.reduce(
      (sum, sub) => sum + (sub.rate || 0),
      0
    );
    return Math.abs(sumOfRates - parseFloat(rate)) < 0.01;
  };

  const handleEditService = () => {
    if (!validateSubdivisions()) {
      toast({
        title: "Validation Error",
        description: "Sum of subdivision rates must equal the service rate",
        variant: "destructive",
      });
      return;
    }

    const updatedService = {
      _id: service._id,
      name,
      category,
      rate: parseFloat(rate),
      subdivisions,
      isRecurring,
      recurringLogic: isRecurring ? recurringLogic : undefined,
    };

    dispatch(updateService(updatedService))
      .unwrap()
      .then(() => {
        toast({
          title: "Service updated successfully",
          description: "The service has been updated.",
          variant: "success",
        });
        onClose();
      })
      .catch((error) => {
        toast({
          title: "Failed to update service",
          description:
            error.message ||
            "There was an error updating the service. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Service</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update the service details
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditService();
          }}
          className="space-y-4"
        >
          {/* Basic Info Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rate">Rate</Label>
              <Input
                id="rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Subdivisions Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Subdivisions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubdivision}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {subdivisions.map((subdivision, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={subdivision.name}
                    onChange={(e) =>
                      handleSubdivisionChange(index, "name", e.target.value)
                    }
                    className="flex-[2]"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={subdivision.rate}
                    onChange={(e) =>
                      handleSubdivisionChange(index, "rate", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSubdivision(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring">Recurring Service</Label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={recurringLogic.frequency}
                    onValueChange={(value) =>
                      setRecurringLogic({ ...recurringLogic, frequency: value })
                    }
                  >
                    <SelectTrigger id="frequency" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recurringLogic.frequency === "daily" && (
                  <>
                    <div>
                      <Label htmlFor="dailyPrecision">Precision</Label>
                      <Select
                        value={recurringLogic.dailyPrecision}
                        onValueChange={(value) =>
                          setRecurringLogic({
                            ...recurringLogic,
                            dailyPrecision: value,
                          })
                        }
                      >
                        <SelectTrigger id="dailyPrecision" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="precise">Precise</SelectItem>
                          <SelectItem value="time_based">Time Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {recurringLogic.dailyPrecision === "time_based" && (
                      <div>
                        <Label htmlFor="resetTime">Reset Time</Label>
                        <Input
                          id="resetTime"
                          type="time"
                          value={recurringLogic.resetTime}
                          onChange={(e) =>
                            setRecurringLogic({
                              ...recurringLogic,
                              resetTime: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateServiceStatus === "loading"}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateServiceStatus === "loading"}>
              {updateServiceStatus === "loading" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
