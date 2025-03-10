import React from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import ExtractionTool from "./features/extraction/ExtractionTool";
import RandomStringGenerator from "./features/randomString/RandomStringGenerator";
import HtmlExtractor from "./features/htmlExtractor/HtmlExtractor";
import Details from "./features/details/Details";
import { ThemeToggle } from "./components/ThemeToggle";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen flex flex-col items-center p-3 bg-background text-foreground">
        <header className="w-full max-w-3xl flex justify-end">
          <ThemeToggle />
        </header>

        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">
            My Feature App
          </h1>
          <Tabs defaultValue="extraction" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="extraction">Extraction Tool</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="randomstring">
                Random String Generator
              </TabsTrigger>
              <TabsTrigger value="htmlextractor">HTML Extractor</TabsTrigger>
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


          </Tabs>
        </div>

        <Toaster position="top-center" />
      </div>
    </Provider>
  );
};

export default App;
