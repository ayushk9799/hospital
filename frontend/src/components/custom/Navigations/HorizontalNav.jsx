import React from "react";
import { ChevronDown, LogOut, Bell, User, Menu } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { ColorfulLogo } from "./VerticalNav";

// Remove the labReportTypes and handleCreateLabReport function

const HorizontalNav = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow z-50 sticky top-0">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mr-3"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <ColorfulLogo className="h-6 w-6" />
        <span className="ml-2 text-lg font-bold text-gray-800">HMS</span>
      </div>
      <div className="flex items-center">
        <Input type="search" placeholder="Search..." className="w-56 h-8 text-sm" />
      </div>
      <div className="flex items-center">
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-3 flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src="/placeholder.svg?height=24&width=24" alt="User" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <span className="text-sm">Dr. Jane Smith</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default HorizontalNav;