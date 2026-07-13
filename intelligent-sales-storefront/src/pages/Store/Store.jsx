import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/useCart";
import {
  fetchStoreCategories,
  fetchStoreProduct,
  fetchStoreProducts,
} from "../../services/storeApi";
import "./Store.css";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

function categoryInitial(value) {
  return String(value || "Producto")
    .trim()
    .slice(0, 1)
    .toUpperCase();
}

export default function Store() {
  const navigate = useNavigate();

  const {
    items,
    totalUnits,
    subtotal,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const result = await fetchStoreCategories();

        if (!cancelled) {
          setCategories(result.categories || []);
        }
      } catch (requestError) {
        console.error(
          "No fue posible cargar las categorías:",
          requestError.response?.data || requestError.message
        );
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const result = await fetchStoreProducts({
          search: appliedSearch,
          category: selectedCategory,
        });

        if (!cancelled) {
          setProducts(result.products || []);
          setError("");
        }
      } catch (requestError) {
        console.error(
          "No fue posible cargar el catálogo:",
          requestError.response?.data || requestError.message
        );

        if (!cancelled) {
          setProducts([]);
          setError(
            "No fue posible cargar el catálogo. Compruebe que la API esté activa."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, selectedCategory]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  function submitSearch(event) {
    event.preventDefault();
    setLoading(true);
    setAppliedSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setSelectedCategory("");
    setLoading(true);
  }

  async function openProduct(productId) {
    try {
      setLoadingProduct(true);
      setSelectedQuantity(1);

      const product = await fetchStoreProduct(productId);
      setSelectedProduct(product);
    } catch (requestError) {
      console.error(
        "No fue posible cargar el producto:",
        requestError.response?.data || requestError.message
      );
      setError("No fue posible abrir el detalle del producto.");
    } finally {
      setLoadingProduct(false);
    }
  }

  function confirmAdd(product, quantity = 1) {
    addItem(product, quantity);
    setToast(
      `${product.nombre} · ${quantity} ${
        quantity === 1 ? "unidad añadida" : "unidades añadidas"
      }`
    );
  }

  function addFromCard(product) {
    confirmAdd(product, 1);
  }

  function addFromModal() {
    if (!selectedProduct) return;

    confirmAdd(selectedProduct, selectedQuantity);
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setCartOpen(true);
  }

  return (
    <main className="store-page">
      <header className="store-header">
        <button
          type="button"
          className="store-brand"
          onClick={clearFilters}
        >
          <span className="store-brand-mark">ISS</span>

          <span>
            <strong>Intelligent Sales</strong>
            <small>Store</small>
          </span>
        </button>

        <form className="store-search" onSubmit={submitSearch}>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar productos, categorías y materiales"
            aria-label="Buscar productos"
          />

          <button type="submit">Buscar</button>
        </form>

        <button
          type="button"
          className="store-cart-button"
          onClick={() => setCartOpen(true)}
        >
          <span>Carrito</span>
          <strong>{totalUnits}</strong>
          <small>{money(subtotal)}</small>
        </button>
      </header>

      <section className="store-hero">
        <div>
          <span className="store-kicker">
            Comercio integrado · Compra segura · Atención programada
          </span>

          <h1>
            Productos textiles para empresas, profesionales y clientes.
          </h1>

          <p>
            Seleccione los productos que necesita. Después del pago, la
            plataforma confirmará su pedido y comunicará la fecha estimada de
            recogida o entrega.
          </p>

          <div className="store-hero-actions">
            <button type="button" onClick={clearFilters}>
              Explorar catálogo
            </button>

            <span>
              Añada productos y continúe comprando antes de finalizar el pedido.
            </span>
          </div>
        </div>

        <aside className="store-promise-card">
          <strong>Compra protegida</strong>

          <p>
            La plataforma procesa internamente la preparación de cada pedido y
            muestra al cliente únicamente la fecha estimada de atención.
          </p>

          <div>
            <span>✓ Pago validado</span>
            <span>✓ Pedido confirmado</span>
            <span>✓ Seguimiento comercial</span>
          </div>
        </aside>
      </section>

      <section className="store-category-strip">
        <button
          type="button"
          className={!selectedCategory ? "active" : ""}
          onClick={() => {
            setLoading(true);
            setSelectedCategory("");
          }}
        >
          Todos
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={
              String(selectedCategory) === String(category.id)
                ? "active"
                : ""
            }
            onClick={() => {
              setLoading(true);
              setSelectedCategory(String(category.id));
            }}
          >
            <span>{category.nombre}</span>
            <small>{category.cantidad_productos}</small>
          </button>
        ))}
      </section>

      <section className="store-content">
        <div className="store-section-heading">
          <div>
            <span>Catálogo comercial</span>

            <h2>
              {appliedSearch
                ? `Resultados para “${appliedSearch}”`
                : "Productos disponibles para compra"}
            </h2>
          </div>

          <strong>
            {loading ? "Actualizando…" : `${products.length} productos`}
          </strong>
        </div>

        {error && <p className="store-error">{error}</p>}

        {loading ? (
          <div className="store-loading">
            <span></span>
            <p>Cargando catálogo comercial…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="store-empty">
            <strong>No encontramos productos</strong>
            <p>Pruebe con otra búsqueda o categoría.</p>

            <button type="button" onClick={clearFilters}>
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="store-grid">
            {products.map((product) => (
              <article className="store-product-card" key={product.id}>
                <button
                  type="button"
                  className="store-product-image"
                  onClick={() => openProduct(product.id)}
                >
                  <span>{categoryInitial(product.categoria)}</span>
                  <small>{product.categoria}</small>
                </button>

                <div className="store-product-info">
                  <span className="store-product-category">
                    {product.categoria}
                  </span>

                  <h3>{product.nombre}</h3>

                  <div className="store-product-price">
                    <strong>{money(product.precio)}</strong>
                    <small>Precio unitario</small>
                  </div>

                  <div className="store-product-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => openProduct(product.id)}
                    >
                      Ver detalle
                    </button>

                    <button
                      type="button"
                      className="primary"
                      onClick={() => addFromCard(product)}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="store-footer">
        <div>
          <strong>Intelligent Sales System</strong>
          <p>
            Plataforma empresarial modular con comercio electrónico y
            cumplimiento inteligente de pedidos.
          </p>
        </div>

        <span>Storefront V2.0 · Web · Mobile · iOS · Android</span>
      </footer>

      {toast && (
        <div className="store-toast" role="status">
          <span>✓</span>
          <div>
            <strong>Producto añadido</strong>
            <small>{toast}</small>
          </div>
          <button type="button" onClick={() => setCartOpen(true)}>
            Ver carrito
          </button>
        </div>
      )}

      {(selectedProduct || loadingProduct) && (
        <div
          className="store-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedProduct(null)}
        >
          <article
            className="store-product-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="store-modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            {loadingProduct && !selectedProduct ? (
              <div className="store-loading">
                <span></span>
                <p>Cargando producto…</p>
              </div>
            ) : (
              <>
                <div className="store-modal-visual">
                  <span>
                    {categoryInitial(selectedProduct?.categoria)}
                  </span>
                  <small>{selectedProduct?.categoria}</small>
                </div>

                <div className="store-modal-content">
                  <span>{selectedProduct?.categoria}</span>
                  <h2>{selectedProduct?.nombre}</h2>

                  <p>
                    Seleccione la cantidad. La fecha estimada de atención será
                    confirmada después del pago.
                  </p>

                  <strong>{money(selectedProduct?.precio)}</strong>

                  <div className="store-modal-quantity">
                    <span>Cantidad</span>

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuantity((value) =>
                            Math.max(1, value - 1)
                          )
                        }
                      >
                        −
                      </button>

                      <strong>{selectedQuantity}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuantity((value) => value + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="store-modal-total">
                    <span>Subtotal</span>
                    <strong>
                      {money(
                        Number(selectedProduct?.precio || 0) *
                          selectedQuantity
                      )}
                    </strong>
                  </div>

                  <button type="button" onClick={addFromModal}>
                    Añadir {selectedQuantity} al carrito
                  </button>
                </div>
              </>
            )}
          </article>
        </div>
      )}

      {cartOpen && (
        <div
          className="store-drawer-backdrop"
          role="presentation"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="store-cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>Compra en curso</span>
                <h2>Su carrito</h2>
              </div>

              <button
                type="button"
                aria-label="Cerrar carrito"
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </header>

            {items.length === 0 ? (
              <div className="store-drawer-empty">
                <strong>El carrito está vacío</strong>
                <p>Añada productos para comenzar su pedido.</p>

                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                >
                  Explorar catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="store-drawer-items">
                  {items.map((item) => (
                    <article key={item.id}>
                      <div className="store-drawer-item-visual">
                        {categoryInitial(item.categoria)}
                      </div>

                      <div className="store-drawer-item-main">
                        <span>{item.categoria}</span>
                        <strong>{item.nombre}</strong>
                        <small>{money(item.precio)} por unidad</small>

                        <div className="store-drawer-quantity">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.id)}
                          >
                            −
                          </button>

                          <strong>{item.cantidad}</strong>

                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                          >
                            +
                          </button>

                          <button
                            type="button"
                            className="remove"
                            onClick={() => removeItem(item.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <strong className="store-drawer-item-total">
                        {money(
                          Number(item.precio) *
                            Number(item.cantidad)
                        )}
                      </strong>
                    </article>
                  ))}
                </div>

                <footer>
                  <div>
                    <span>{totalUnits} unidades</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <button
                    type="button"
                    className="store-drawer-primary"
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/cart");
                    }}
                  >
                    Revisar carrito
                  </button>

                  <button
                    type="button"
                    className="store-drawer-secondary"
                    onClick={() => setCartOpen(false)}
                  >
                    Continuar comprando
                  </button>
                </footer>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
