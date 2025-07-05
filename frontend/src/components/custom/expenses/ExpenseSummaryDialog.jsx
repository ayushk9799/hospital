import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Badge } from "../../../components/ui/badge";

const ExpenseSummaryDialog = ({ isOpen, onClose, expenses }) => {
  const summaryData = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) {
      acc[category] = { totalAmount: 0, count: 0 };
    }
    acc[category].totalAmount += amount;
    acc[category].count += 1;
    return acc;
  }, {});

  const { grandTotal, totalCount } = Object.values(summaryData).reduce(
    (acc, { totalAmount, count }) => {
      acc.grandTotal += totalAmount;
      acc.totalCount += count;
      return acc;
    },
    { grandTotal: 0, totalCount: 0 }
  );

  const sortedCategories = Object.entries(summaryData).sort(
    ([, a], [, b]) => b.totalAmount - a.totalAmount
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Expense Summary</DialogTitle>
          <DialogDescription>
            A category-wise summary of the selected expenses.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="text-center font-semibold">
                  Transactions
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Total Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.length > 0 ? (
                sortedCategories.map(([category, { totalAmount, count }]) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="3" className="h-24 text-center">
                    No expenses to summarize.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter className="mt-4 sm:mt-6 pt-4 border-t">
          <div className="flex justify-between items-center w-full">
            <div className="text-base font-medium">
              Total Transactions:{" "}
              <span className="font-bold">{totalCount}</span>
            </div>
            <div className="text-base font-medium">
              Grand Total:{" "}
              <span className="font-bold">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseSummaryDialog; 