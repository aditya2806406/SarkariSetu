import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import { attachClerkAuthInterceptor } from "./lib/axios";

import {
  useAuth,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

// Pages
import ChatPage from "./pages/ChatPage";
import SchemesPage from "./pages/SchemesPage";
import SchemeDetail from "./pages/SchemeDetail";
import EligibilityPage from "./pages/EligibilityPage";
import SavedPage from "./pages/SavedPage";

const HAS_CLERK_KEY = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Protected({ children }) {
  if (!HAS_CLERK_KEY) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="text-slate text-center">
          Authentication is not configured. Please add your Clerk publishable
          key to <code className="text-marigold">frontend/.env</code> and
          restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

/**
 * Sets up the Clerk auth interceptor on Axios.
 * Only rendered when ClerkProvider is present (HAS_CLERK_KEY is true).
 */
function ClerkAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    attachClerkAuthInterceptor(getToken);
  }, [getToken]);

  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Only mount the auth bridge when Clerk is available */}
      {HAS_CLERK_KEY && <ClerkAuthBridge />}

      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/schemes/:schemeId" element={<SchemeDetail />} />
          <Route path="/eligibility" element={<EligibilityPage />} />
          <Route
            path="/saved"
            element={
              <Protected>
                <SavedPage />
              </Protected>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}