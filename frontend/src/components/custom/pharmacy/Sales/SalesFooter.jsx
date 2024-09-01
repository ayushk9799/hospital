import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../ui/select";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";

const SalesFooter = () => {
  return (
    <div className="grid grid-cols-8 items-center gap-2">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="upi">UPI</SelectItem>
          <SelectItem value="credit_card">Credit Card</SelectItem>
          <SelectItem value="debit_card">Debit Card</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder="Buyer Name" />
      <Input placeholder="Additional Discount" />
      <Input placeholder="GST : 18%" />
      <div className="flex justify-center items-center bg-[#e5e5e5] h-full  font-semibold"><p>Amount Due : ₹2000</p></div>
      <div className="flex justify-center h-full bg-[#e5e5e5] items-center font-semibold"><p>Net Total : ₹2000</p></div>
      <Button variant="outline">Done</Button>
      <Button variant="outline">Save & Print</Button>
    </div>
  );
};

export default SalesFooter;
