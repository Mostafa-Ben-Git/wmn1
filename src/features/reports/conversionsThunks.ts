import { ConversionData, ConversionsResponse } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { format } from "date-fns";
import axios from 'axios';

// Define interface for eFlow transformed data
interface SponsorResults {
  data: ConversionData[];
  row_count: number;
}

/**
 * Fetches data from CX3 API
 */
async function fetchCX3Data(
  startDate: string,
  endDate: string,
  page: number,
  limit: number,
  sortField = "conversion_date",
  excludeBotTraffic = false,
  sortDescending = true
): Promise<SponsorResults> {
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
    const initialData: ConversionsResponse = await fetchWithCors(
      buildUrl(1, 1)
    );
    if (!initialData || !initialData.row_count) {
      throw new Error("Invalid data received from API");
    }
    rowCount = initialData.row_count;
    requestedPage = Math.ceil(rowCount / limit); // Calculate last page
  }

  // Step 2: Fetch requested page
  const startAtRow = (requestedPage - 1) * limit + 1;
  const pageData: ConversionsResponse = await fetchWithCors(
    buildUrl(startAtRow, limit)
  );

  // Step 3: Transform the data
  const transformedData = pageData.data.map((item) => {
    // Parse subid_1 which contains the IDs in format "54605_18399408_11_3082_82"
    const subid1Parts = item.subid_1 ? item.subid_1.split("_") : [];

    return {
      conversion_id: item.conversion_id,
      conversion_date: new Date(item.conversion_date),
      offer_id: item.offer_id,
      offer_name: item.offer_name,
      deploy_id: subid1Parts.length > 1 ? subid1Parts[1] : "",
      mailer_id: subid1Parts.length > 3 ? subid1Parts[3] : "",
      entity_id: item.subid_3 || (subid1Parts.length > 4 ? subid1Parts[4] : ""),
      price: item.price,
      sponsor_name: "cx3Ads",
    };
  });

  return {
    data: transformedData,
    row_count: pageData.row_count,
  };
}

/**
 * Fetches data from eFlow API
 */
async function fetchEflowData(
  startDate: string,
  endDate: string,
  page: number,
  limit: number
): Promise<SponsorResults> {
  const baseUrl = "https://api.eflow.team/v1/affiliates/reporting/conversions";

  const queryParams = new URLSearchParams({
    page: String(page),
    page_size: String(limit),
  });

  const url = `${baseUrl}?${queryParams.toString()}`;

  const payload = JSON.stringify({
    timezone_id: 90,
    from: format(new Date(startDate), "yyyy-MM-dd"),
    to: format(new Date(endDate), "yyyy-MM-dd"),
    show_events: true,
    show_conversions: true,
    query: {
      filters: [],
      search_terms: [],
    },
  });

  const response = await axios.post(url,payload ,{
    headers: {
      "Content-Type": "application/json",
      "x-eflow-api-key": "4szXGuiATDOCfhovX83SQ",
    }
  });

  if (!response.status) {
    throw new Error(`HTTP ${response.status}: ${await response.statusText}`);
  }

  const data = await response.data;

  // Transform eFlow data to match our structure
  const transformedData = data.conversions.map((item) => ({
    conversion_id: item.conversion_id,
    conversion_date: new Date(item.conversion_unix_timestamp * 1000),
    offer_id: item.relationship.offer.network_offer_id,
    offer_name: item.relationship.offer.name,
    sub1: item.sub1,
    deploy_id: item.sub1.split("_")[1] || "",
    mailer_id: item.sub1.split("_")[3] || "",
    entity_id: item.sub3 || item.sub1.split("_")[4] || "",
    price: item.revenue,
    sponsor_name: "Berserker",
  }));

  return {
    data: transformedData,
    row_count: data.paging.total_count,
  };
}

function mergeAndGroupResultsByDate(
  ...results: SponsorResults[]
): SponsorResults {
  // Combine all data from multiple results
  const allConversions = results.flatMap((result) => result.data);

  // Calculate total row count
  const totalRowCount = results.reduce(
    (sum, result) => sum + result.row_count,
    0
  );

  // Return the final merged and grouped result
  return {
    row_count: totalRowCount,
    data: [...allConversions],
  };
}

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (
    {
      startDate,
      endDate,
      page = 1,
      limit = 1000,
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
      // // Fetch data from both APIs concurrently
      const [cx3Result, eflowResult] = await Promise.all([
        fetchCX3Data(startDate, endDate, page, limit),
        fetchEflowData(startDate, endDate ,page,limit),
      ]);

      const mergedResponse = mergeAndGroupResultsByDate(eflowResult, cx3Result);
      return mergedResponse;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);
