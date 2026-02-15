import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import FloatingSupport from './components/FloatingSupport';
import ScrollToTop from './components/ScrollToTop';

import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';


// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/profile/Profile'));

// Admin Components
const AdminPanels = lazy(() => import('./pages/admin/AdminPanels'));
const AdminConfig = lazy(() => import('./pages/admin/AdminConfig'));

// Main Sections
const Banner = lazy(() => import('./components/Banner'));
const Services = lazy(() => import('./components/Services'));
const ProjectsSection = lazy(() => import('./components/projects/ProjectsSection'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const Community = lazy(() => import('./pages/community/Community'));
const Support = lazy(() => import('./pages/support/Support'));


const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNavbar onMenuClick={() => setIsMobileOpen(true)} />
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
        <FloatingSupport />
        <Footer />
      </main>
    </div>
  );
};


// Create page wrappers to use lazy loaded components
const HomePage = () => (
  <div className="fade-in">
    <h1 style={{ marginBottom: '20px' }}>Home</h1>
    <Banner />
    <Services />
  </div>
);

const ProyectosPage = () => (
  <div className="projects-page-bg fade-in">
    <ProjectsSection />
  </div>
);

const NosotrosPage = () => (
  <div className="fade-in">
    <AboutUs />
  </div>
);


function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="proyectos" element={<ProyectosPage />} />
            <Route path="nosotros" element={<NosotrosPage />} />
            <Route path="comunidad" element={<Community />} />
            <Route path="soporte" element={<Support />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="admin">
              <Route path="paneles" element={<AdminPanels />} />
              <Route path="solicitudes" element={<AdminConfig />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
