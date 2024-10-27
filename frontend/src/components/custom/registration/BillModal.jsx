import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { PDFViewer } from "@react-pdf/renderer";
import BillPDF from "./BillPDF";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

const BillModal = ({ isOpen, onClose, billData, hospitalInfo }) => {
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    return () => {
      if (!isOpen) {
        setTimeout(() => {
          document.body.style = "";
        }, 500);
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setShowPDF(false);
    setTimeout(() => {
      document.body.style = "";
    }, 500);
  };

  const togglePDFView = () => {
    setShowPDF(!showPDF);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <DialogHeader className="flex flex-row items-center space-x-4">
            <DialogTitle>Bill Details</DialogTitle>
            <Button 
              onClick={togglePDFView} 
              className="py-1 h-8 text-sm"
            >
              {showPDF ? "Hide PDF View" : "Show PDF View"}
            </Button>
          </DialogHeader>
        </div>
        
        {showPDF ? (
          <div className="mt-4">
            <PDFViewer width="100%" height={500}>
              <BillPDF billData={billData} hospitalInfo={hospitalInfo} />
            </PDFViewer>
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {/* Compact Patient Details Section */}
            <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
              <div>
                <span className="font-semibold">Name:</span> {billData.patientInfo.name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Phone Number:</span> {billData.patientInfo.phone || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Reg. Number:</span> {billData.patientInfo.registrationNumber || 'N/A'}
              </div>
            </div>

            <h3 className="text-lg font-semibold">Services Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price (INR)</TableHead>
                  <TableHead className="text-right">Total (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billData.services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {service.quantity || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {(service.rate || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {((service.quantity || 0) * (service.rate || 0)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-8">
              <div className="w-1/2">
                <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Total Amount:</TableCell>
                      <TableCell className="text-right">
                        ₹{(billData.totalAmount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Discount:</TableCell>
                      <TableCell className="text-right text-red-500">
                        - ₹{(billData.additionalDiscount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Net Amount:</TableCell>
                      <TableCell className="text-right">
                        ₹{((billData.totalAmount || 0) - (billData.additionalDiscount || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Amount Paid:</TableCell>
                      <TableCell className="text-right text-green-500">
                        ₹{(billData.amountPaid || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Balance Due:</TableCell>
                      <TableCell className="text-right">
                        ₹{((billData.totalAmount || 0) - (billData.additionalDiscount || 0) - (billData.amountPaid || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillModal;
