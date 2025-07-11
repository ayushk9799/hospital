import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast.js";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPrefixData, updatePrefixData } from "../redux/slices/hospitalSettingsSlice.js";

export default function PrefixSettings() {
  const [settings, setSettings] = useState({
    registration: {
      prefix: "",
      sequence: 0,
      useYearSuffix: true,
      label: "OPD/UHID Number"
    },
    ipd: {
      prefix: "IPD",
      sequence: 0,
      useYearSuffix: true,
      label: "IPD Number"
    },
    lab: {
      prefix: "LAB",
      sequence: 0,
      useYearSuffix: true,
      label: "Lab Number"
    },
    invoice: {
      prefix: "INV",
      sequence: 0,
      useYearSuffix: true,
      label: "Invoice/Bill Number"
    },
    payment: {
      prefix: "PAY",
      sequence: 0,
      useYearSuffix: true,
      label: "Payment Number"
    }
  });

  const dispatch = useDispatch();
  const { prefixData, prefixDataStatus } = useSelector((state) => state.hospitalSettings);
  const loading = prefixDataStatus === 'loading';

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    dispatch(fetchPrefixData());
  }, [dispatch]);

  useEffect(() => {
    if (prefixData) {
      // Update all settings from API response
      setSettings(prev => ({
        ...prev,
        registration: {
          ...prev.registration,
          ...prefixData.registration
        },
        ipd: {
          ...prev.ipd,
          ...prefixData.ipd
        },
        lab: {
          ...prev.lab,
          ...prefixData.lab
        },
        invoice: {
          ...prev.invoice,
          ...prefixData.invoice
        },
        payment: {
          ...prev.payment,
          ...prefixData.payment
        }
      }));
    }
  }, [prefixData]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const settingsToUpdate = {
        registration: {
          prefix: settings.registration.prefix,
          useYearSuffix: settings.registration.useYearSuffix,
          sequence: settings.registration.sequence
        },
        ipd: {
          prefix: settings.ipd.prefix,
          useYearSuffix: settings.ipd.useYearSuffix,
          sequence: settings.ipd.sequence
        },
        lab: {
          prefix: settings.lab.prefix,
          useYearSuffix: settings.lab.useYearSuffix,
          sequence: settings.lab.sequence
        },
        invoice: {
          prefix: settings.invoice.prefix,
          useYearSuffix: settings.invoice.useYearSuffix,
          sequence: settings.invoice.sequence
        },
        payment: {
          prefix: settings.payment.prefix,
          useYearSuffix: settings.payment.useYearSuffix,
          sequence: settings.payment.sequence
        }
      };

      await dispatch(updatePrefixData(settingsToUpdate)).unwrap();

      toast({
        title: "Settings updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Failed to update settings",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSettingChange = (type, field, value) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: field === 'sequence' ? (parseInt(value) || 0) : value
      }
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">
            Prefix Settings
          </h1>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-5 gap-4 font-medium text-sm bg-gray-100 p-4 rounded-t-lg">
          <div>Number Type</div>
          <div>Prefix</div>
          <div>Sequence</div>
          <div>Year Suffix</div>
          <div>Next Number Preview</div>
        </div>
        
        <div className="space-y-2 mt-2">
          {Object.entries(settings).map(([type, setting]) => {
            const yearSuffix = new Date().getFullYear().toString().slice(-2);
            const fullYear = new Date().getFullYear().toString();
            const nextNumber = `${setting.prefix}/${setting.useYearSuffix ? yearSuffix : fullYear}/${(parseInt(setting.sequence) + 1).toString()}`;
            
            return (
              <div key={type} className="grid grid-cols-5 gap-4 items-center p-4 bg-white border rounded-lg">
                <div>
                  <div className="font-medium">{setting.label}</div>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={setting.prefix}
                    onChange={(e) => handleSettingChange(type, 'prefix', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter prefix"
                  />
                </div>
                
                <div>
                  <input
                    type="number"
                    value={setting.sequence}
                    onChange={(e) => handleSettingChange(type, 'sequence', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter sequence"
                    min="0"
                  />
                </div>
                
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`useYearSuffix-${type}`}
                      checked={setting.useYearSuffix}
                      onChange={(e) => handleSettingChange(type, 'useYearSuffix', e.target.checked)}
                      className="rounded mr-2"
                    />
                    <label htmlFor={`useYearSuffix-${type}`}>
                      Include Year
                    </label>
                  </div>
                </div>
                <div>
                  <div className="p-2 bg-gray-50 rounded-md font-mono text-gray-700">
                    {nextNumber}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
