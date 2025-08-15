import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import {
  format,
  subMonths,
  isBefore,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { cn } from "../lib/utils";

// backend url
export const Backend_URL = "https://thehospital.in";
//export const Backend_URL = "http://localhost:3000";

export const formatCurrency = (amount) => {
  const hasDecimal = amount % 1 !== 0;
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: hasDecimal ? 2 : 0,
  })
    .format(Math.abs(amount))
    .replace(/^(\D+)/, "₹");

  return amount < 0 ? `-${formattedAmount}` : formattedAmount;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export const permissionGroups = {
  "Patient Management": [
    { id: "create_patients", label: "Create Patients" },
    { id: "delete_patients", label: "Delete Patients" },
    { id: "edit_patients", label: "Edit Patients" },
    { id: "can_discharge", label: "Can Discharge" },
    { id: "give_discount", label: "Give Discount" },
  ],
  "Inventory Management": [
    { id: "edit_inventory_price", label: "Edit Prices" },
  ],
  "Financial Management": [
    { id: "view_financial", label: "View Financials (Statistics)" },

    { id: "edit_bills", label: "Edit Bills" },

    { id: "view_reports", label: "View Reports" },
    { id: "record_expense", label: "Record Expense" },
    {
      id: "view_otherscollection_all",
      label: "View Other's collection for all days",
    },
    {
      id: "view_otherscollection_for_just_today",
      label: "View Other's collection for only today",
    },
  ],
  "Staff Management": [
    { id: "view_staff", label: "View Staff" },
    { id: "create_staff", label: "Create Staff" },
    { id: "edit_staff", label: "Edit Staff" },
    { id: "delete_staff", label: "Delete Staff" },
  ],
  "Hospital Management": [{ id: "edit_hospital", label: "Edit Hospital" }],
  "Doctor Section": [
    { id: "make_prescription", label: "Make Prescription" },
  ],
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
            toDate={today}
          />
          <div className="flex justify-end gap-2 p-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const convertFilterToDateRange = (filter) => {
  const today = new Date();
  let from, to;

  switch (filter) {
    case "Today":
      from = startOfDay(today);
      to = endOfDay(today);
      break;
    case "Yesterday":
      const yesterday = subDays(today, 1);
      from = startOfDay(yesterday);
      to = endOfDay(yesterday);
      break;
    case "This Week":
      from = startOfWeek(today, { weekStartsOn: 0 });
      to = endOfWeek(today, { weekStartsOn: 0 });
      break;
    case "This Month":
      from = startOfMonth(today);
      to = endOfMonth(today);
      break;
    case "Last 7 Days":
      from = startOfDay(subDays(today, 6));
      to = endOfDay(today);
      break;
    default:
      from = startOfDay(subDays(today, 30));
      to = endOfDay(today);
  }

  return { from, to };
};

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Avoid division by zero
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  return Number(change.toFixed(2)); // Round to 2 decimal places
};

