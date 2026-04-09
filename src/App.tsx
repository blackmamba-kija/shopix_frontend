// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";

// Config
import { ROUTER_FUTURE_FLAGS } from "@/config/app.config";

// Layouts & Pages
import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import ShopsPage from "./pages/ShopsPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import ExpensesPage from "./pages/ExpensesPage";
import ServicesPage from "./pages/ServicesPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import OperationalOverview from "./pages/OperationalOverview";
import DebtsPage from "./pages/DebtsPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

// Permissions
import { authHelper } from "./utils/helpers/auth.helper";
import { useStore } from "./store/useStore";

// Configuration
const queryClient = new QueryClient();

// Protected Route Component — also enforces permission
interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string | null;
}

const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const user = useStore((s) => s.user);
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  // Admins bypass all permission checks
  if (user && user.role !== "admin" && permission && !(user.permissions ?? []).includes(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Route Configuration
const protectedRoutes = [
  { path: "/", element: <Index />, permission: null },
  { path: "/shops", element: <ShopsPage />, permission: "view_shops" },
  { path: "/inventory", element: <InventoryPage />, permission: "view_products" },
  { path: "/sales", element: <SalesPage />, permission: "view_sales" },
  { path: "/expenses", element: <ExpensesPage />, permission: "view_expenses" },
  { path: "/debts", element: <DebtsPage />, permission: "view_sales" },
  { path: "/services", element: <ServicesPage />, permission: "view_services" },
  { path: "/reports", element: <ReportsPage />, permission: "view_reports" },
  { path: "/notifications", element: <NotificationsPage />, permission: null },
  { path: "/settings", element: <SettingsPage />, permission: null },
  { path: "/users", element: <UsersPage />, permission: "view_users" },
  { path: "/audit-logs", element: <AuditLogsPage />, permission: "view_audit_logs" },
  { path: "/operational-summary", element: <OperationalOverview />, permission: "view_summary" },
  { path: "/guide", element: <HelpPage />, permission: null },
];

const App = () => {
  const setOnlineStatus = useStore((s) => s.setOnlineStatus);

  const checkConnectivity = useStore((s) => s.checkConnectivity);
  const syncOfflineData = useStore((s) => s.syncOfflineData);

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      syncOfflineData();
    };
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Heartbeat to check actual connectivity every 30 seconds
    const interval = setInterval(() => {
      checkConnectivity();
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [setOnlineStatus, checkConnectivity, syncOfflineData]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            {protectedRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<ProtectedRoute permission={route.permission}>{route.element}</ProtectedRoute>}
              />
            ))}

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
