import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export default function InsuranceForm({ formData, handleSelectChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="visit.insuranceDetails.provider">Insurance Provider</Label>
        <Input
          id="visit.insuranceDetails.provider"
          placeholder="Health Insurance Co."
          value={formData.insuranceDetails.provider}
          onChange={(e) => handleSelectChange("visit.insuranceDetails.provider", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="visit.insuranceDetails.policyNumber">Policy Number</Label>
        <Input
          id="visit.insuranceDetails.policyNumber"
          placeholder="POL-123456"
          value={formData.insuranceDetails.policyNumber}
          onChange={(e) => handleSelectChange("visit.insuranceDetails.policyNumber", e.target.value)}
        />
      </div>
    </div>
  );
}