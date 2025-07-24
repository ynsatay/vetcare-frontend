// src/routes/RequireAuth.js
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../context/usercontext.tsx";

const RequireAuth = ({ children }) => {
  const { isLogin } = useContext(AuthContext);
  console.log('RequireAuth isLogin:', isLogin);
  const location = useLocation();

  if (!isLogin) {
    console.log('Redirecting to /landing');
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  return children;
};
export default RequireAuth;
