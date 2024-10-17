import React from "react";
import { ChevronDown, LogOut, Bell, Menu, Clock, Search } from "lucide-react";
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
import { useToast } from "../../../hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import { Separator } from "../../ui/separator";

const HorizontalNav = ({ isCollapsed, setIsCollapsed }) => {
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${Backend_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear user data from Redux store
        dispatch(clearUserData());
        // Show success toast
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
          variant: "success",
        });
        // Redirect to login page
        navigate('/');
      } else {
        // Show error toast
        toast({
          title: "Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sample notifications array (empty for now)
  const notifications = [];

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white z-50 sticky top-0">
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
        <span className="ml-2 text-lg font-bold text-gray-800">The Hospital</span>
      </div>
      <div className="flex items-center">
        <div className="flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <Input 
              type="search" 
              placeholder="Enter Patient ID or Name" 
              className="w-96 pl-10 pr-4 py-2 rounded-l-full border-r-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-gray-300 focus:outline-none"
            />
          </div>
          <Button 
            type="submit"
            variant="outline" 
            className="px-4 rounded-r-full border-l-0 bg-gray-100 hover:bg-gray-200 focus:ring-0 focus:outline-none"
          >
            <Search className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mt-2" side="bottom" align="end">
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Notifications</h3>
              <Separator className="my-2" />
              {notifications.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <NotificationItem
                        key={index}
                        title={notification.title}
                        description={notification.description}
                        time={notification.time}
                      />
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <Button variant="ghost" className="w-full justify-center mt-2">
                    View All Notifications
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications at the moment</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-3 flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src="/placeholder.svg?height=24&width=24" alt="User" />
                <AvatarFallback>{(user?.name?.charAt(0))?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm capitalize">{user?.name}</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(`/staff/${user?._id}`, { state: { staffData: user } })}>Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/settings")}>Settings</DropdownMenuItem>
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

const NotificationItem = ({ title, description, time }) => (
  <div className="flex items-start space-x-2">
    <Bell className="h-5 w-5 text-blue-500 mt-1" />
    <div className="flex-1">
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="flex items-center mt-1 text-xs text-gray-400">
        <Clock className="h-3 w-3 mr-1" />
        <span>{time}</span>
      </div>
    </div>
  </div>
);

export default HorizontalNav;
