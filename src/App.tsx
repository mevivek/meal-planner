import { AppProvider, useApp } from "./state/AppContext";
import { useHashRoute } from "./lib/useHashRoute";
import { TabBar } from "./components/TabBar";
import { Today } from "./screens/Today";
import { Week } from "./screens/Week";
import { Grocery } from "./screens/Grocery";
import { More } from "./screens/More";
import { Onboarding } from "./screens/Onboarding";
import { BuildSheet } from "./components/BuildSheet";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const [building, setBuilding] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="shell">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={route}
          className="screen"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {route === "today" && <Today />}
          {route === "week" && <Week />}
          {route === "grocery" && <Grocery />}
          {route === "more" && <More />}
        </motion.main>
      </AnimatePresence>
      <TabBar route={route} onNavigate={navigate} onBuild={() => setBuilding(true)} />
      {building && <BuildSheet onClose={() => setBuilding(false)} />}
    </div>
  );
}
