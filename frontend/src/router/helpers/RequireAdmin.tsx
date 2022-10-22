import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdmin } from "../../hooks/pocketbaseHooks";

export const RequireAdmin = () => {
    const admin = useAdmin();
    const location = useLocation();

    return admin ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};
