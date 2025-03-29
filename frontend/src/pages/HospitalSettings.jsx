import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { updateHospitalSettings } from "../redux/slices/hospitalSettingsSlice";

export default function HospitalSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { settings, status } = useSelector((state) => state.hospitalSettings);

  // Local state to track changes
  const [localSettings, setLocalSettings] = useState({
    defaultBreakBillMode: false,
  });

  // Initialize local state with current settings
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        defaultBreakBillMode: settings.defaultBreakBillMode || false,
      });
    }
  }, [settings]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBreakBillModeChange = (checked) => {
    setLocalSettings((prev) => ({
      ...prev,
      defaultBreakBillMode: checked,
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateHospitalSettings(localSettings)).unwrap();
      // Optional: Show success message
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Optional: Show error message
    }
  };

  const hasChanges =
    settings &&
    settings.defaultBreakBillMode !== localSettings.defaultBreakBillMode;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Hospital Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="breakBillMode"
            checked={localSettings.defaultBreakBillMode}
            onCheckedChange={handleBreakBillModeChange}
          />
          <label
            htmlFor="breakBillMode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Default Break Bill Mode
          </label>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || status === "loading"}
          className="mt-4"
        >
          {status === "loading" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
