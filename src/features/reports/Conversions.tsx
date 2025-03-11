import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
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
  Download,
  RefreshCw,
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { fetchReports } from "./conversionsThunks";
import {
  setDateRange,
  setPage,
  setRowsPerPage,
  setSortField,
} from "./conversionsSlice";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    }
  };

  // Apply preset
  const applyPreset = (preset: DateRangePreset) => {
    const newRange = preset.getValue();
    console.log(newRange);
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

// Reports Component
const Conversions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    conversions,
    totalRows,
    isLoading,
    error,
    startDate,
    endDate,
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
  } = useSelector((state: RootState) => state.reports);

  const [selectedConversions, setSelectedConversions] = useState<Set<number>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchReportsData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, startDate, endDate]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
      });
    }
  }, [error]);

  // Update selected conversions when data changes
  useEffect(() => {
    if (selectAll) {
      const newSelected = new Set<number>();
      conversions.forEach((conversion) => {
        newSelected.add(conversion.conversion_id);
      });
      setSelectedConversions(newSelected);
    } else {
      setSelectedConversions(new Set());
    }
  }, [selectAll, conversions]);

  // Fetch reports data
  const fetchReportsData = () => {
    dispatch(
      fetchReports({
        startDate,
        endDate,
        page: currentPage,
        limit: rowsPerPage,
        sortField,
      })
    );
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    dispatch(
      setDateRange({
        startDate: format(range.from, "yyyy-MM-dd'T'HH:mm:ss.SS"),
        endDate: format(range.to, "yyyy-MM-dd'T'HH:mm:ss.SS"),
      })
    );
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm:ss");
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    setSelectedConversions(new Set());
    setSelectAll(false);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    dispatch(setRowsPerPage(parseInt(value)));
    setSelectedConversions(new Set());
    setSelectAll(false);
  };

  // Handle sort header click
  const handleSortClick = (field: string) => {
    dispatch(setSortField(field));
  };

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  // Handle select all toggle
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
  };

  // Handle individual row selection
  const handleRowSelect = (id: number) => {
    const newSelected = new Set(selectedConversions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedConversions(newSelected);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchReportsData();
    toast.success("Data refreshed successfully");
  };

  // Export selected conversions
  const handleExport = () => {
    // Implementation would depend on your export requirements
    const selectedItems = conversions.filter((c) =>
      selectedConversions.has(c.conversion_id)
    );

    if (selectedItems.length === 0) {
      toast.warning("Please select at least one conversion to export");
      return;
    }

    toast.success(`Exporting ${selectedItems.length} conversions`);

    // Here you would implement the actual export logic
    // This could be CSV, Excel, etc.
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Conversion Reports</CardTitle>
            <CardDescription>
              View and analyze your conversion data over time{" "}
              <span className="text-1xl font-bold">[Just For CX3ads]</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={selectedConversions.size === 0 || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <DateRangePicker
            startDate={new Date(startDate)}
            endDate={new Date(endDate)}
            onRangeChange={handleDateRangeChange}
          />

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              {totalRows} total conversions
            </Badge>
            <span className="text-sm">Rows per page:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    disabled={isLoading || conversions.length === 0}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("conversion_id")}
                >
                  ID {renderSortIndicator("conversion_id")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("conversion_date")}
                >
                  Date {renderSortIndicator("conversion_date")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("offer_id")}
                >
                  Offer ID {renderSortIndicator("offer_id")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("offer_name")}
                >
                  Offer Name {renderSortIndicator("offer_name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("subid_1")}
                >
                  SubID 1 {renderSortIndicator("subid_1")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("subid_3")}
                >
                  SubID 3 {renderSortIndicator("subid_3")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted text-right"
                  onClick={() => handleSortClick("price")}
                >
                  Price {renderSortIndicator("price")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(rowsPerPage)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : conversions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-40">
                    No conversions found for the selected date range
                  </TableCell>
                </TableRow>
              ) : (
                conversions.map((conversion) => (
                  <TableRow
                    key={conversion.conversion_id}
                    className={
                      selectedConversions.has(conversion.conversion_id)
                        ? "bg-muted/50"
                        : ""
                    }
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedConversions.has(
                          conversion.conversion_id
                        )}
                        onChange={() =>
                          handleRowSelect(conversion.conversion_id)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {conversion.conversion_id}
                    </TableCell>
                    <TableCell>
                      {formatDate(conversion.conversion_date)}
                    </TableCell>
                    <TableCell>{conversion.offer_id}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {conversion.offer_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {conversion.subid_1}
                    </TableCell>
                    <TableCell>{conversion.subid_3}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${conversion.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages || isLoading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1 || isLoading}
              >
                Last
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)}{" "}
              to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-center">
        Last updated: {format(new Date(), "MMM dd, yyyy HH:mm:ss")}
      </CardFooter>
    </Card>
  );
};

export default Conversions;
