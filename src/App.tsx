import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { CollegeProvider } from "@/contexts/CollegeContext";
import OnboardingModal from "@/components/OnboardingModal";
import Index from "./pages/Index";
import Trade from "./pages/Trade";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProductDetail from "./pages/ProductDetail";
import Sell from "./pages/Sell";
import Dashboard from "./pages/Dashboard";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import Events from "./pages/Events";
import Expeditions from "./pages/Expeditions";
import Recover from "./pages/Recover";
import KnowledgeHub from "./pages/KnowledgeHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requireOnboarded = false }: { children: React.ReactNode; requireOnboarded?: boolean }) {
  const { user, profile, loading } = useAuthContext();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (requireOnboarded && profile && !profile.onboarded) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <>
    <OnboardingModal />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/trade" element={<Trade />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/events" element={<Events />} />
      <Route path="/expeditions" element={<Expeditions />} />
      <Route path="/recover" element={<Recover />} />
      <Route path="/knowledge" element={<KnowledgeHub />} />
      <Route path="/sell" element={
        <ProtectedRoute requireOnboarded><Sell /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute><ChatList /></ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute><ChatRoom /></ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CollegeProvider>
            <AppRoutes />
          </CollegeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
