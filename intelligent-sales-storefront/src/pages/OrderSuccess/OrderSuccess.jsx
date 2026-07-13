import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        padding: "24px",
        textAlign: "center",
        background: "#f4f6fb",
        placeItems: "center",
      }}
    >
      <section>
        <h1>Pedido confirmado</h1>
        <p>
          Su compra ha sido registrada correctamente.
        </p>
        <Link to="/">Volver al catálogo</Link>
      </section>
    </main>
  );
}
