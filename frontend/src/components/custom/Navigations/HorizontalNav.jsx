import React from "react";
import { ChevronDown, LogOut, Bell, User, Menu } from "lucide-react";
import { Input } from "../../ui/input";
import { useSelector, useDispatch } from "react-redux";
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
import { clearUserData } from "../../../redux/slices/userSlice";
import { Backend_URL } from "../../../assets/Data";
import { useNavigate } from "react-router-dom";

// Remove the labReportTypes and handleCreateLabReport function

const HorizontalNav = ({ isCollapsed, setIsCollapsed }) => {
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${Backend_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear user data from Redux store
        dispatch(clearUserData());
        // Redirect to login page
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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
                <AvatarFallback>{(user?.name?.charAt(0))?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user?.name}</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
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