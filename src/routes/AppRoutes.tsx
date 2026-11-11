import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loading from "../components/Loading/Loading";
import AccessibilityToolbar from "../components/AccessibilityToolbar/AccessibilityToolbar";

import LandingPage from "../pages/LandingPage/LandingPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Unidades from "../pages/Unidades/Unidades";
import ProfissionalDashboard from "../pages/ProfissionalDashboard/ProfissionalDashboard";

function App() {
    return (
        <BrowserRouter>
            <AccessibilityToolbar />
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

                <Route path="/login" element={<Navigate to="/landingpage" replace />} />
                <Route path="/cadastro" element={<Navigate to="/landingpage" replace />} />
                <Route path="/profissional/login" element={<Navigate to="/profissional/dashboard" replace />} />
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
            </Routes>

        </BrowserRouter>
    );
}

export default App;