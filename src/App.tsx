import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { GameProvider } from "./contexts/GameContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import LearnPage from "./pages/LearnPage";
import PracticePage from "./pages/PracticePage";
import AbacusPage from "./pages/AbacusPage";
import SolverPage from "./pages/SolverPage";
import ProfilePage from "./pages/ProfilePage";
import VideosPage from "./pages/VideosPage";
import SutrasPage from "./pages/SutrasPage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import ParentDashboard from "./pages/ParentDashboard";
import EmailRedirect from "./pages/EmailRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
      <LanguageProvider>
        <GameProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/abacus" element={<AbacusPage />} />
                <Route path="/solver" element={<SolverPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/sutras" element={<SutrasPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/go" element={<EmailRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
