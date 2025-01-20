import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Backend_URL } from "../../src/assets/Data";
import { useToast } from "../hooks/use-toast.js";
export default function PrefixSettings() {
  const [prefix, setPrefix] = useState("");
  const [useYearSuffix, setUseYearSuffix] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${Backend_URL}/api/registration/settings`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setPrefix(data.prefix || "");
        setUseYearSuffix(data.useYearSuffix);
      } catch (error) {
        toast({
          title: "Failed to fetch settings",
          variant: "destructive",
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${Backend_URL}/api/registration/settings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix,
          useYearSuffix,
        }),
      });
      toast({
        title: "Settings updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Registration Number Prefix Settings
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Registration Number Prefix
          </label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter prefix (e.g. KSUC)"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useYearSuffix"
            checked={useYearSuffix}
            onChange={(e) => setUseYearSuffix(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="useYearSuffix" className="text-sm font-medium">
            Include Year in Registration Number
          </label>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
