import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.jsx";
import "./index.css";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn(
    "Missing VITE_CLERK_PUBLISHABLE_KEY — add it to frontend/.env before sign-in will work."
  );
}

/**
 * Error boundary — catches runtime crashes (e.g. Clerk SDK failing,
 * Three.js WebGL errors, etc.) so the page shows a helpful fallback
 * instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
            background: "#050A18",
            color: "#EDEFF5",
            fontFamily: "Manrope, sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#F0A83C", fontSize: "1.5rem", margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#7C8AA5", maxWidth: "28rem", lineHeight: 1.6 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(237,239,245,0.08)",
              background: "#0E1830",
              color: "#EDEFF5",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Conditionally wrap with ClerkProvider. If the key is missing,
 * render the app without auth — public routes still work.
 */
function AppWithProviders() {
  const appTree = (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  if (CLERK_PUBLISHABLE_KEY) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        {appTree}
      </ClerkProvider>
    );
  }

  return appTree;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppWithProviders />
    </ErrorBoundary>
  </React.StrictMode>
);