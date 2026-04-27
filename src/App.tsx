import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { CollegeProvider } from "@/contexts/CollegeContext";
import LoadingBar from "@/components/LoadingBar";
import OnboardingModal from "@/components/OnboardingModal";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Trade from "./pages/Trade";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProductDetail from "./pages/ProductDetail";
import Sell from "./pages/Sell";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import TeamChat from "./pages/TeamChat";
import Events from "./pages/Events";
import Expeditions from "./pages/Expeditions";
import Recover from "./pages/Recover";
import KnowledgeHub from "./pages/KnowledgeHub";
import FindTeammates from "./pages/FindTeammates";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import Feedback from "./pages/Feedback";
import HirePeer from "./pages/HirePeer";
import PeerServiceDetail from "./pages/PeerServiceDetail";
import ListPeerService from "./pages/ListPeerService";
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
    <LoadingBar />
    <OnboardingModal />
    <div className="pb-16 md:pb-0"> {/* Mobile padding for BottomNav */}
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
      <Route path="/find-teammates" element={<FindTeammates />} />
      <Route path="/hire-peer" element={<HirePeer />} />
      <Route path="/hire-peer/:id" element={<PeerServiceDetail />} />
      <Route path="/hire-peer/list" element={
        <ProtectedRoute requireOnboarded><ListPeerService /></ProtectedRoute>
      } />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/sell" element={
        <ProtectedRoute requireOnboarded><Sell /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><ProfileSettings /></ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute><ChatList /></ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute><ChatRoom /></ProtectedRoute>
      } />
      <Route path="/team-chat" element={
        <ProtectedRoute><TeamChat /></ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </div>
    <BottomNav />
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
