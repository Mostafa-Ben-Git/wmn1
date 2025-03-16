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
  sortField: "conversion_date",
  sortDirection: "asc",
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
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
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
            existingConversionsMap.set(newConversion.conversion_id, {
              ...(existingConversionsMap.get(newConversion.conversion_id) || {}),
              ...newConversion,
            });
          });
          const updatedConversions = Array.from(existingConversionsMap.values())
          // Convert map back to array
          state.conversionsData = updatedConversions;
          state.currentPage = Math.ceil(
            updatedConversions.length / state.rowsPerPage
          );
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

export const selectSortedConversions = (state: RootState) => {
  const { conversionsData, sortField, sortDirection } = state.conversions;
  return sortConversions(conversionsData, sortField, sortDirection);
};

export const selectPaginatedConversions = (state: RootState) => {
  const {
    currentPage,
    rowsPerPage,
    conversionsData,
    sortField,
    sortDirection,
  } = state.conversions;
  const sorted = sortConversions(conversionsData, sortField, sortDirection);
  const startIndex = (currentPage - 1) * rowsPerPage;
  return sorted.slice(startIndex, startIndex + rowsPerPage).reverse();
};

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
    const valueA = a[sortField];
    const valueB = b[sortField];

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
  setSortField,
  clearConversions,
  resetFilters,
} = conversionsSlice.actions;

export default conversionsSlice.reducer;