// components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('user-token');
  return token ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;