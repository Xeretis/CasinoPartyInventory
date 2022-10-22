import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdmin } from "../../hooks/pocketbaseHooks";

export const RequireNoAdmin = () => {
    const admin = useAdmin();
    const location = useLocation();

    return admin ? <Navigate to="/dashboard" state={{ from: location }} replace /> : <Outlet />;
};
