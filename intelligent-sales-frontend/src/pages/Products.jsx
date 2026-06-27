import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}


function productStatus(product) {
  const stock = Number(product?.stock || 0);

  if (product?.estado === 0) {
    return { label: "Inactivo", className: "inactive" };
  }

  if (stock === 0) {
    return { label: "Sin stock", className: "critical" };
  }

  if (stock <= 5) {
    return { label: "Stock bajo", className: "warning" };
  }

  return { label: "En stock", className: "active" };
}

function normalizeArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    id_categoria: "",
    precio: "",
    stock: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/productos"),
        api.get("/categorias"),
      ]);

      setProducts(normalizeArray(productsRes.data, "productos"));
      setCategories(normalizeArray(categoriesRes.data, "categorias"));
    } catch {
      setError("No se pudieron cargar los productos desde la API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();

    const ordered = [...products].sort((a, b) => {
      const categoryCompare = String(a.categoria_nombre || "").localeCompare(
        String(b.categoria_nombre || ""),
        "es"
      );

      if (categoryCompare !== 0) return categoryCompare;

      return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
    });

    if (!q) return ordered;

    return ordered.filter((p) =>
      [p.nombre, p.categoria_nombre, p.precio, p.stock, p.estado]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, query]);

  const totalStock = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const inventoryValue = products.reduce(
    (acc, p) => acc + Number(p.stock || 0) * Number(p.precio || 0),
    0
  );
  const lowStock = products.filter((p) => Number(p.stock || 0) <= 5).length;

  async function handleCreateProduct(e) {
    e.preventDefault();

    const nombre = form.nombre.trim();
    const id_categoria = Number(form.id_categoria);
    const precio = Number(form.precio);
    const stock = Number(form.stock);

    if (!nombre || !id_categoria || precio < 0 || stock < 0) {
      setError("Completa nombre, categoría, precio y stock con valores válidos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/productos", {
        nombre,
        id_categoria,
        precio,
        stock,
      });

      const id = response?.data?.id_producto || "registrado";

      setShowModal(false);
      setForm({ nombre: "", id_categoria: "", precio: "", stock: "" });
      setSuccessMessage(
        `Producto ${id !== "registrado" ? "#" + id : ""} creado correctamente. Catálogo e inventario actualizados.`
      );

      await loadData();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "No se pudo crear el producto.";
      setError(`Operación no completada: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="module-page">
      <section className="module-panel">
        <header className="module-header">
          <div>
            <div className="module-eyebrow">
              Catálogo comercial · SQLite → API REST → React
            </div>
            <h1>Gestión de Productos</h1>
            <p>
              Administración del catálogo comercial, precios, categorías y stock
              disponible para alimentar ventas, inventario y analítica.
            </p>
          </div>

          <div className="module-actions">
            <button className="primary-btn" onClick={() => setShowModal(true)}>
              Nuevo producto
            </button>
            <button className="dark-btn" onClick={() => navigate("/dashboard")}>
              Volver
            </button>
          </div>
        </header>

        {error && <div className="soft-alert">{error}</div>}
        {successMessage && <div className="success-alert">{successMessage}</div>}

        <section className="module-kpis">
          <article className="module-kpi">
            <span>Productos activos</span>
            <strong>{loading ? "…" : products.length}</strong>
            <small>Catálogo disponible</small>
          </article>

          <article className="module-kpi">
            <span>Stock total</span>
            <strong>{loading ? "…" : totalStock}</strong>
            <small>Unidades inventariadas</small>
          </article>

          <article className="module-kpi">
            <span>Valor estimado</span>
            <strong>{loading ? "…" : money(inventoryValue)}</strong>
            <small>Precio × stock</small>
          </article>

          <article className="module-kpi">
            <span>Stock bajo</span>
            <strong>{loading ? "…" : lowStock}</strong>
            <small>Umbral operativo ≤ 5</small>
          </article>
        </section>

        <div className="module-toolbar">
          <input
            className="module-search"
            placeholder="Buscar por producto, categoría, precio o stock..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="ghost-btn" onClick={loadData} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <section className="availability-legend compact-legend">
          <span className="legend-title">Disponibilidad:</span>
          <span className="legend-dot legend-ok-dot"></span>
          <span>En stock &gt; 5</span>
          <span className="legend-separator">·</span>
          <span className="legend-dot legend-warning-dot"></span>
          <span>Bajo 1–5</span>
          <span className="legend-separator">·</span>
          <span className="legend-dot legend-critical-dot"></span>
          <span>Sin stock 0</span>
        </section>

        <section className="module-table-card">
          <table className="professional-table products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Disponibilidad</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    {loading
                      ? "Cargando productos desde la API..."
                      : "No se encontraron productos."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id_producto}>
                    <td className="strong-cell truncate-cell" title={p.nombre}>
                      {p.nombre}
                    </td>
                    <td className="truncate-cell" title={p.categoria_nombre}>
                      {p.categoria_nombre || "Sin categoría"}
                    </td>
                    <td className="amount-cell">{money(p.precio)}</td>
                    <td>
                      <span
                        className={
                          Number(p.stock || 0) <= 5
                            ? "stock-pill low"
                            : "stock-pill ok"
                        }
                      >
                        {p.stock} unidad(es)
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${productStatus(p).className}`}>
                        {productStatus(p).label}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <form className="sales-modal refined-modal" onSubmit={handleCreateProduct}>
            <div className="modal-head">
              <h2>Nuevo producto</h2>
              <p>
                Registra un producto persistido en SQLite para ser utilizado por
                ventas, inventario y analítica comercial.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Nombre del producto</label>
                <input
                  className="clean-input"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  placeholder="Ej. Aceite vegetal"
                  required
                />
              </div>

              <div className="form-field">
                <label>Categoría</label>
                <select
                  className="clean-select"
                  value={form.id_categoria}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      id_categoria: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-two-cols">
                <div className="form-field">
                  <label>Precio</label>
                  <input
                    className="clean-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, precio: e.target.value }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Stock inicial</label>
                  <input
                    className="clean-input"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions compact-actions">
              <button
                type="button"
                className="dark-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>

              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Guardando..." : "Guardar producto"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
