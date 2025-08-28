import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import HomePage from './HomePage';
import AddProduct from './admin/AddProduct';
import SignIn from './SignIn';
import SignUp from './SignUp';
import NotFound from './NotFound';
import EditProduct from './admin/EditProduct';
import ProductDetails from './ProductDetails';
import CartDetails from './CartDetails';
import Profile from './Profile';

const RoutesManage =()=>{
    return(
        <>
        <Router>
          <Routes>
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/addproduct" element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            } />
            <Route path="/editproduct/:pid" element={
              <PrivateRoute>
                <EditProduct />
              </PrivateRoute>
            } />
            <Route path="/product/:pid" element={
              <PrivateRoute>
                <ProductDetails />
              </PrivateRoute>
            } />
            <Route path="/cart" element={
              <PrivateRoute>
                <CartDetails />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        </>
    )
}
export default RoutesManage;