import { Route, Routes } from "react-router-dom";

import { DashboardPage } from "../pages/dashboard";
import { IndexPage } from "../pages";
import { LoginPage } from "../pages/login";
import { RequireAdmin } from "./helpers/RequireAdmin";
import { RequireNoAdmin } from "./helpers/RequireNoAdmin";

export const AppRouter = () => {
    return (
        <Routes>
            <Route element={<RequireNoAdmin />}>
                <Route path="/" element={<IndexPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<RequireAdmin />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
        </Routes>
    );
};
