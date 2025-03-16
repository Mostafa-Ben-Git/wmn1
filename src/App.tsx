import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import ExtractionTool from "./features/extraction/ExtractionTool";
import RandomStringGenerator from "./features/randomString/RandomStringGenerator";
import HtmlExtractor from "./features/htmlExtractor/HtmlExtractor";
import Details from "./features/details/Details";
import { ThemeToggle } from "./components/ThemeToggle";
import Conversions from "./features/reports/Conversions";
import { fetchReports } from "./features/reports/conversionsThunks";
import { useDispatch, useSelector } from "react-redux";
import { selectConversionsState } from "./features/reports/conversionsSlice";
import { AppDispatch } from "./app/store";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {startDate,endDate} = useSelector(selectConversionsState);

  useEffect(() => {
    dispatch(fetchReports({startDate,endDate}));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-3 bg-background text-foreground">
      <header className="w-full max-w-3xl flex justify-end">
        <ThemeToggle />
      </header>

      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">WMN1 Tools 🛠️</h1>
        <Tabs defaultValue="extraction" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="extraction">Extraction Tool</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="randomstring">
              Random String Generator
            </TabsTrigger>
            <TabsTrigger value="htmlextractor">HTML Extractor</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
          </TabsList>

          <TabsContent value="extraction">
            <ExtractionTool />
          </TabsContent>

          <TabsContent value="details">
            <Details />
          </TabsContent>

          <TabsContent value="randomstring">
            <RandomStringGenerator />
          </TabsContent>

          <TabsContent value="htmlextractor">
            <HtmlExtractor />
          </TabsContent>

          <TabsContent value="conversions">
            <Conversions />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster position="top-right" />
      <footer className="w-full max-w-3xl flex mt-3 text-muted text-xs">
        <span>Made By </span>
        <a href="https://github.com/Mostafa-Ben-Git">MostafaBen</a>
      </footer>
    </div>
  );
};

export default App;
