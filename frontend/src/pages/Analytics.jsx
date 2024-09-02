import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { AlertTriangle, ArrowDown, ArrowUp, Calendar, Download, TrendingUp } from "lucide-react"

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">Pharmacy Department Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Custom range</option>
            </Select>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
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
                    <TableRow>
                      <TableCell>Amoxicillin 500mg</TableCell>
                      <TableCell>AMX2023-06</TableCell>
                      <TableCell>2023-07-15</TableCell>
                      <TableCell>500</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableCell>Lisinopril 10mg</TableCell>
                      <TableCell>LSN2023-05</TableCell>
                      <TableCell>2023-07-20</TableCell>
                      <TableCell>300</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </TableCell>
                    <TableRow>
                      <TableCell>Metformin 850mg</TableCell>
                      <TableCell>MTF2023-04</TableCell>
                      <TableCell>2023-07-25</TableCell>
                      <TableCell>400</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
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
                    <TableRow>
                      <TableCell>Paracetamol 500mg</TableCell>
                      <TableCell>50</TableCell>
                      <TableCell>100</TableCell>
                      <TableCell>PharmaCorp Inc.</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Omeprazole 20mg</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>75</TableCell>
                      <TableCell>MediSupply Co.</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ibuprofen 400mg</TableCell>
                      <TableCell>25</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>Global Pharma Ltd.</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
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
                    <TableRow>
                      <TableCell>Amoxicillin 500mg</TableCell>
                      <TableCell>Antibiotic</TableCell>
                      <TableCell>1,234</TableCell>
                      <TableCell>$6,170.00</TableCell>
                      <TableCell className="text-green-500">↑ 5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lisinopril 10mg</TableCell>
                      <TableCell>ACE Inhibitor</TableCell>
                      <TableCell>987</TableCell>
                      <TableCell>$3,948.00</TableCell>
                      <TableCell className="text-red-500">↓ 2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Metformin 850mg</TableCell>
                      <TableCell>Antidiabetic</TableCell>
                      <TableCell>876</TableCell>
                      <TableCell>$2,628.00</TableCell>
                      <TableCell className="text-green-500">↑ 3%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Amlodipine 5mg</TableCell>
                      <TableCell>Calcium Channel Blocker</TableCell>
                      <TableCell>765</TableCell>
                      <TableCell>$2,295.00</TableCell>
                      <TableCell className="text-green-500">↑ 1%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Omeprazole 20mg</TableCell>
                      <TableCell>Proton Pump Inhibitor</TableCell>
                      <TableCell>654</TableCell>
                      <TableCell>$1,962.00</TableCell>
                      <TableCell className="text-red-500">↓ 1%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills Generated</CardTitle>
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
                    <TableRow>
                      <TableCell>#B001234</TableCell>
                      <TableCell>2023-06-15 14:30</TableCell>
                      <TableCell>John Doe</TableCell>
                      <TableCell>$78.50</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Paid
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>#B001235</TableCell>
                      <TableCell>2023-06-15 15:15</TableCell>
                      <TableCell>Jane Smith</TableCell>
                      <TableCell>$125.00</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>#B001236</TableCell>
                      <TableCell>2023-06-15 16:00</TableCell>
                      <TableCell>Bob Johnson</TableCell>
                      <TableCell>$45.75</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Paid
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}