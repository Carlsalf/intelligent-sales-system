import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

export default function Checkout() {
  const { items, subtotal } = useCart();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        background: "#f4f6fb",
        color: "#172033",
      }}
    >
      <section
        style={{
          width: "min(760px, 100%)",
          margin: "0 auto",
          padding: "36px",
          background: "white",
          borderRadius: "20px",
          border: "1px solid #e1e6ef",
        }}
      >
        <span>Checkout eCommerce</span>
        <h1>Confirmación de compra</h1>

        <p>
          Productos seleccionados: <strong>{items.length}</strong>
        </p>

        <p>
          Total estimado: <strong>{money(subtotal)}</strong>
        </p>

        <p>
          En el siguiente sprint conectaremos esta pantalla con
          dirección, tipo de entrega, pago y Fulfillment Engine.
        </p>

        <Link to="/cart">Volver al carrito</Link>
      </section>
    </main>
  );
}
