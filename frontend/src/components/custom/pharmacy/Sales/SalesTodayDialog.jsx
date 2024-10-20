import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { FileDown } from "lucide-react";
import { format } from 'date-fns';
import BillsTableWithDialog from '../itemMaster/BillsTableWithDialog';
import { fetchSalesBills } from '../../../../redux/slices/pharmacySlice';

const SalesTodayDialog = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const { salesBills, salesBillsStatus } = useSelector(state => state.pharmacy);

  useEffect(() => {
    if (isOpen && salesBillsStatus === 'idle') {
      dispatch(fetchSalesBills());
    }
  }, [isOpen, salesBillsStatus, dispatch]);

  const todaySales = salesBills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    const today = new Date();
    return billDate.toDateString() === today.toDateString();
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="md:max-w-4xl max-h-[500px] overflow-y-auto w-[95vw] rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between mr-5">
          <div>
            <DialogTitle>Sales Today - {format(new Date(), 'MMMM d, yyyy')}</DialogTitle>
            <DialogDescription>Showing {todaySales.length} sales for today</DialogDescription>
          </div>
          {/* <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button> */}
        </DialogHeader>
        {salesBillsStatus === 'loading' ? (
          <p>Loading sales data...</p>
        ) : salesBillsStatus === 'failed' ? (
          <p>Error loading sales data. Please try again.</p>
        ) : (
          <BillsTableWithDialog bills={todaySales} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesTodayDialog;
