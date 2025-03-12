
export interface ConversionsResponse {
  row_count: number;
  data: ConversionData[];
  success: boolean;
  message: string | null;
}


// conversionsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { endOfToday, format, startOfToday } from "date-fns";
import { fetchReports } from "./conversionsThunks";
import { ConversionsState, ConversionData } from "@/types";

// Create the slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    conversions: [],
    totalRows: 0,
    isLoading: false,
    error: null,
    startDate: format(startOfToday(), "yyyy-MM-dd'T'HH:mm:ss.SS"),
    endDate: format(endOfToday(), "yyyy-MM-dd'T'HH:mm:ss.SS"),
    currentPage: 1,
    rowsPerPage: 10,
    sortField: 'conversion_date',
    sortDirection: 'desc' as 'asc' | 'desc',
  } as ConversionsState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{startDate: string; endDate: string}>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.currentPage = 1; // Reset to first page when changing date range
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing rows per page
    },
    setSortField: (state, action: PayloadAction<string>) => {
      // If clicking the same field, toggle direction
      if (state.sortField === action.payload) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortDirection = 'desc'; // Default to descending for new field
      }
      state.currentPage = 1; // Reset to first page when changing sort
      // Sort the conversions
      state.conversions = sortConversions(state.conversions, state.sortField, state.sortDirection);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Create a map of existing conversions by conversion_id for quick lookup
        const existingConversionsMap = new Map(
          state.conversions.map(conversion => [conversion.conversion_id, conversion])
        );
        
        // Process incoming conversions to prevent duplicates
        const updatedConversions = action.payload.data.map(newConversion => {
          // If a conversion with this ID already exists, merge the data (preferring new data)
          if (existingConversionsMap.has(newConversion.conversion_id)) {
            return {
              ...existingConversionsMap.get(newConversion.conversion_id),
              ...newConversion
            };
          }
          // Otherwise, use the new conversion data
          return newConversion;
        });
        
        // Replace state with the updated conversions
        state.conversions = updatedConversions;
        state.totalRows = action.payload.row_count;
        // Sort the conversions
        state.conversions = sortConversions(state.conversions, state.sortField, state.sortDirection);
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Function to sort conversions
const sortConversions = (conversions: ConversionData[], sortField: string, sortDirection: 'asc' | 'desc') => {
  return [...conversions].sort((a, b) => {
    const valueA = a[sortField as keyof ConversionData] as string;
    const valueB = b[sortField as keyof ConversionData] as string;
    
    if (valueA < valueB) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export const { setDateRange, setPage, setRowsPerPage, setSortField } = reportsSlice.actions;
export default reportsSlice.reducer;