import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Bed,
  Calendar,
  FileText,
  Settings,
  BarChart,
  Stethoscope,
  ClipboardList,
  User,
  ReceiptText,
  BriefcaseMedicalIcon,
  PillIcon,
  TestTube,
  ChevronRight,
  UsersIcon,
  IndianRupee,
  DatabaseZap,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { useSelector } from "react-redux";
import { useToast } from "../../../hooks/use-toast";

export const navItems = [
  { name: "Quick Menu", icon: Home, path: "/" },
  { name: "Patients List", icon: Users, path: "/patients" },
  { name: "Billings/Invoices", icon: ReceiptText, path: "/billings" },
  { name: "Expenses/Debit", icon: IndianRupee, path: "/expenses" },
  { name: "Doctors", icon: Stethoscope, path: "/doctors" },
  { name: "Pharmacy", icon: BriefcaseMedicalIcon, path: "/pharmacy" },
  { name: "Lab", icon: TestTube, path: "/lab/list" },
  { name: "Rooms", icon: Bed, path: "/rooms" },
  { name: "Services", icon: ClipboardList, path: "/services" },
  { name: "Statistics", icon: BarChart, path: "/statistics", permission: "view_financial" },
  { name: "Staffs", icon: UsersIcon, path: "/staff", permission: "edit_staff" },
  { name: "Settings", icon: Settings, path: "/settings", permission: "edit_hospital" },
];

export const ColorfulLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" fill="#4299E1" />
    <path
      d="M30 50H70"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
    />{" "}
    {/* White horizontal line */}
    <path
      d="M50 30V70"
      stroke="#48BB78"
      strokeWidth="8"
      strokeLinecap="round"
    />{" "}
    {/* Green vertical line */}
    <circle cx="50" cy="50" r="15" fill="#F6E05E" />{" "}
    {/* Yellow center circle */}
    <path
      d="M50 42V58M42 50H58"
      stroke="#4299E1"
      strokeWidth="4"
      strokeLinecap="round"
    />{" "}
    {/* Blue cross in yellow circle */}
  </svg>
);

const hasPermission = (userData, permission) => {
  return userData?.permissions?.includes(permission) || false;
};


export default function VerticalNav({ isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userData } = useSelector((state) => state.user);
  const isActive = (itemPath) => {
    if (itemPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(itemPath);
  };

  const handleClick = (item) => {
    if (item.permission && !hasPermission(userData, item.permission)) {
      toast({
        title: "You don't have permission to view this page",
        description: "Please contact your administrator",
        variant: "destructive",
      });
      return;
    }

    navigate(item.path);
  };

  return (
    <div
      className={cn(
        "hidden md:flex flex-col h-full bg-white border-r transition-all duration-300 fixed top-19 left-0 z-10 ",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      <ScrollArea className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive(item.path)
                          ? "bg-blue-400 text-white"
                          : "text-gray-600 hover:bg-blue-300 hover:text-white",
                        isCollapsed ? "px-2" : "px-4"
                      )}
                      onClick={() => handleClick(item)}
                    >
                      <item.icon
                        className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p className="font-semibold">{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
