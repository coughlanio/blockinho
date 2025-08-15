/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode, useRef, useState, useEffect, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import logo from "./logo.svg";

// Types
type Mode = "allow" | "deny";

interface AddUrlRequest {
  url: string;
  mode: Mode;
}

interface AddUrlResponse {
  contents?: string;
  error?: string;
}

interface StatusResponse {
  enabled: boolean;
  autoEnableInSec?: number;
  disabledGroups?: string[];
}

// Constants
const URL_PATTERN =
  /^(\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$|^\/.*\/[gimuy]*$/;

const FILE_PREFIX = "blockinho";

// App Component
function App() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [allowList, setAllowList] = useState<string[]>([]);
  const [denyList, setDenyList] = useState<string[]>([]);
  const [autoEnableInSec, setAutoEnableInSec] = useState<number | null>(null);
  const [disabledGroups, setDisabledGroups] = useState<string[]>([]);
  const [timer, setTimer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Mode>("allow");

  useEffect(() => {
    fetchStatus();
    fetchLists();
  }, []);

  useEffect(() => {
    if (timer === null) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Update textarea content when switching tabs
  useEffect(() => {
    if (responseInputRef.current) {
      const content =
        activeTab === "allow" ? allowList.join("\n") : denyList.join("\n");
      responseInputRef.current.value = content;
    }
  }, [activeTab, allowList, denyList]);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/list");
      const data = await response.json();
      setAllowList(data.allow);
      setDenyList(data.deny);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status");
      const data: StatusResponse = await response.json();
      setEnabled(data.enabled);
      setDisabledGroups(data.disabledGroups ?? []);
      setTimer(data.autoEnableInSec ?? null);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const url = formData.get("url") as string;

    const body = {
      allow: allowList,
      deny: denyList,
    };

    if (!body[activeTab].includes(url)) {
      body[activeTab].push(url);
    }

    await fetch("/api/list", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    await fetchLists();
    await handleRefresh();
  };

  const handleStatusToggle = async () => {
    const endpoint = enabled ? "/api/disable" : "/api/enable";
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    await fetchStatus();
  };

  const handleRefresh = async () => {
    await fetch("/api/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    await fetchStatus();
  };

  const handlePause = async (duration: string) => {
    await fetch("/api/disable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ duration }),
    });
    await fetchStatus();
  };

  return (
    <div className="app">
      <div className="header-container">
        <img src={logo} alt="Blocky Logo" className="logo blocky-logo" />
        <h1>Blockinho</h1>
      </div>

      <div className="status-control">
        <button
          type="button"
          className={`mode-toggle ${enabled ? "allow" : "deny"}`}
          onClick={handleStatusToggle}
        >
          {enabled
            ? "Blocking"
            : timer !== null
              ? timer > 60
                ? `${Math.floor(timer / 60)}m ${timer % 60}s`
                : `${timer}s`
              : "Stopped"}
        </button>
        <button
          type="button"
          className="mode-toggle deny"
          onClick={() => handlePause("300s")}
        >
          5m
        </button>
        <button
          type="button"
          className="mode-toggle deny"
          onClick={() => handlePause("1800s")}
        >
          30m
        </button>
      </div>

      <div className="url-form">
        <form onSubmit={handleSubmit} className="endpoint-row">
          <input
            type="text"
            name="url"
            className="url-input"
            placeholder="domain/wildcard/regex"
            required
          />
          <button type="submit" className="send-button">
            {activeTab === "allow" ? "Allow" : "Deny"}
          </button>
        </form>

        <div className="tabs-container">
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-button ${activeTab === "allow" ? "active" : ""}`}
              onClick={() => setActiveTab("allow")}
            >
              Allow
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "deny" ? "active" : ""}`}
              onClick={() => setActiveTab("deny")}
            >
              Deny
            </button>
          </div>

          <div className="tab-content">
            <textarea
              ref={responseInputRef}
              readOnly
              defaultValue={
                activeTab === "allow"
                  ? allowList.join("\n")
                  : denyList.join("\n")
              }
              placeholder={`${activeTab === "allow" ? "Allow" : "Deny"} list contents will show here...`}
              className="response-area"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Render the app
const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
