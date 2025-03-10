import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DetailsState {
  inputField: string;
  sendTypes: string[];
  testAfter: number;
  dataSeeds: number;
  isSeeds: boolean;
  returnPath: string;
  fromPath: string;
  deployId: string;
  offer: string;
  showResults: boolean;
}

const initialState: DetailsState = {
  inputField: '',
  sendTypes: ['SPF'],
  testAfter: 100,
  dataSeeds: 100,
  isSeeds: true,
  returnPath: '',
  fromPath: '',
  deployId: '',
  offer: '',
  showResults: false,
};

export const detailsSlice = createSlice({
  name: 'details',
  initialState,
  reducers: {
    setInputField: (state, action: PayloadAction<string>) => {
      state.inputField = action.payload;
    },
    toggleSendType: (state, action: PayloadAction<string>) => {
      if (state.sendTypes.includes(action.payload)) {
        state.sendTypes = state.sendTypes.filter(type => type !== action.payload);
      } else {
        state.sendTypes.push(action.payload);
      }
    },
    setTestAfter: (state, action: PayloadAction<number>) => {
      state.testAfter = action.payload;
    },
    setDataSeeds: (state, action: PayloadAction<number>) => {
      state.dataSeeds = action.payload;
    },
    setIsSeeds: (state, action: PayloadAction<boolean>) => {
      state.isSeeds = action.payload;
    },
    setReturnPath: (state, action: PayloadAction<string>) => {
      state.returnPath = action.payload;
    },
    setFromPath: (state, action: PayloadAction<string>) => {
      state.fromPath = action.payload;
    },
    setDeployId: (state, action: PayloadAction<string>) => {
      state.deployId = action.payload;
    },
    setOffer: (state, action: PayloadAction<string>) => {
      state.offer = action.payload;
    },
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },
  },
});

export const {
  setInputField,
  toggleSendType,
  setTestAfter,
  setDataSeeds,
  setIsSeeds,
  setReturnPath,
  setFromPath,
  setDeployId,
  setOffer,
  setShowResults,
} = detailsSlice.actions;
export default detailsSlice.reducer;