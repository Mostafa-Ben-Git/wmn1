export type ExtractionType = 'servers' | 'ips' | 'emails' | 'domains';
export type ExtractionMode = 'source' | 'text' | 'clean';

export interface ResultsState {
  servers: string[];
  ips: string[];
  emails: string[];
  domains: string[];
}

export interface AttributeData {
  tag: string;
  attributes: Record<string, string>;
}

// Conversions

export interface ConversionsResponse {
  row_count: number;
  data: Conversion[];
  success: boolean;
  message: string | null;
}

export interface Conversion {
  conversion_id: number;
  conversion_date: string;
  offer_id: number;
  offer_name: string;
  subid_1: string;
  subid_3: string;
  price: number;
}


export interface ConversionsState {
  conversions: Conversion[];
  totalRows: number;
  isLoading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  currentPage: number;
  rowsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}