import { ConversionData, ConversionsResponse } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";



// Define interface for the custom response
interface CustomConversionsResponse extends Omit<ConversionsResponse, 'data'> {
  data: ConversionData[];
}

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (
    {
      startDate,
      endDate,
      page = 1,
      limit = 11,
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
      
      // Step 3: Transform the data structure
      const transformedData: CustomConversionsResponse = {
        ...pageData,
        data: pageData.data.map(item => {
          // Parse subid_1 which contains the IDs in format "54605_18399408_11_3082_82"
          const subid1Parts = item.subid_1 ? item.subid_1.split('_') : [];
          
          // Create new object with custom structure
          return {
            conversion_id: item.conversion_id,
            conversion_date: item.conversion_date,
            offer_id: item.offer_id,
            offer_name: item.offer_name,
            deploy_id: subid1Parts.length > 1 ? subid1Parts[1] : '',
            mailer_id: subid1Parts.length > 3 ? subid1Parts[3] : '',
            entity_id: item.subid_3 || (subid1Parts.length > 4 ? subid1Parts[4] : ''),
            price: item.price
          };
        })
      };
      
      return transformedData;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);