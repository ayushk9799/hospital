import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { CircleCheckBigIcon, EllipsisVerticalIcon, SearchIcon } from 'lucide-react'
import { Input } from "../../ui/input";

const PatientEntry = ({ name, id, timing, status }) => (
  <div className="py-2 px-4 bg-white shadow rounded-lg mb-2">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{name} <span className="text-xs text-gray-500">({id})</span></h3>
        <p className="text-sm text-gray-500">New Appointment</p>
        <p className="text-sm text-gray-500">Appointment Number: {24}</p>
      </div>
      <div >
        <Badge
            variant={
            status === 'waiting' ? 'warning' :
            status === 'completed' ? 'success' :
            status === 'rescheduled' ? 'info' :
            'default'
            }
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        {status !== 'completed' && (
            <Button size="sm" variant="secondary" className="flex items-center justify-center mt-2" >
                <CircleCheckBigIcon className="w-4 h-4 text-green-500" />
            </Button>
        )}
      </div>
    </div>
    <div className="space-x-2 mt-2">
      <Button size="sm" variant="outline">Vital</Button>
      <Button size="sm" variant="outline">Print</Button>
      <Button size="sm" variant="outline">Billing</Button>
      <Button size="sm" variant="outline">
        <EllipsisVerticalIcon className="w-4 h-4" />
      </Button> 
    </div>
  </div>
);

const AppointmentsQueue = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = {
    today: [
      { name: "John Doe", id: "PT001", timing: "10:00 AM" },
      { name: "Jane Smith", id: "PT002", timing: "11:30 AM" },
      { name: "Mike Johnson", id: "PT003", timing: "2:00 PM" },
    ],
    waiting: [
      { name: "Emily Brown", id: "PT004", timing: "15 min wait" },
      { name: "David Lee", id: "PT005", timing: "30 min wait" },
      { name: "Sarah Wilson", id: "PT006", timing: "45 min wait" },
      { name: "Tom Harris", id: "PT007", timing: "60 min wait" },
    ],
    engaging: [],
    done: [
      { name: "Alice Taylor", id: "PT008", timing: "Completed at 9:30 AM" },
      { name: "Robert Clark", id: "PT009", timing: "Completed at 11:00 AM" },
    ],
  };

  const filteredPatients = {
    today: patients.today.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    waiting: patients.waiting.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    engaging: patients.engaging.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    done: patients.done.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="today" className="w-full flex-grow flex flex-col">
        <TabsList className="h-20 grid grid-cols-4 gap-2">
          <TabsTrigger value="today">
            <div className="flex flex-col justify-between items-center py-1 gap-1">
              <span>Today</span>
              <span className="bg-red-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                3
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="waiting">
            <div className="flex flex-col justify-between items-center  py-1 gap-1">
              <span>Waiting</span>
              <span className="bg-yellow-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                4
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="engaging">
            <div className="flex flex-col justify-between items-center  py-1 gap-1">
              <span>Engaging</span>
              <span className="bg-blue-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                0
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="done">
            <div className="flex flex-col justify-between items-center  py-1 gap-1">
              <span>Done</span>
              <span className="bg-green-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                2
              </span>
            </div>
          </TabsTrigger>
        </TabsList>
        <div className="px-2 pt-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <TabsContent value="today">
            {filteredPatients.today.map((patient) => (
              <PatientEntry key={patient.id} {...patient} status="today" />
            ))}
          </TabsContent>
          <TabsContent value="waiting">
            {filteredPatients.waiting.map((patient) => (
              <PatientEntry key={patient.id} {...patient} status="waiting" />
            ))}
          </TabsContent>
          <TabsContent value="engaging">
            {filteredPatients.engaging.length > 0 ? (
              filteredPatients.engaging.map((patient) => (
                <PatientEntry key={patient.id} {...patient} status="engaging" />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No patients currently engaging</div>
            )}
          </TabsContent>
          <TabsContent value="done">
            {filteredPatients.done.map((patient) => (
              <PatientEntry key={patient.id} {...patient} status="done" />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default AppointmentsQueue;
