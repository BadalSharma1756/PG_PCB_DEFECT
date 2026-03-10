import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPortal from "./pages/AdminPortal";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeRegistration from "./pages/EmployeeRegistration";
import DefectForm from "./pages/DefectForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem("pg_admin_auth") === "true";
  return isAuth ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/portal" element={<AdminGuard><AdminPortal /></AdminGuard>} />
          <Route path="/employee" element={<EmployeeLogin />} />
          <Route path="/employee/register" element={<EmployeeRegistration />} />
          <Route path="/employee/defect-form" element={<DefectForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
