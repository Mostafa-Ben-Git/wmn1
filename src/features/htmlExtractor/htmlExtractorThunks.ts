import { AttributeData } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Create async thunks
export const fetchHtmlContent = createAsyncThunk(
    'htmlExtractor/fetchHtmlContent',
    async (url: string, { rejectWithValue }) => {
      try {
        if (!url.trim()) {
          return rejectWithValue("Please enter a valid URL");
        }
  
        // Add https:// if not present
        let formattedUrl = url;
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
          formattedUrl = "https://" + formattedUrl;
        }
  
        // Using cors-anywhere proxy or similar service to bypass CORS
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`;
        const response = await fetch(proxyUrl);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (!data || !data.contents) {
          throw new Error("Invalid response from proxy service");
        }
  
        const htmlContent = data.contents;
        
        // Create a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
  
        // Extract inner text
        const bodyElement = doc.body;
        if (!bodyElement) {
          throw new Error("Could not parse HTML body");
        }
  
        const innerText = bodyElement.innerText.replace(/[\n\r]+/g, " ");
  
        // Clean HTML (remove scripts, styles, and comments)
        const scripts = doc.querySelectorAll("script");
        scripts.forEach((script) => script.remove());
  
        const styles = doc.querySelectorAll("style");
        styles.forEach((style) => style.remove());
  
        // Extract basic attributes from elements
        const elements = doc.querySelectorAll("*");
        const attributesList: AttributeData[] = [];
        const importantAttributes = ["id", "class", "href", "src", "alt", "title"];
  
        elements.forEach((el) => {
          if (el.hasAttributes()) {
            const elementAttrs: Record<string, string> = {};
            let hasImportantAttr = false;
  
            importantAttributes.forEach((attr) => {
              if (el.hasAttribute(attr)) {
                const attrValue = el.getAttribute(attr);
                if (attrValue !== null) {
                  elementAttrs[attr] = attrValue;
                  hasImportantAttr = true;
                }
              }
            });
  
            if (hasImportantAttr) {
              attributesList.push({
                tag: el.tagName.toLowerCase(),
                attributes: elementAttrs,
              });
            }
          }
        });
  
        // Get clean HTML
        const htmlOnly = doc.documentElement.outerHTML;
  
        return {
          extractedHtml: htmlContent.replace(/[\n\r]+/g, " "),
          extractedText: innerText,
          extractedClean: htmlOnly,
          attributesList
        };
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
      }
    }
  );
  
  export const fetchRandomBlogPost = createAsyncThunk(
    'htmlExtractor/fetchRandomBlogPost',
    async (_, { rejectWithValue }) => {
      try {
        // Fetch random advice
        const adviceResponse = await fetch("https://random-word-api.vercel.app/api?words=1");
        if (!adviceResponse.ok) {
          throw new Error("Failed to fetch random advice");
        }
  
        const adviceData = await adviceResponse.json();
        if (!adviceData) {
          throw new Error("Invalid advice data format");
        }
  
        const randomAdvice = adviceData;
        const searchQuery = encodeURIComponent(randomAdvice);
  
        // Google Custom Search API
        const url = `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&cx=2263d84e7cbf24008&key=AIzaSyDAn_HUaB4aZVHbuWSvnQ-rlmh6O5eLQNQ&num=4`;
  
        const searchResponse = await fetch(url);
        if (!searchResponse.ok) {
          throw new Error("Search API request failed");
        }
  
        const searchData = await searchResponse.json();
        if (!searchData?.items || searchData.items.length === 0) {
          throw new Error("No search results found");
        }
  
        // List of domains to exclude (e.g., video platforms, social media)
        const excludedDomains = ["youtube.com", "twitter.com", "facebook.com", "instagram.com", "tiktok.com","amazon.com"];
  
        for (const item of searchData.items) {
          const link: string = item.link;
          const domain = new URL(link).hostname;
  
          // Skip excluded domains
          if (!excludedDomains.some((excluded) => domain.includes(excluded))) {
            return link;
          }
        }
  
        throw new Error("No suitable site found with meaningful content.");
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
      }
    }
  );
  