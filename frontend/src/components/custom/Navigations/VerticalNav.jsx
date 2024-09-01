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
  PillIcon
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

const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Billings", icon: ReceiptText, path: "/billings" },
  { name: "Patients", icon: Users, path: "/patients" },
  { name: "Rooms", icon: Bed, path: "/rooms" },
  { name: "Appointments", icon: Calendar, path: "/appointments" },
  { name: "Pharmacy", icon: BriefcaseMedicalIcon, path: "/pharmacy" },
  { name: "Doctors", icon: Stethoscope, path: "/doctors" },
  { name: "Nurses", icon: User, path: "/nurses" },
  { name: "Inventory", icon: ClipboardList, path: "/inventory" },
  { name: "Reports", icon: FileText, path: "/reports" },
  { name: "Analytics", icon: BarChart, path: "/analytics" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export const ColorfulLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" fill="#4299E1" /> {/* Blue background */}
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

export default function VerticalNav({ isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(() => {
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.name : "Dashboard";
  });

  const handleNavigation = (item) => {
    setActiveItem(item.name);
    navigate(item.path);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r transition-all duration-300 fixed top-19 left-0 z-5",
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
                        activeItem === item.name
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-900",
                        isCollapsed ? "px-2" : "px-4"
                      )}
                      onClick={() => handleNavigation(item)}
                    >
                      <item.icon
                        className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.name}</p>
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