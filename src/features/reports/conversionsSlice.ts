import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  sortField: "conversion_date",
  sortDirection: "asc",
  filterValue:"72"
};

// Create the slice
const conversionsSlice = createSlice({
  name: "conversions",
  initialState,
  reducers: {
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setFilterValue: (state, action: PayloadAction<string>) => {
      state.filterValue = action.payload;
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
    },
    clearConversions: (state) => {
      state.conversionsData = [];
      state.totalRows = 0;
    },
    markConversionAsNotNew: (state, action: PayloadAction<number>) => {
      const conversion = state.conversionsData.find(
        (c) => c.conversion_id === action.payload
      );
      if (conversion) {
        conversion.isNew = false;
      }
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
    },
    setSortField: (state, action: PayloadAction<keyof ConversionData>) => {
      if (state.sortField === action.payload) {
        // Toggle sort direction if the same field is clicked again
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        // Default to ascending order when a new field is selected
        state.sortField = action.payload;
        state.sortDirection = "asc";
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchReports.fulfilled,
        (
          state,
          action: PayloadAction<{ data: ConversionData[]; row_count: number }>
        ) => {
          state.isLoading = false;
      
          const existingConversionsMap = new Map(
            state.conversionsData.map((conversion) => [
              conversion.conversion_id,
              conversion,
            ])
          );
      
          // Update existing entries with new data
          action.payload.data.forEach((newConversion) => {
            const existingConversion = existingConversionsMap.get(newConversion.conversion_id);
      
            if (existingConversion) {
              // If the conversion already exists, only update the `isNew` flag
              existingConversionsMap.set(newConversion.conversion_id, {
                ...existingConversion, // Keep the old data
                isNew: false, // Mark as not new
              });
            } else {
              // If it's a new conversion, add it to the map
              existingConversionsMap.set(newConversion.conversion_id, {
                ...newConversion,
                conversion_date: newConversion.conversion_date.toString(), // Convert Date to string
                isNew: true, // Mark as new
              });
            }
          });
      
          // Convert map back to array
          const updatedConversions = Array.from(existingConversionsMap.values());
          state.conversionsData = updatedConversions;
          state.currentPage = Math.ceil(updatedConversions.length / state.rowsPerPage);
          state.totalRows = action.payload.row_count;
        }
      )
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "An unknown error occurred";
      });
  },
});

// Selectors
export const selectConversions = (state: RootState) =>
  state.conversions.conversionsData;

export const selectSortedConversions = createSelector(
  [selectConversions, (state: RootState) => state.conversions.sortField, (state: RootState) => state.conversions.sortDirection],
  (conversionsData, sortField, sortDirection) => {
    return sortConversions(conversionsData, sortField, sortDirection);
  }
);

export const selectPaginatedConversions = createSelector(
  [
    selectSortedConversions,
    (state: RootState) => state.conversions.currentPage,
    (state: RootState) => state.conversions.rowsPerPage,
  ],
  (sortedConversions, currentPage, rowsPerPage) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedConversions.slice(startIndex, startIndex + rowsPerPage).reverse();
  }
);

export const selectConversionsState = (state: RootState) => state.conversions;


export const selectIsLoading = (state: RootState) =>
  state.conversions.isLoading;
export const selectError = (state: RootState) => state.conversions.error;

// Helper function to sort conversions
const isDate = (value: unknown): value is Date => {
  return value instanceof Date;
};

const sortConversions = (
  conversions: ConversionData[],
  sortField: keyof ConversionData,
  sortDirection: "asc" | "desc"
) => {
  return [...conversions].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    // Convert conversion_date to Date object if it's a string
    if (sortField === "conversion_date" && typeof valueA === "string" && typeof valueB === "string") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortDirection === "asc" ? -1 : 1;
    if (valueB == null) return sortDirection === "asc" ? 1 : -1;

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }

    // Use the type guard to check if values are Date objects
    if (isDate(valueA) && isDate(valueB)) {
      return sortDirection === "asc"
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }

    const strA = String(valueA);
    const strB = String(valueB);
    return sortDirection === "asc"
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
};

export const {
  setDateRange,
  setPage,
  setRowsPerPage,
  setFilterValue,
  markConversionAsNotNew,
  setSortField,
  clearConversions,
  resetFilters,
} = conversionsSlice.actions;

export default conversionsSlice.reducer;