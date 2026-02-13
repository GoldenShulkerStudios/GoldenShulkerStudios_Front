import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin Components
const AdminInicio = lazy(() => import('./pages/admin/AdminPages').then(module => ({ default: module.AdminInicio })));
const AdminProyectos = lazy(() => import('./pages/admin/AdminPages').then(module => ({ default: module.AdminProyectos })));
const AdminNosotros = lazy(() => import('./pages/admin/AdminPages').then(module => ({ default: module.AdminNosotros })));
const AdminConfig = lazy(() => import('./pages/admin/AdminPages').then(module => ({ default: module.AdminConfig })));

// Main Sections
const Banner = lazy(() => import('./components/Banner'));
const Services = lazy(() => import('./components/Services'));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const Community = lazy(() => import('./pages/Community'));


const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNavbar />
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
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
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="admin">
              <Route path="inicio" element={<AdminInicio />} />
              <Route path="proyectos" element={<AdminProyectos />} />
              <Route path="nosotros" element={<AdminNosotros />} />
              <Route path="configuracion" element={<AdminConfig />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
