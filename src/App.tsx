// src/App.tsx
import { FeatureTabs } from "./components/FeatureTabs"
import { ThemeToggle } from "./components/ThemeToggle"

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center p-3 bg-background text-foreground">
      <header className="w-full max-w-3xl flex justify-end">
        <ThemeToggle />
      </header>
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">My Feature App</h1>
        <FeatureTabs />
      </div>
    </div>
  )
}

export default App