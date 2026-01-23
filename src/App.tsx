import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChildProvider } from "@/contexts/ChildContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SchedulePage from "./pages/SchedulePage";
import HomeworkPage from "./pages/HomeworkPage";
import ExamsPage from "./pages/ExamsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ChildrenPage from "./pages/ChildrenPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <ChildProvider>{children}</ChildProvider>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/homework"
              element={
                <ProtectedRoute>
                  <HomeworkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/exams"
              element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/children"
              element={
                <ProtectedRoute>
                  <ChildrenPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
