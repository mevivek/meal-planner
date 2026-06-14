import { AppProvider, useApp } from "./state/AppContext";
import { useHashRoute } from "./lib/useHashRoute";
import { TabBar } from "./components/TabBar";
import { Today } from "./screens/Today";
import { Week } from "./screens/Week";
import { Grocery } from "./screens/Grocery";
import { More } from "./screens/More";
import { Onboarding } from "./screens/Onboarding";

export function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

function Root() {
  const { needsOnboarding, editing, prefs, completeOnboarding, cancelEditing } = useApp();
  if (needsOnboarding || editing) {
    return <Onboarding initial={editing ? prefs : null} onComplete={completeOnboarding} onCancel={editing ? cancelEditing : undefined} />;
  }
  return <Shell />;
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
