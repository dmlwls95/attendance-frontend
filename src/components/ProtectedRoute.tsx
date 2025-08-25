import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../services/TokenManagementService";

interface ProtectedRouteProps {
    children: JSX.Element;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole} : ProtectedRouteProps)
{
    const token = getAuthToken();
    const role = localStorage.getItem("role");
    if(!token)
    {
        return <Navigate to="/" replace />
    }

    if(requiredRole && role !== requiredRole)
    {
        return <Navigate to="/" replace />
    }


    return children;
}