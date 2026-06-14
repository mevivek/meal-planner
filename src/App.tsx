import { AppProvider } from "./state/AppContext";
import { useHashRoute } from "./lib/useHashRoute";
import { TabBar } from "./components/TabBar";
import { Today } from "./screens/Today";
import { Week } from "./screens/Week";
import { Grocery } from "./screens/Grocery";
import { More } from "./screens/More";

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const [route, navigate] = useHashRoute();
  return (
    <div className="shell">
      {/* key={route} remounts the screen → CSS entrance animation per navigation */}
      <main className="screen" key={route}>
        {route === "today" && <Today />}
        {route === "week" && <Week />}
        {route === "grocery" && <Grocery />}
        {route === "more" && <More />}
      </main>
      <TabBar route={route} onNavigate={navigate} />
    </div>
  );
}
