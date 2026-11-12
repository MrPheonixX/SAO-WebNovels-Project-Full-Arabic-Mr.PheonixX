import "./global.css";
import "./overrides.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot, type Root } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SecurityProvider from "./components/SecurityProvider";
import { loadWorkStatuses } from "./lib/workStatus";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Every page except the home page is loaded on demand, so the first visit
// downloads far less code (the admin panel, login, readers... come later).
const SAOLibrary = lazy(() => import("./pages/SAOLibrary"));
const SAOProgressiveLibrary = lazy(() => import("./pages/SAOProgressiveLibrary"));
const SideWorksLibrary = lazy(() => import("./pages/SideWorksLibrary"));
const AnimeWorksLibrary = lazy(() => import("./pages/AnimeWorksLibrary"));
const ClassicLiterature = lazy(() => import("./pages/ClassicLiterature"));
const LightNovels = lazy(() => import("./pages/LightNovels"));
const AllWorksLibrary = lazy(() => import("./pages/AllWorksLibrary"));
const BookReader = lazy(() => import("./pages/BookReader"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PDFWorksLibrary = lazy(() => import("./pages/PDFWorksLibrary"));
const PDFReader = lazy(() => import("./pages/PDFReader"));

const PageLoader = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-screen flex items-center justify-center bg-slate-900 text-gray-300"
  >
    جاري التحميل...
  </div>
);
import ErrorBoundary from "./components/ErrorBoundary";
import AnimeEmojiNotifications from "./components/AnimeEmojiNotifications";
import AdvancedAnimeSystem from "./components/AdvancedAnimeSystem";
import PerformanceOptimizer from "./components/PerformanceOptimizer";
import UIEnhancements from "./components/UIEnhancements";
import MobileOptimization from "./components/MobileOptimization";
import AntiCopyProtection from "./components/AntiCopyProtection";
import SimpleDevToolsBlocker from "./components/SimpleDevToolsBlocker";
// import RandomAnimeEmojis from "./components/RandomAnimeEmojis";
import SimplePDFSecurityLayer from "./components/SimplePDFSecurityLayer";
import SecurityErrorHandler from "./components/SecurityErrorHandler";
// import DeveloperExceptions from "./components/DeveloperExceptions";

// TypeScript declarations for global variables
declare global {
  interface Window {
    __SAO_REACT_ROOT__?: Root;
  }
}

const queryClient = new QueryClient();

// Which works the admin has hidden / marked as coming soon (never throws)
void loadWorkStatuses();

const App = () => (
  <ErrorBoundary>
    <PerformanceOptimizer
      enableDebugInfo={false}
    >
      <SecurityProvider enableSecurity={false} disableDevToolsProtection={true}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* DeveloperExceptions removed to hide developer mode banner */}
            <SecurityErrorHandler />
            <Toaster />
            <Sonner />
            <UIEnhancements />
            <MobileOptimization />
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/sao" element={<SAOLibrary />} />
                <Route
                  path="/progressive"
                  element={<SAOProgressiveLibrary />}
                />
                <Route path="/sideworks" element={<SideWorksLibrary />} />
                <Route path="/anime-works" element={<AnimeWorksLibrary />} />
                <Route
                  path="/classic-literature"
                  element={<ClassicLiterature />}
                />
                <Route path="/light-novels" element={<LightNovels />} />
                <Route path="/all-works" element={<AllWorksLibrary />} />
                <Route path="/pdf-works" element={<PDFWorksLibrary />} />
                <Route path="/pdf-reader/:workId" element={<PDFReader />} />
                <Route
                  path="/reader/:series/:volumeId"
                  element={<BookReader />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin-panel" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </SecurityProvider>
    </PerformanceOptimizer>
  </ErrorBoundary>
);

// Robust root management for both dev and production
function initializeApp() {
  try {
    console.log("🚀 Initializing SAO Arabic Reader...");

    const container = document.getElementById("root");
    if (!container) {
      console.error("❌ Root container not found!");
      throw new Error("Root container not found");
    }

    console.log("✅ Root container found:", container);

    // Check if we already have a root instance
    if (!window.__SAO_REACT_ROOT__) {
      console.log("🔧 Creating new React root...");
      // Create new root and store globally
      const root = createRoot(container);
      window.__SAO_REACT_ROOT__ = root;
      console.log("✅ SAO Arabic Reader - React root created");
    } else {
      console.log("♻️ Reusing existing React root");
    }

    // Always render with the existing root
    const root = window.__SAO_REACT_ROOT__;
    console.log("🎨 Rendering App component...");
    root.render(<App />);
    console.log("✅ App rendered successfully!");

    // Hide loading screen after successful render
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) {
        loadingScreen.style.display = "none";
        console.log("👋 Loading screen hidden");
      }
    }, 1000);
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);

    // Show error message to user
    const container = document.getElementById("root");
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1e293b, #3730a3);
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 2rem;
        ">
          <div>
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">خطأ في تح  يل التطبيق</h1>
            <p style="margin-bottom: 1rem;">حدث خطأ أثناء تحميل منصة قراءة ساو العربية</p>
            <p style="color: #ef4444; font-family: monospace; font-size: 0.9rem;">${error.message}</p>
            <button
              onclick="location.reload()"
              style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                margin-top: 1rem;
                cursor: pointer;
              "
            >
              🔄 إعادة المحاولة
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize the app
console.log("🎯 Starting SAO Arabic Reader initialization...");
initializeApp();

// Handle hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // On hot reload, just re-render with existing root
    const root = window.__SAO_REACT_ROOT__;
    if (root) {
      root.render(<App />);
    }
  });
}
