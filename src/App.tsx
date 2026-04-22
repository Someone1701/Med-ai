import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalAuthProvider } from "@/hooks/useLocalAuth";
import Index from "./pages/Index.tsx";
import PatientPage from "./pages/PatientPage.tsx";
import CaretakerPage from "./pages/CaretakerPage.tsx";
import ReminderPage from "./pages/ReminderPage.tsx";
import PatientAuthPage from "./pages/PatientAuthPage.tsx";
import CaretakerAuthPage from "./pages/CaretakerAuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocalAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/patient-login" element={<PatientAuthPage />} />
            <Route path="/caretaker-login" element={<CaretakerAuthPage />} />
            <Route path="/patient" element={<PatientPage />} />
            <Route path="/caretaker" element={<CaretakerPage />} />
            <Route path="/reminders" element={<ReminderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LocalAuthProvider>
  </QueryClientProvider>
);

export default App;
