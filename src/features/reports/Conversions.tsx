import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store";
import {
  Calendar as Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { fetchReports } from "./conversionsThunks";
import {
  setDateRange,
  setPage,
  setRowsPerPage,
  selectPaginatedConversions,
  selectConversionsState,
  setSortField,
} from "./conversionsSlice";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ConversionData } from "@/types";
import DateRangePicker from "./DateRangePicker";
import { format } from "date-fns";

const Conversions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const conversionsState = useSelector(selectConversionsState);
  const paginatedConversions = useSelector(selectPaginatedConversions);

  const {
    totalRows,
    isLoading,
    error,
    startDate,
    endDate,
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
  } = conversionsState;

  const [selectedConversions, setSelectedConversions] = useState<Set<number>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Calculate total pages
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Show error notifications
  useEffect(() => {
    if (error) {
      toast.error("Error loading data", {
        description: error,
      });
    }
  }, [error]);

  // Fetch reports data
  const fetchReportsData = () => {
    dispatch(
      fetchReports({
        startDate,
        endDate,
        page: 1,
        limit: 10,
        sortField,
      })
    ).then(() => {
      setLastRefreshTime(new Date());
    });
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    dispatch(
      setDateRange({
        startDate: format(range.from, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
        endDate: format(range.to, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      })
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy HH:mm:ss");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  // Handle sort header click
  const handleSortClick = (field: keyof ConversionData) => {
    dispatch(setSortField(field));
  };

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value);
    dispatch(setRowsPerPage(newRowsPerPage));
    dispatch(setPage(totalPages)); // Reset to the last page when rows per page changes
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchReportsData();
    toast.success("Data refreshed successfully");
  };

  // Handle selection toggle
  const toggleSelection = (id: number) => {
    setSelectedConversions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle select all toggle
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedConversions(new Set());
    } else {
      const allIds = paginatedConversions.map((c) => c.conversion_id);
      setSelectedConversions(new Set(allIds));
    }
    setSelectAll(!selectAll);
  };

  // Export selected conversions
  const handleExport = () => {
    if (selectedConversions.size === 0) {
      toast.warning("Please select at least one conversion to export");
      return;
    }

    const selectedItems = paginatedConversions.filter((c) =>
      selectedConversions.has(c.conversion_id)
    );

    // Create CSV content
    const headers = [
      "ID",
      "Date",
      "Offer ID",
      "Offer Name",
      "Sponsor",
      "Mailer",
      "Entity",
      "Price",
    ];
    const csvRows = [headers];

    selectedItems.forEach((item) => {
      csvRows.push([
        item.conversion_id.toString(),
        item.conversion_date,
        item.offer_id.toString(),
        item.offer_name,
        item.sponsor_name,
        item.mailer_id,
        item.entity_id,
        item.price.toString(),
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `conversions_export_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${selectedItems.length} conversions`);
  };

  // Check if current page is valid
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      handlePageChange(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Conversion Reports</CardTitle>
            <CardDescription>
              View and analyze your conversion data over time{" "}
              <Badge variant="outline" className="ml-2">
                CX3ads
              </Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={selectedConversions.size === 0 || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected ({selectedConversions.size})
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
              {totalRows.toLocaleString()} total conversions
            </Badge>
            <span className="text-sm">Rows per page:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={handleRowsPerPageChange}
              disabled={isLoading}
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
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={toggleSelectAll}
                    disabled={isLoading || paginatedConversions.length === 0}
                    aria-label="Select all conversions"
                  />
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
                  onClick={() => handleSortClick("sponsor_name")}
                >
                  Sponsor{renderSortIndicator("sponsor_name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("conversion_date")}
                >
                  Date {renderSortIndicator("conversion_date")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("mailer_id")}
                >
                  Mailer {renderSortIndicator("mailer_id")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSortClick("entity_id")}
                >
                  Entity {renderSortIndicator("entity_id")}
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
                        <Skeleton className="h-5 w-8" />
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
              ) : paginatedConversions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-40">
                    No conversions found for the selected date range
                  </TableCell>
                </TableRow>
              ) : (
                paginatedConversions.map((conversion) => (
                  <TableRow
                    key={conversion.conversion_id}
                    className={
                      selectedConversions.has(conversion.conversion_id)
                        ? "bg-muted/50"
                        : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedConversions.has(
                          conversion.conversion_id
                        )}
                        onCheckedChange={() =>
                          toggleSelection(conversion.conversion_id)
                        }
                        aria-label={`Select conversion ${conversion.conversion_id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {conversion.offer_id}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={conversion.offer_name}
                    >
                      {conversion.offer_name}
                    </TableCell>
                    <TableCell>{conversion.sponsor_name}</TableCell>
                    <TableCell>
                      {formatDate(conversion.conversion_date)}
                    </TableCell>
                    <TableCell>{conversion.mailer_id}</TableCell>
                    <TableCell>{conversion.entity_id}</TableCell>
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
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1 || isLoading || totalPages === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading || totalPages === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage >= totalPages || isLoading || totalPages === 0
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={
                  currentPage >= totalPages || isLoading || totalPages === 0
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalRows > 0 ? (
                <>
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, totalRows)} of{" "}
                  {totalRows.toLocaleString()}
                </>
              ) : (
                "No data to display"
              )}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between">
        <span>
          Last refreshed: {format(lastRefreshTime, "MMM dd, yyyy HH:mm:ss")}
        </span>
      </CardFooter>
    </Card>
  );
};

export default Conversions;