export const convertTo12Hour = (time24) => {
  if (!time24 || typeof time24 !== "string") return "";

  // Trim whitespace and handle any extra spaces
  const cleanTime = time24.trim().replace(/\s+/g, " ");

  // Split by space to check for AM/PM
  const timeParts = cleanTime.split(" ");

  // If it's already in 12-hour format (has AM/PM)
  if (timeParts.length === 2) {
    const [timeSection, period] = timeParts;
    const upperPeriod = period.toUpperCase();

    // Verify it's a valid time format and valid period
    if (
      timeSection.includes(":") &&
      (upperPeriod === "AM" || upperPeriod === "PM")
    ) {
      const [hours, minutes] = timeSection.split(":");
      // Validate hours and minutes
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);

      if (
        !isNaN(hour) &&
        !isNaN(minute) &&
        hour >= 1 &&
        hour <= 12 &&
        minute >= 0 &&
        minute <= 59
      ) {
        return `${hours.padStart(2, "0")}:${minutes.padStart(
          2,
          "0"
        )} ${upperPeriod}`;
      }
    }
  }

  // Try to convert from 24-hour format
  try {
    const [hours, minutes] = cleanTime.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    // Validate the time values
    if (
      isNaN(hour) ||
      isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return "";
    }

    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert to 12-hour format

    return `${hour12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  } catch (error) {
    return "";
  }
};



const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

export function convertLessThanOneThousand(number) {
  if (number === 0) {
    return "";
  }

  let words = "";

  if (number >= 100) {
    words += ones[Math.floor(number / 100)] + " Hundred ";
    number %= 100;
  }

  if (number >= 20) {
    words += tens[Math.floor(number / 10)] + " ";
    number %= 10;
  } else if (number >= 10) {
    words += teens[number - 10] + " ";
    return words.trim();
  }

  if (number > 0) {
    words += ones[number] + " ";
  }

  return words.trim();
}

export function numberToWords(number) {
  if (number === 0) return "Zero";

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const remainder = number % 1000;

  let words = "";

  if (crore > 0) {
    words += convertLessThanOneThousand(crore) + " Crore ";
  }

  if (lakh > 0) {
    words += convertLessThanOneThousand(lakh) + " Lakh ";
  }

  if (thousand > 0) {
    words += convertLessThanOneThousand(thousand) + " Thousand ";
  }

  if (remainder > 0) {
    words += convertLessThanOneThousand(remainder);
  }

  return words.trim();
}

export const s3Domain =
  "https://mybucketthousand.s3.ap-south-1.amazonaws.com";
export const comorbidities = [
  "Hypertension",
  "Diabetes mellitus",
  "Obesity",
  "COPD",
  "Asthma",
  "Coronary artery disease",
  "Congestive heart failure",
  "Chronic kidney disease",
  "Osteoarthritis",
  "Rheumatoid arthritis",
  "Depression",
  "Anxiety disorders",
  "Hypothyroidism",
  "Hyperlipidemia",
  "GERD",
  "Sleep apnea",
  "Osteoporosis",
  "Chronic liver disease",
  "Anemia",
  "Atrial fibrillation",
];

// Parses an age string (e.g., "45", "45-1", "45-12-365") and formats it
// into a human-readable string. The input is assumed to be in the order
// Years-Months-Days, but the function is tolerant:
//   "45"          → 45 Yrs
//   "45-1"        → 45 Yrs 1 M (second part ≤12 treated as months, otherwise days)
//   "45-12-365"   → 45 Yrs 12 M 365 D
// You can customise the labels for year/month/day via the second argument.
export function parseAge(
  ageInput,
  { yearLabel = "Yrs", monthLabel = "Months", dayLabel = "Days" } = {}
) {
  if (ageInput === null || ageInput === undefined || ageInput === "") {
    return "N/A";
  }

  // Accept numeric age directly.
  if (typeof ageInput === "number") {
    return `${ageInput} ${yearLabel}`;
  }

  // Clean and split the string by hyphen/dash.
  const parts = ageInput
    .toString()
    .trim()
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean);

  let years = 0,
    months = 0,
    days = 0;

  if (parts.length === 1) {
    // Only years provided
    years = parseInt(parts[0], 10) || 0;
  } else if (parts.length === 2) {
    years = parseInt(parts[0], 10) || 0;
    const second = parseInt(parts[1], 10) || 0;

    // Heuristic: <=12 → months, otherwise days
    if (second <= 12) months = second;
    else days = second;
  } else if (parts.length >= 3) {
    years = parseInt(parts[0], 10) || 0;
    months = parseInt(parts[1], 10) || 0;
    days = parseInt(parts[2], 10) || 0;
  }

  const segments = [];
  if (years) segments.push(`${years} ${yearLabel}`);
  if (months) segments.push(`${months} ${monthLabel}`);
  if (days) segments.push(`${days} ${dayLabel}`);

  return segments.join(" ").trim() || `0 ${yearLabel}`;
}
