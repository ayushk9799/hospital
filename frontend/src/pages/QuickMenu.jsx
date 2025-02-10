import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "../components/ui/card";
import { useDispatch } from "react-redux";
import { fetchPatients } from "../redux/slices/patientSlice";
import { Button } from "../components/ui/button";
import {
  UserPlus,
  FileText,
  Bed,
  Stethoscope,
  Plus,
  ClipboardList,
  Calculator,
  TestTube2,
  BriefcaseMedicalIcon,
  Settings,
  Users,
  DoorClosed,
  Receipt,
  CreditCard,
  BarChart,
  Baby,
} from "lucide-react";
import OPDRegDialog from "../components/custom/registration/OPDRegDialog";
import IPDRegDialog from "../components/custom/registration/IPDRegDialog";
import OPDProcedureDialog from "../components/custom/procedures/OPDProcedureDialog";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchDepartments } from "../redux/slices/departmentSlice";

const QuickMenu = () => {
  const [isOPDDialogOpen, setIsOPDDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);
  const [isOPDProcedureOpen, setIsOPDProcedureOpen] = useState(false);
  const dispatch = useDispatch();
  const todaysPatient = useSelector(
    (state) => state.patients.todaysPatientList
  );
  const { departments, status } = useSelector((state) => state.departments);

  const hasObstetrics = useMemo(() => {
    if (departments.length === 0) return false;
    return departments?.some((dept) =>
      dept.name.toLowerCase().includes("obstetrics")
    );
  }, [departments]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchDepartments());
    }
  }, [departments]);

  useEffect(() => {
    dispatch(
      fetchPatients({
        startDate: new Date()
          .toLocaleDateString("en-In")
          .split("/")
          .reverse()
          .join("-"),
      })
    );
  }, []);
  const navigate = useNavigate();

  // Filter today's patients
  const opdPatients = todaysPatient.filter((patient) => patient.type === "OPD");
  const ipdPatients = todaysPatient.filter((patient) => patient.type === "IPD");

  const quickActions = [
    {
      title: "Today's Patients",
      description: `OPD: ${opdPatients.length} | IPD: ${ipdPatients.length}`,
      icon: Users,
      action: () => navigate("/patients"),
      color: "bg-amber-200 text-amber-800 hover:bg-amber-300",
    },
    {
      title: "Book OPD",
      description: "Register a new OPD patient",
      icon: UserPlus,
      action: () => setIsOPDDialogOpen(true),
      color: "bg-blue-200 text-blue-800 hover:bg-blue-300",
    },
    {
      title: "Book IPD",
      description: "Register a new IPD patient",
      icon: Bed,
      action: () => setIsIPDDialogOpen(true),
      color: "bg-green-200 text-green-800 hover:bg-green-300",
    },
    {
      title: "OPD Procedure",
      description: "Register new OPD procedure",
      icon: FileText,
      action: () => setIsOPDProcedureOpen(true),
      color: "bg-purple-200 text-purple-800 hover:bg-purple-300",
    },
    {
      title: "Patient List",
      description: "View and manage all patients",
      icon: Users,
      action: () => navigate("/patients"),
      color: "bg-pink-200 text-pink-800 hover:bg-pink-300",
    },
    {
      title: "Admitted Patients",
      description: "View and discharge admitted patients",
      icon: Bed,
      action: () => navigate("/patients/admitted"),
      color: "bg-yellow-200 text-yellow-800 hover:bg-yellow-300",
    },
    {
      title: "Billings/Invoices",
      description: "Manage patient bills and payments",
      icon: Calculator,
      action: () => navigate("/billings"),
      color: "bg-red-200 text-red-800 hover:bg-red-300",
    },
    {
      title: "Doctor's Section",
      description: "For filling diagnosis, medications etc ...",
      icon: Stethoscope,
      action: () => navigate("/doctors"),
      color: "bg-indigo-200 text-indigo-800 hover:bg-indigo-300",
    },
    {
      title: "Pharmacy",
      description: "Manage medicines and sales",
      icon: BriefcaseMedicalIcon,
      action: () => navigate("/pharmacy/sales"),
      color: "bg-emerald-200 text-emerald-800 hover:bg-emerald-300",
    },
    {
      title: "Laboratory",
      description: "Manage lab tests and reports",
      icon: TestTube2,
      action: () => navigate("/lab"),
      color: "bg-orange-200 text-orange-800 hover:bg-orange-300",
    },
    {
      title: "Rooms",
      description: "Manage hospital rooms and beds",
      icon: DoorClosed,
      action: () => navigate("/rooms"),
      color: "bg-cyan-200 text-cyan-800 hover:bg-cyan-300",
    },
    {
      title: "Services",
      description: "Manage hospital services",
      icon: Receipt,
      action: () => navigate("/services"),
      color: "bg-violet-200 text-violet-800 hover:bg-violet-300",
    },
    {
      title: "Expenses/Debit",
      description: "Track and manage expenses",
      icon: CreditCard,
      action: () => navigate("/expenses"),
      color: "bg-rose-200 text-rose-800 hover:bg-rose-300",
    },
    {
      title: "Payments",
      description: "View and manage all payments",
      icon: Receipt,
      action: () => navigate("/payments"),
      color: "bg-lime-200 text-lime-800 hover:bg-lime-300",
    },
    {
      title: "Statistics",
      description: "View hospital statistics and reports",
      icon: BarChart,
      action: () => navigate("/statistics"),
      color: "bg-teal-200 text-teal-800 hover:bg-teal-300",
    },
    {
      title: "Settings",
      description: "Configure hospital settings",
      icon: Settings,
      action: () => navigate("/settings"),
      color: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    },
  ];

  // Add the Baby menu item conditionally based on hasObstetrics
  if (hasObstetrics) {
    quickActions.push({
      title: "Baby Record",
      description: "View and Manage all babies",
      icon: Baby,
      action: () => navigate("/patients/babies"),
      color: "bg-pink-300 text-gray-800 hover:bg-pink-400",
    });
  }

  return (
    <div className="p-4 space-y-6">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${action.color}`}
            onClick={action.action}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-white">
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{action.title}</h2>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OPDRegDialog open={isOPDDialogOpen} onOpenChange={setIsOPDDialogOpen} />

      <IPDRegDialog open={isIPDDialogOpen} onOpenChange={setIsIPDDialogOpen} />

      <OPDProcedureDialog
        open={isOPDProcedureOpen}
        onOpenChange={setIsOPDProcedureOpen}
      />
    </div>
  );
};

export default QuickMenu;
