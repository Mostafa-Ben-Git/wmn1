import { FeatureTabs } from "./components/FeatureTabs"


function App() {
  return (
    <div className="min-h-screen flex justify-center p-6 bg-amber-600">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">My Feature App</h1>
        <FeatureTabs />
      </div>
    </div>
  )
}

export default App