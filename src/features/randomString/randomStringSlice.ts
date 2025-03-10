import { createSlice } from "@reduxjs/toolkit";

interface WordEntry {
  word: string;
  times: number;
}

const initialState = {
  includeNumbers: false,
  includeSymbols: false,
  includeUppercase: false,
  randomLength: 16,
  randomString: "",
  wordEntries: [] as WordEntry[],
};

const randomStringSlice = createSlice({
  name: "randomString",
  initialState,
  reducers: {
    setIncludeNumbers: (state, action) => {
      state.includeNumbers = action.payload;
    },
    setIncludeSymbols: (state, action) => {
      state.includeSymbols = action.payload;
    },
    setIncludeUppercase: (state, action) => {
      state.includeUppercase = action.payload;
    },
    setRandomLength: (state, action) => {
      state.randomLength = action.payload;
    },
    setRandomString: (state, action) => {
      state.randomString = action.payload;
    },
    addWordEntry: (state, action) => {
      state.wordEntries.push(action.payload);
    },
    updateWordEntry: (state, action) => {
      const { index, word, times } = action.payload;
      if (index >= 0 && index < state.wordEntries.length) {
        state.wordEntries[index] = { word, times };
      }
    },
    removeWordEntry: (state, action) => {
      state.wordEntries.splice(action.payload, 1);
    },
  },
});

export const {
  setIncludeNumbers,
  setIncludeSymbols,
  setIncludeUppercase,
  setRandomLength,
  setRandomString,
  addWordEntry,
  updateWordEntry,
  removeWordEntry,
} = randomStringSlice.actions;

export default randomStringSlice.reducer;