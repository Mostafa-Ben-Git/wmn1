import { ConversionsResponse } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (
    {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortField = "conversion_date",
      excludeBotTraffic = false,
      sortDescending = true
    }: {
      startDate: string;
      endDate: string;
      page?: number;
      limit?: number;
      sortField?: string;
      excludeBotTraffic?: boolean;
      sortDescending?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const baseUrl = `https://publisher.cx3ads.com/affiliates/api/Reports/Conversions`;


      const corsProxyUrl = "https://api.allorigins.win/raw?url="; // CORS Proxy
      // const corsProxyUrl = "https://cors-anywhere.herokuapp.com/"; // Option 1
      //const corsProxyUrl = "https://corsproxy.io/?"; // Option 2

      const buildUrl = (startAtRow: number, rowLimit: number) => {
        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          exclude_bot_traffic: String(excludeBotTraffic),
          start_at_row: String(startAtRow),
          row_limit: String(rowLimit),
          sort_field: sortField,
          sort_descending: String(sortDescending),
          api_key: "4LtLPL3vvpWJlnSjo2CdSHVe814Mi",
          affiliate_id: "4262",
        });
        return `${baseUrl}?${queryParams.toString()}`;
      };

      const fetchWithCors = async (url: string) => {
        const response = await fetch(corsProxyUrl + encodeURIComponent(url));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
      };

      let requestedPage = page;

      // Step 1: If requesting the last page, first get row_count
      let rowCount: number | null = null;
      if (page === -1) {
        const initialData: ConversionsResponse = await fetchWithCors(buildUrl(1, 1));
        if (!initialData || !initialData.row_count) {
          throw new Error("Invalid data received from API");
        }
        rowCount = initialData.row_count;
        requestedPage = Math.ceil(rowCount / limit); // Calculate last page
      }

      // Step 2: Fetch requested page
      const startAtRow = (requestedPage - 1) * limit + 1;
      const pageData: ConversionsResponse = await fetchWithCors(buildUrl(startAtRow, limit));

      return pageData;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);
