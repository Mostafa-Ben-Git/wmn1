import { configureStore } from '@reduxjs/toolkit';
import extractionReducer from '@/features/extraction/extractionSlice';
import randomStringReducer from '@/features/randomString/randomStringSlice';
import htmlExtractorReducer from '@/features/htmlExtractor/htmlExtractorSlice';
import detailsReducer from '@/features/details/detailsSlice';
import rereportsReducer from '@/features/reports/conversionsSlice';

export const store = configureStore({
  reducer: {
    extraction: extractionReducer,
    randomString: randomStringReducer,
    htmlExtractor: htmlExtractorReducer,
    details: detailsReducer,
    reports : rereportsReducer
  },
  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;