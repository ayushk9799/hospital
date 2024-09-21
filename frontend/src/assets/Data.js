import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, subMonths, isBefore, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks } from 'date-fns';
import { cn } from '../lib/utils';

// backend url
export const Backend_URL = "http://localhost:3000";

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

export const DateRangePicker = ({ from, to, onSelect, onSearch, onCancel }) => {
    const [open, setOpen] = useState(false);
  
    const handleSearch = () => {
      onSearch();
      setOpen(false);
    };
  
    const handleCancel = () => {
      onCancel();
      setOpen(false);
    };
  
    const today = new Date();
    const lastMonth = subMonths(today, 1);
  
    return (
      <div className={cn("grid gap-2")}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? (
                to ? (
                  <>
                    {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
                  </>
                ) : (
                  format(from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={lastMonth}
              selected={{ from, to }}
              onSelect={onSelect}
              numberOfMonths={2}
              disabled={(date) => isBefore(today, date)}
              toDate={today}
            />
            <div className="flex justify-end gap-2 p-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" onClick={handleSearch}>Search</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };
  
export const convertFilterToDateRange = (filter) => {
    const today = new Date();
    switch (filter) {
      case "Today":
        return {
          from: startOfDay(today),
          to: endOfDay(today)
        };
      case "Yesterday":
        const yesterday = subDays(today, 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        };
      case "This Week":
        return {
          from: startOfWeek(today),
          to: endOfWeek(today)
        };
      case "This Month":
        return {
          from: startOfMonth(today),
          to: endOfMonth(today)
        };
      case "Last 7 Days":
        return {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today)
        };
      case 'This Week Fetched':
        return {
          from: startOfWeek(subWeeks(today, 1)),
          to: endOfWeek(today)
        };
      case "This Month Fetched":
        return {
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(today)
        };
      case "All":
        return { from: null, to: null };
      default:
        return { from: null, to: null };
    }
  };

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Avoid division by zero
  }
  
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return Number(change.toFixed(2)); // Round to 2 decimal places
};
