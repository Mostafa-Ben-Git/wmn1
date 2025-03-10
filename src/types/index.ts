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