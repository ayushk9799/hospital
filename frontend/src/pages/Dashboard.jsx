import React from "react";
import {
  Calendar,
  UserIcon,
  ChartLine,
  Users,
  Activity,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BarChart, Bar, XAxis, YAxis,  Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {ChartTooltip, ChartTooltipContent, ChartContainer} from '../components/ui/chart';

const chartData = [
  { day: "Mon", patients: 186, revenue: 8000 },
  { day: "Tue", patients: 305, revenue: 120000 },
  { day: "Wed", patients: 237, revenue: 9500 },
  { day: "Thu", patients: 273, revenue: 11000 },
  { day: "Fri", patients: 209, revenue: 8500 },
  { day: "Sat", patients: 114, revenue: 4500 },
  { day: "Sun", patients: 64, revenue: 2500 },
]

const Dashboard = () => {
  return (
    <div>
      <h2 className="font-bold text-2xl text-gray-800 mb-3">Dashboard</h2>
      <div className="flex gap-4">
        {/* Today summary */}
        <div className="bg-white p-4 rounded-xl shadow w-2/5">
          <h2 className="font-bold text-xl text-violet-950 mb-2">
            Today's Stats
          </h2>
          <p className="text-gray-600 mb-2 text-sm">Patients summary</p>
          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="bg-pink-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <UserIcon className="w-10 h-10 text-pink-600" />
                    <p className="text-2xl font-bold text-pink-600">250</p>
                    <p className="text-sm text-gray-600">Ongoing Patient</p>
                    <p className="text-xs text-green-600 mt-1">
                      +18% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Calendar className="w-10 h-10 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-600">45</p>
                    <p className="text-sm text-gray-600">Today Appointment</p>
                    <p className="text-xs text-green-600 mt-1">
                      +15% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-100 transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <ChartLine className="w-10 h-10 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-600">$1.2M</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xs text-green-600 mt-1">
                      +0.3% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          {/* Quick Actions */}
          <div className="mt-3">
            <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-4">
              <Button className="w-full justify-center" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add New Patient
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Appointment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
          </div>
        </div>
        {/* Department Occupancy */}
        <div className="w-1/5">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Department Occupancy</CardTitle>
              <CardDescription>Current occupancy by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: "OPD", occupancy: 85 },
                  { name: "IPD", occupancy: 92 },
                  { name: "Emergency", occupancy: 60 },
                  { name: "Surgery", occupancy: 75 },
                ].map((dept, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {dept.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dept.occupancy}%
                      </p>
                    </div>
                    <Progress value={dept.occupancy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Recent Patients */}
        <div className="w-2/5">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Patients</CardTitle>
              <CardDescription>Latest admitted patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  {
                    name: "Alice Johnson",
                    time: "2 hours ago",
                    status: "Stable",
                    avatar: "AJ",
                  },
                  {
                    name: "Bob Smith",
                    time: "4 hours ago",
                    status: "Critical",
                    avatar: "BS",
                  },
                  {
                    name: "Carol Williams",
                    time: "Yesterday",
                    status: "Recovering",
                    avatar: "CW",
                  },
                  {
                    name: "Carol Williams",
                    time: "Yesterday",
                    status: "Recovering",
                    avatar: "CW",
                  },
                ].map((patient, index) => (
                  <div key={index} className="flex items-center">
                    <p className="font-semibold mr-5 text-xl">{index + 1}</p>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{patient.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {patient.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.time}
                      </p>
                    </div>
                    <Badge
                      className={`ml-auto ${
                        patient.status === "Stable"
                          ? "bg-green-100 text-green-800"
                          : patient.status === "Critical"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-4 w-1/2">
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Usage Statistics</CardTitle>
            <CardDescription>Patient visits and Revenue over the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" />
                {/* <Tooltip /> */}
                {/* <ChartTooltip content={<ChartTooltipContent />} /> */}
                <Legend />
                <Bar yAxisId="left" dataKey="patients" fill="#2563eb" name="Patients" />
                <Bar yAxisId="right" dataKey="revenue" fill="#60a5fa" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;