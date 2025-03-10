import { AttributeData, ExtractionMode } from "@/types";
import { fetchHtmlContent, fetchRandomBlogPost } from "./htmlExtractorThunks";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the state type
interface HtmlExtractorState {
  status: "idle" | "loading" | "extract";
  siteUrl: string;
  extractedHtml: string;
  extractedText: string;
  extractedClean: string;
  originalCleanHtml: string;
  originalSourceHtml: string;
  originalInnerText: string;
  extractionMode: ExtractionMode;
  attributesList: AttributeData[];
  error: string | null;
}

const initialState: HtmlExtractorState = {
  status: "idle",
  siteUrl: "",
  extractedHtml: "",
  extractedText: "",
  extractedClean: "",
  originalCleanHtml: "",
  originalSourceHtml: "",
  originalInnerText: "",
  extractionMode: "source",
  attributesList: [],
  error: null,
};

const htmlExtractorSlice = createSlice({
  name: "htmlExtractor",
  initialState,
  reducers: {
    setSiteUrl: (state, action: PayloadAction<string>) => {
      state.siteUrl = action.payload;
    },
    setExtractionMode: (state, action: PayloadAction<ExtractionMode>) => {
      state.extractionMode = action.payload;
    },
    replaceDomains: (state, action: PayloadAction<string>) => {
      const domainReplacement = action.payload.trim();
      if (!domainReplacement) return;

      const domainRegex = /(https?:\/\/)([\w-]+(\.[\w-]+)+)/gi;

      if (!state.originalCleanHtml) {
        state.originalCleanHtml = state.extractedClean;
        state.originalSourceHtml = state.extractedHtml;
        state.originalInnerText = state.extractedText;
      }

      state.extractedClean = state.extractedClean.replace(
        domainRegex,
        (_match, protocol) => `${protocol}${domainReplacement}`
      );
      
      state.extractedHtml = state.extractedHtml.replace(
        domainRegex,
        (_match, protocol) => `${protocol}${domainReplacement}`
      );
      
      state.extractedText = state.extractedText.replace(
        domainRegex,
        (_match, protocol) => `${protocol}${domainReplacement}`
      );
    },
    revertDomainChanges: (state) => {
      if (state.originalCleanHtml) state.extractedClean = state.originalCleanHtml;
      if (state.originalSourceHtml) state.extractedHtml = state.originalSourceHtml;
      if (state.originalInnerText) state.extractedText = state.originalInnerText;
      
      state.originalCleanHtml = "";
      state.originalSourceHtml = "";
      state.originalInnerText = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchHtmlContent
      .addCase(fetchHtmlContent.pending, (state) => {
        state.status = "extract";
        state.error = null;
      })
      .addCase(fetchHtmlContent.fulfilled, (state, action) => {
        state.status = "idle";
        state.extractedHtml = action.payload.extractedHtml;
        state.extractedText = action.payload.extractedText;
        state.extractedClean = action.payload.extractedClean;
        state.attributesList = action.payload.attributesList;
        state.originalCleanHtml = '';
        state.originalSourceHtml = '';
        state.originalInnerText = '';
      })
      .addCase(fetchHtmlContent.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string;
      })
      // fetchRandomBlogPost
      .addCase(fetchRandomBlogPost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRandomBlogPost.fulfilled, (state, action) => {
        state.status = "idle";
        state.siteUrl = action.payload;
      })
      .addCase(fetchRandomBlogPost.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string;
      });
  }
});

export const { 
  setSiteUrl, 
  setExtractionMode, 
  replaceDomains, 
  revertDomainChanges 
} = htmlExtractorSlice.actions;

export default htmlExtractorSlice.reducer;