import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Loading from "../components/Loading/Loading";
import AccessibilityToolbar from "../components/AccessibilityToolbar/AccessibilityToolbar";
import ProjectAssistant from "../components/ProjectAssistant/ProjectAssistant";

import LandingPage from "../pages/LandingPage/LandingPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Unidades from "../pages/Unidades/Unidades";
import ProfissionalDashboard from "../pages/ProfissionalDashboard/ProfissionalDashboard";
import Login from "../pages/Login/Login";
import Cadastro from "../pages/Cadastro/Cadastro";
import ProfissionalLogin from "../pages/ProfissionalLogin/ProfissionalLogin";
import NavbarGuidelines from "../pages/NavbarGuidelines/NavbarGuidelines";

function AppContent() {
    const location = useLocation();
    const isNavbarGuidelines = location.pathname === "/navbar-guidelines";

    return (
        <>
            {!isNavbarGuidelines && (
                <>
                    <AccessibilityToolbar />
                    <ProjectAssistant />
                </>
            )}
            <Routes>
                <Route 
                    path="/" 
                    element={<Navigate to="/landingpage" replace />}
                />


                <Route
                    path="/loading"
                    element={<Loading />}
                />

                <Route
                    path="/landingpage"
                    element={<LandingPage />}
                />
                <Route
                    path="/navbar-guidelines"
                    element={<NavbarGuidelines />}
                />

                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/profissional/login" element={<ProfissionalLogin />} />
                <Route path="/profissional/dashboard" element={<ProfissionalDashboard />} />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                    path="/agendamentos"
                    element={<Dashboard initialTab="agendamentos" />}
                />
                <Route
                    path="/Unidades"
                    element={<Unidades />}
                />

                <Route path="*" element={<Navigate to="/landingpage" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;