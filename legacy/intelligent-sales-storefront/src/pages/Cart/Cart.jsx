import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/useCart";
import "./Cart.css";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

function categoryInitial(value) {
  return String(value || "Producto")
    .trim()
    .slice(0, 1)
    .toUpperCase();
}

export default function Cart() {
  const navigate = useNavigate();

  const {
    items,
    totalUnits,
    subtotal,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <main className="cart-page">
      <header className="cart-header">
        <Link to="/" className="cart-brand">
          <span>ISS</span>
          <div>
            <strong>Intelligent Sales</strong>
            <small>Store</small>
          </div>
        </Link>

        <div className="cart-header-progress">
          <strong>1. Carrito</strong>
          <span>2. Checkout</span>
          <span>3. Confirmación</span>
        </div>

        <Link to="/" className="cart-continue-link">
          Seguir comprando
        </Link>
      </header>

      <section className="cart-hero">
        <div>
          <span>Compra online</span>
          <h1>Su carrito de compras</h1>
          <p>
            Revise los productos y cantidades antes de continuar
            con el pago y la confirmación del pedido.
          </p>
        </div>

        <strong>
          {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
        </strong>
      </section>

      {items.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Su carrito está vacío</h2>
          <p>
            Explore nuestro catálogo y añada los productos que
            necesita.
          </p>
          <Link to="/">Explorar catálogo</Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-items-panel">
            <div className="cart-panel-heading">
              <div>
                <span>Productos seleccionados</span>
                <h2>Detalle del carrito</h2>
              </div>

              <button type="button" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>

            <div className="cart-items-list">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-visual">
                    <span>{categoryInitial(item.categoria)}</span>
                    <small>{item.categoria}</small>
                  </div>

                  <div className="cart-item-main">
                    <span>{item.categoria}</span>
                    <h3>{item.nombre}</h3>
                    <small>{money(item.precio)} por unidad</small>

                    <button
                      type="button"
                      className="cart-remove-mobile"
                      onClick={() => removeItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cart-quantity-control">
                    <button
                      type="button"
                      aria-label={`Reducir cantidad de ${item.nombre}`}
                      onClick={() => decrementItem(item.id)}
                    >
                      −
                    </button>

                    <strong>{item.cantidad}</strong>

                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                      onClick={() => incrementItem(item.id)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    <strong>
                      {money(
                        Number(item.precio) *
                          Number(item.cantidad)
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="cart-summary">
            <span>Resumen de compra</span>
            <h2>Total del pedido</h2>

            <div className="cart-summary-lines">
              <div>
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>

              <div>
                <span>Preparación del pedido</span>
                <strong>Incluida</strong>
              </div>

              <div>
                <span>Entrega</span>
                <strong>Se define en checkout</strong>
              </div>
            </div>

            <div className="cart-summary-total">
              <span>Total estimado</span>
              <strong>{money(total)}</strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Continuar al checkout
            </button>

            <Link to="/">Añadir más productos</Link>

            <div className="cart-commercial-note">
              <strong>Pedido protegido</strong>
              <p>
                Después del pago, la plataforma confirmará el
                pedido y mostrará la fecha estimada de recogida o
                entrega.
              </p>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
