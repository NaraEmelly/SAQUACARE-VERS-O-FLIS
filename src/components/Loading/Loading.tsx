import "./Loading.css";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Loading() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const destino = location.state?.destino || "/landingpage";

        const timer = setTimeout(() => {
            navigate(destino, {
                replace: true,
            });
        }, 1500);

        return () => clearTimeout(timer);
    }, [navigate, location]);

    return (
        <div className="splash-container">

            <div className="logo-area">
                <div className="spinner">

                    <div className="dot1"></div>
                    <div className="dot2"></div>
                    <div className="dot3"></div>
                </div>

            </div>

        </div>
    );
}

export default Loading;