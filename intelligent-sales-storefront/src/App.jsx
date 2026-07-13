import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Store from "./pages/Store/Store";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import { useCart } from "./context/useCart";

function CheckoutGuard() {
  const { items } = useCart();

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return <Checkout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Store />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<CheckoutGuard />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
