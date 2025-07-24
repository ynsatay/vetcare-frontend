import { useContext } from 'react';
import AuthContext from '../context/usercontext.tsx';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const { isLogin } = useContext(AuthContext);
  const location = useLocation();

  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
