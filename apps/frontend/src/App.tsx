import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { Layout } from './components/layout/Layout';
import { Spinner } from './components/ui/Spinner';
import { KrishiSproutLoader } from './components/common/KrishiSproutLoader';
import { AppSplashScreen } from './components/common/AppSplashScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy-load all pages for code splitting
// Public
const Landing = lazy(() => import('./pages/public/Landing'));
const OTPLogin = lazy(() => import('./pages/public/OTPLogin'));
const HelpCenter = lazy(() => import('./pages/public/HelpCenter'));
const TokenDisplayBoard = lazy(() => import('./pages/public/TokenDisplayBoard'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService'));
const StatusPage = lazy(() => import('./pages/public/StatusPage'));
const LoadingPage = lazy(() => import('./pages/public/LoadingPage'));
import { ErrorPage } from './pages/public/ErrorPage';


// Farmer
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const BookSlot = lazy(() => import('./pages/farmer/BookSlot'));
const MyBookings = lazy(() => import('./pages/farmer/MyBookings'));
const QueueStatus = lazy(() => import('./pages/farmer/QueueStatus'));
const Payments = lazy(() => import('./pages/farmer/Payments'));
const FarmerProfile = lazy(() => import('./pages/farmer/FarmerProfile'));
const MSPCalculatorPage = lazy(() => import('./pages/farmer/MSPCalculatorPage'));
const FindCentres = lazy(() => import('./pages/farmer/FindCentres'));
const MandiHeatmap = lazy(() => import('./pages/farmer/MandiHeatmap'));
const WeatherDashboard = lazy(() => import('./pages/farmer/WeatherDashboard'));
const FPOGroup = lazy(() => import('./pages/farmer/FPOGroup'));
const FarmerGrievances = lazy(() => import('./pages/farmer/FarmerGrievances'));
const CropScannerPage = lazy(() => import('./pages/farmer/CropScannerPage'));
const FarmerHistory = lazy(() => import('./pages/farmer/FarmerHistory'));
const SmartRecommendations = lazy(() => import('./pages/farmer/SmartRecommendations'));
const InnovationsSuite = lazy(() => import('./pages/farmer/InnovationsSuite'));

// Officer
const OfficerDashboard = lazy(() => import('./pages/officer/OfficerDashboard'));
const QueueManagement = lazy(() => import('./pages/officer/QueueManagement'));
const SlotManagement = lazy(() => import('./pages/officer/SlotManagement'));
const CreateProcurement = lazy(() => import('./pages/officer/CreateProcurement'));
const WeighbridgeDashboard = lazy(() => import('./pages/officer/WeighbridgeDashboard'));
const OfficerReports = lazy(() => import('./pages/officer/OfficerReports'));
const OfficerGrievances = lazy(() => import('./pages/officer/OfficerGrievances'));
const OfficerAnnouncements = lazy(() => import('./pages/officer/OfficerAnnouncements'));

// Admin
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const PaymentManagement = lazy(() => import('./pages/admin/PaymentManagement'));
const AdminCentres = lazy(() => import('./pages/admin/AdminCentres'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminMSPRates = lazy(() => import('./pages/admin/AdminMSPRates'));
const AdminGrievances = lazy(() => import('./pages/admin/AdminGrievances'));
const DemandForecast = lazy(() => import('./pages/admin/DemandForecast'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Route guard components
function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    // Redirect to their home based on role
    if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'officer') return <Navigate to="/officer/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/analytics" replace />;
  }
  return <>{children}</>;
}

function RedirectAuthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'officer') return <Navigate to="/officer/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/analytics" replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-16">
      <KrishiSproutLoader
        size="lg"
        showLabel
        label="लोड हो रहा है • Loading KrishiSeva..."
        sublabel="Connecting to National Mandi Gateway"
      />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public / No-auth Routes ── */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <RedirectAuthenticated>
              <OTPLogin />
            </RedirectAuthenticated>
          }
        />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/status" element={<StatusPage />} />
        {/* TV display board — no auth, full-screen kiosk */}

        <Route path="/display/:centreId" element={<TokenDisplayBoard />} />

        {/* ── Authenticated Routes (shared Layout) ── */}
        <Route element={<Layout />}>
          {/* Farmer Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <RequireAuth roles={['farmer']}>
                <FarmerDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/book-slot"
            element={
              <RequireAuth roles={['farmer']}>
                <BookSlot />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/bookings"
            element={
              <RequireAuth roles={['farmer']}>
                <MyBookings />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/queue"
            element={
              <RequireAuth roles={['farmer']}>
                <QueueStatus />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/payments"
            element={
              <RequireAuth roles={['farmer']}>
                <Payments />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <RequireAuth roles={['farmer']}>
                <FarmerProfile />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/msp-calculator"
            element={
              <RequireAuth roles={['farmer']}>
                <MSPCalculatorPage />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/centres"
            element={
              <RequireAuth roles={['farmer']}>
                <FindCentres />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/map"
            element={
              <RequireAuth roles={['farmer']}>
                <MandiHeatmap />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/weather"
            element={
              <RequireAuth roles={['farmer']}>
                <WeatherDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/fpo"
            element={
              <RequireAuth roles={['farmer']}>
                <FPOGroup />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/grievances"
            element={
              <RequireAuth roles={['farmer']}>
                <FarmerGrievances />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/crop-scanner"
            element={
              <RequireAuth roles={['farmer']}>
                <CropScannerPage />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/history"
            element={
              <RequireAuth roles={['farmer']}>
                <FarmerHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/recommendations"
            element={
              <RequireAuth roles={['farmer']}>
                <SmartRecommendations />
              </RequireAuth>
            }
          />
          <Route
            path="/farmer/innovations"
            element={
              <RequireAuth roles={['farmer']}>
                <InnovationsSuite />
              </RequireAuth>
            }
          />

          {/* Officer Routes */}
          <Route
            path="/officer/dashboard"
            element={
              <RequireAuth roles={['officer']}>
                <OfficerDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/queue"
            element={
              <RequireAuth roles={['officer']}>
                <QueueManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/slots"
            element={
              <RequireAuth roles={['officer']}>
                <SlotManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/procurement/new"
            element={
              <RequireAuth roles={['officer']}>
                <CreateProcurement />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/weighbridge"
            element={
              <RequireAuth roles={['officer']}>
                <WeighbridgeDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/reports"
            element={
              <RequireAuth roles={['officer']}>
                <OfficerReports />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/grievances"
            element={
              <RequireAuth roles={['officer']}>
                <OfficerGrievances />
              </RequireAuth>
            }
          />
          <Route
            path="/officer/announcements"
            element={
              <RequireAuth roles={['officer']}>
                <OfficerAnnouncements />
              </RequireAuth>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/analytics"
            element={
              <RequireAuth roles={['admin']}>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <RequireAuth roles={['admin']}>
                <PaymentManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/centres"
            element={
              <RequireAuth roles={['admin']}>
                <AdminCentres />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth roles={['admin']}>
                <AdminUsers />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/msp-rates"
            element={
              <RequireAuth roles={['admin']}>
                <AdminMSPRates />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/grievances"
            element={
              <RequireAuth roles={['admin']}>
                <AdminGrievances />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/forecast"
            element={
              <RequireAuth roles={['admin']}>
                <DemandForecast />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/system"
            element={
              <RequireAuth roles={['admin']}>
                <SystemHealth />
              </RequireAuth>
            }
          />

          {/* Fallback redirects */}
          <Route path="/farmer" element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
        </Route>

        {/* ── Public / Direct Navbar Route Aliases ── */}
        <Route path="/dashboard" element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="/book-slot" element={<Navigate to="/farmer/book-slot" replace />} />
        <Route path="/live-queue" element={<Navigate to="/farmer/queue" replace />} />
        <Route path="/queue-status" element={<Navigate to="/farmer/queue" replace />} />
        <Route path="/mandis" element={<Navigate to="/farmer/centres" replace />} />
        <Route path="/gis-map" element={<Navigate to="/farmer/map" replace />} />
        <Route path="/mandi-heatmap" element={<Navigate to="/farmer/map" replace />} />
        <Route path="/msp-calculator" element={<Navigate to="/farmer/msp-calculator" replace />} />
        <Route path="/payments" element={<Navigate to="/farmer/payments" replace />} />

        {/* ── Dedicated Loading & Error Page Routes ── */}
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/error" element={<ErrorPage type="500" />} />
        <Route path="/404" element={<ErrorPage type="404" />} />

        {/* 404 Catch-All Fallback (Aesthetic Agricultural Detour Error Page) */}
        <Route path="*" element={<ErrorPage type="404" />} />
      </Routes>

    </Suspense>
  );
}

function App() {
  const { isDark } = useThemeStore();

  // Sync dark mode class with store
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ErrorBoundary>
      {/* Aesthetic opening animation when a user opens KrishiSeva */}
      <AppSplashScreen />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: isDark ? '#1a2e1a' : '#fff',
                color: isDark ? '#e8f5e9' : '#1C2B1C',
                border: `1px solid ${isDark ? '#2A6B35' : '#D4E6C3'}`,
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: '0 4px 24px rgba(42, 107, 53, 0.15)',
              },
              success: {
                iconTheme: { primary: '#2A6B35', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#DC2626', secondary: '#fff' },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
