import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExtractionType, ResultsState } from '../../types';

interface ExtractionState {
  inputText: string;
  extractionType: ExtractionType;
  results: ResultsState;
}

const initialState: ExtractionState = {
  inputText: '',
  extractionType: 'servers',
  results: {
    servers: [],
    ips: [],
    emails: [],
    domains: [],
  },
};

export const extractionSlice = createSlice({
  name: 'extraction',
  initialState,
  reducers: {
    setInputText: (state, action: PayloadAction<string>) => {
      state.inputText = action.payload;
    },
    setExtractionType: (state, action: PayloadAction<ExtractionType>) => {
      state.extractionType = action.payload;
    },
    setResults: (state, action: PayloadAction<{ type: ExtractionType; data: string[] }>) => {
      state.results[action.payload.type] = action.payload.data;
    },
  },
});

export const { setInputText, setExtractionType, setResults } = extractionSlice.actions;
export default extractionSlice.reducer;