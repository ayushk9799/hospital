import React from "react";
import { Button } from "../../ui/button";
import { ChevronRight, BriefcaseMedicalIcon, AlertTriangle, ArrowDown, ArrowUp, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Select } from "../../ui/select";
import { Calendar } from "../../ui/calendar";
import { useNavigate } from "react-router-dom";

const itemsToExpire = [
  { name: "Amoxicillin 500mg", batchNo: "AMX2023-06", expiryDate: "2023-07-15", quantity: 500 },
  { name: "Lisinopril 10mg", batchNo: "LSN2023-05", expiryDate: "2023-07-20", quantity: 300 },
  { name: "Metformin 850mg", batchNo: "MTF2023-04", expiryDate: "2023-07-25", quantity: 400 },
  { name: "Aspirin 81mg", batchNo: "ASP2023-07", expiryDate: "2023-08-01", quantity: 600 },
];

const lowStockArray = [
  { name: "Paracetamol 500mg", currentStock: 50, reorderLevel: 100, supplier: "PharmaCorp Inc." },
  { name: "Omeprazole 20mg", currentStock: 30, reorderLevel: 75, supplier: "MediSupply Co." },
  { name: "Ibuprofen 400mg", currentStock: 25, reorderLevel: 80, supplier: "Global Pharma Ltd." },
];

const topSellingArray = [
  { name: "Amoxicillin 500mg", category: "Antibiotic", unitsSold: 1234, revenue: 6170.00, trend: { direction: "up", percentage: 5 } },
  { name: "Lisinopril 10mg", category: "ACE Inhibitor", unitsSold: 987, revenue: 3948.00, trend: { direction: "down", percentage: 2 } },
  { name: "Metformin 850mg", category: "Antidiabetic", unitsSold: 876, revenue: 2628.00, trend: { direction: "up", percentage: 3 } },
  { name: "Amlodipine 5mg", category: "Calcium Channel Blocker", unitsSold: 765, revenue: 2295.00, trend: { direction: "up", percentage: 1 } },
  { name: "Omeprazole 20mg", category: "Proton Pump Inhibitor", unitsSold: 654, revenue: 1962.00, trend: { direction: "down", percentage: 1 } },
];

const recentBillsArray = [
  { billNo: "#B001234", dateTime: "2023-06-15 14:30", customer: "John Doe", amount: 78.50, status: "Paid" },
  { billNo: "#B001235", dateTime: "2023-06-15 15:15", customer: "Jane Smith", amount: 125.00, status: "Pending" },
  { billNo: "#B001236", dateTime: "2023-06-15 16:00", customer: "Bob Johnson", amount: 45.75, status: "Paid" },
  { billNo: "#B001237", dateTime: "2023-06-15 16:45", customer: "Alice Brown", amount: 92.30, status: "Paid" },
  { billNo: "#B001238", dateTime: "2023-06-15 17:30", customer: "Charlie Davis", amount: 63.20, status: "Pending" },
];

const PharmacyReports = () => {
  
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center bg-gray-100 pr-2">
        <div className="flex items-center p-1 space-x-1">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <BriefcaseMedicalIcon className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-semibold text-gray-700 text-sm">
            Pharmacy Reports
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto mt-2">
        <div className="grid gap-4 grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Expiring Soon</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Within next 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <ArrowDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Below reorder level</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales Today</CardTitle>
              <ArrowUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,240.50</div>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bills Generated Today</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="expiring">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="expiring">Expiring Items</TabsTrigger>
            <TabsTrigger value="lowstock">Low Stock</TabsTrigger>
            <TabsTrigger value="topselling">Top Selling</TabsTrigger>
            <TabsTrigger value="bills">Recent Bills</TabsTrigger>
          </TabsList>
          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <CardTitle>Items Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Batch No.</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsToExpire.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.batchNo}</TableCell>
                        <TableCell>{item.expiryDate}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="lowstock">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockArray.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.reorderLevel}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="topselling">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Most Sold Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingArray.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.unitsSold.toLocaleString()}</TableCell>
                        <TableCell>${item.revenue.toFixed(2)}</TableCell>
                        <TableCell className={item.trend.direction === "up" ? "text-green-500" : "text-red-500"}>
                          {item.trend.direction === "up" ? "↑" : "↓"} {item.trend.percentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bills">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bills Generated</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/pharmacy/all-bills')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No.</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBillsArray.map((bill, index) => (
                      <TableRow key={index}>
                        <TableCell>{bill.billNo}</TableCell>
                        <TableCell>{bill.dateTime}</TableCell>
                        <TableCell>{bill.customer}</TableCell>
                        <TableCell>₹{bill.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            bill.status === "Paid" ? "text-green-800 bg-green-100" : "text-yellow-800 bg-yellow-100"
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PharmacyReports;
