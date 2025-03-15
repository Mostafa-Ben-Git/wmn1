import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { endOfToday, format, startOfToday } from "date-fns";
import { fetchReports } from "./conversionsThunks";
import { ConversionsState, ConversionData } from "@/types";
import { RootState } from "@/app/store";

// Initial state with proper typing
const initialState: ConversionsState = {
  conversionsData: [],
  totalRows: 0,
  isLoading: false,
  error: null,
  startDate: format(startOfToday(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
  endDate: format(endOfToday(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
  currentPage: 1,
  rowsPerPage: 10,
  sortField: 'conversion_date',
  sortDirection: 'desc',
};

// Create the slice
const conversionsSlice = createSlice({
  name: 'conversions',
  initialState,
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
    setSorting: (state, action: PayloadAction<{field: keyof ConversionData; direction: SortDirection}>) => {
      state.sortField = action.payload.field;
      state.sortDirection = action.payload.direction;
      state.currentPage = 1; // Reset to first page when changing sort
    },
    clearConversions: (state) => {
      state.conversionsData = [];
      state.totalRows = 0;
    },
    resetFilters: (state) => {
      return {
        ...state,
        startDate: initialState.startDate,
        endDate: initialState.endDate,
        currentPage: 1,
        sortField: initialState.sortField,
        sortDirection: initialState.sortDirection,
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<{data: ConversionData[], row_count: number}>) => {
        state.isLoading = false;

        // Create a map for faster lookup
        const existingConversionsMap = new Map(
          state.conversionsData.map(conversion => [conversion.conversion_id, conversion])
        );
        
        // Process incoming conversions to prevent duplicates
        const updatedConversions = action.payload.data.map(newConversion => {
          // If a conversion with this ID already exists, merge the data (preferring new data)
          const existingConversion = existingConversionsMap.get(newConversion.conversion_id);
          if (existingConversion) {
            return {
              ...existingConversion,
              ...newConversion,
              // Add updated timestamp to track when data was last updated
              last_updated: new Date().toISOString(),
            };
          }
          // Otherwise, use the new conversion data
          return {
            ...newConversion,
            last_updated: new Date().toISOString(),
          };
        });
        
        // Replace state with the updated conversions
        state.conversionsData = updatedConversions;
        state.totalRows = action.payload.row_count;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'An unknown error occurred';
      });
  }
});

// Selectors
export const selectConversions = (state: RootState) => state.conversions.conversionsData;
export const selectSortedConversions = (state: RootState) => {
  const { conversionsData, sortField, sortDirection } = state.conversions;
  return sortConversions(conversionsData, sortField, sortDirection);
};
export const selectPaginatedConversions = (state: RootState) => {
  const { currentPage, rowsPerPage, conversionsData, sortField, sortDirection } = state.conversions;
  const sorted = sortConversions(conversionsData, sortField, sortDirection);
  const startIndex = (currentPage - 1) * rowsPerPage;
  return sorted.slice(startIndex, startIndex + rowsPerPage);
};
export const selectConversionsState = (state: RootState) => state.conversions;
export const selectIsLoading = (state: RootState) => state.conversions.isLoading;
export const selectError = (state: RootState) => state.conversions.error;

// Helper function to sort conversions
const sortConversions = (conversions: ConversionData[], sortField: keyof string, sortDirection:string) => {
  return [...conversions].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    // Handle null/undefined values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortDirection === 'asc' ? -1 : 1;
    if (valueB == null) return sortDirection === 'asc' ? 1 : -1;
    
    // Handle different data types
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    
    // Handle dates
    if (valueA instanceof Date && valueB instanceof Date) {
      return sortDirection === 'asc'
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }
    
    // Convert to string for any other types
    const strA = String(valueA);
    const strB = String(valueB);
    
    return sortDirection === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
};

export const { 
  setDateRange, 
  setPage, 
  setRowsPerPage,
  setSorting,
  clearConversions,
  resetFilters
} = conversionsSlice.actions;

export default conversionsSlice.reducer;