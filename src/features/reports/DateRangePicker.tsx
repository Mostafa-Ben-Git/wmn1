import React, { useEffect, useState } from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears,
  isAfter,
  startOfToday,
  endOfToday,
  endOfYesterday,
  startOfYesterday,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";

// Date range presets
type DateRangePreset = {
    label: string;
    getValue: () => { from: Date; to: Date };
  };
  
  const dateRangePresets: DateRangePreset[] = [
    {
      label: "Today",
      getValue: () => {
        return { from: startOfToday(), to: endOfToday() };
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        return { from: startOfYesterday(), to: endOfYesterday() };
      },
    },
    {
      label: "Current Week",
      getValue: () => {
        const now = new Date();
        return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
      },
    },
    {
      label: "Last Week",
      getValue: () => {
        const now = new Date();
        const start = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        const end = endOfWeek(start, { weekStartsOn: 1 });
        return { from: start, to: end };
      },
    },
    {
      label: "Current Month",
      getValue: () => {
        const now = new Date();
        return { from: startOfMonth(now), to: now };
      },
    },
    {
      label: "Last Month",
      getValue: () => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
    },
    {
      label: "Last 3 Months",
      getValue: () => {
        const now = new Date();
        return { from: startOfMonth(subMonths(now, 2)), to: now };
      },
    },
    {
      label: "This Year",
      getValue: () => {
        const now = new Date();
        return { from: new Date(now.getFullYear(), 0, 1), to: now };
      },
    },
    {
      label: "Last Year",
      getValue: () => {
        const now = new Date();
        const lastYear = subYears(now, 1);
        return {
          from: new Date(lastYear.getFullYear(), 0, 1),
          to: new Date(lastYear.getFullYear(), 11, 31),
        };
      },
    },
  ];
  
  // DateRangePicker Component
  interface DateRangePickerProps {
    startDate: Date | undefined;
    endDate: Date | undefined;
    onRangeChange: (range: { from: Date; to: Date }) => void;
  }
  
const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onRangeChange,
  }) => {
    const [date, setDate] = useState<{ from: Date; to: Date }>(() => {
      const today = new Date();
      return {
        from: startDate || today,
        to: endDate || today,
      };
    });
    const [open, setOpen] = useState(false);
  
    // Update when external state changes
    useEffect(() => {
      if (startDate && endDate) {
        setDate({ from: startDate, to: endDate });
      }
    }, [startDate, endDate]);
  
    // Handle date selection
    const handleSelect = (selectedRange: DateRange | undefined) => {
      if (selectedRange?.from && selectedRange?.to) {
        setDate({ from: selectedRange.from, to: selectedRange.to });
        onRangeChange({ from: selectedRange.from, to: selectedRange.to });
        setOpen(false);
      }
    };
  
    // Apply preset
    const applyPreset = (preset: DateRangePreset) => {
      const newRange = preset.getValue();
      setDate(newRange);
      onRangeChange(newRange);
      setOpen(false);
    };
  
    const today = new Date();
  
    return (
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[130px]">
              Presets <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {dateRangePresets.map((preset) => (
              <DropdownMenuItem
                key={preset.label}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
  
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date.from}
              selected={{ from: date.from, to: date.to }}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => isAfter(date, today)}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };


export default DateRangePicker;