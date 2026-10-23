import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BUDASAI — Investment Research, Education & Wealth" },
      { name: "description", content: "BUDASAI is an investment research, financial education, and future wealth management platform for serious investors." },
      { property: "og:title", content: "BUDASAI — Investment Research, Education & Wealth" },
      { property: "og:description", content: "Research-driven investing, financial education, and a future-ready wealth platform." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/budasai/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#06080f", color: "#eaf0ff", fontFamily: "system-ui, sans-serif" }}>
      <a href="/budasai/index.html" style={{ color: "#34d399", textDecoration: "none", fontWeight: 600 }}>
        Loading BUDASAI →
      </a>
    </div>
  );
}
