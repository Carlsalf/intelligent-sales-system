import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function money(value) {
  return `€ ${Number(value || 0).toFixed(2)}`;
}

function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.ventas)) return data.ventas;
  if (Array.isArray(data?.sales)) return data.sales;
  if (Array.isArray(data?.clientes)) return data.clientes;
  if (Array.isArray(data?.productos)) return data.productos;
  return [];
}

function idOf(row, key) {
  return row?.[key] ?? row?.id;
}

export default function Sales() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    id_cliente: "",
    id_producto: "",
    cantidad: 1,
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const [ventasRes, clientesRes, productosRes] = await Promise.all([
        api.get("/ventas"),
        api.get("/clientes"),
        api.get("/productos"),
      ]);

      setSales(normalizeArray(ventasRes.data));
      setClients(normalizeArray(clientesRes.data));
      setProducts(normalizeArray(productosRes.data));
    } catch (e) {
      const status = e?.response?.status;
      setError(
        status === 401 || status === 403
          ? "Sesión expirada o token JWT no válido. Inicia sesión nuevamente."
          : "No se pudieron cargar los datos comerciales desde la API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find(
      (p) => String(idOf(p, "id_producto")) === String(form.id_producto)
    );
  }, [products, form.id_producto]);

  const estimatedTotal =
    Number(selectedProduct?.precio || 0) * Number(form.cantidad || 0);

  const filteredSales = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sales;

    return sales.filter((sale) =>
      [
        sale.id_venta,
        sale.fecha,
        sale.cliente_nombre,
        sale.total,
        sale.estado,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [sales, query]);

  const totalAmount = sales.reduce(
    (acc, sale) => acc + Number(sale.total || 0),
    0
  );

  const averageSale = sales.length ? totalAmount / sales.length : 0;

  function getAvailableStock() {
    return Number(selectedProduct?.stock || 1);
  }

  function updateQuantity(nextValue) {
    const stock = getAvailableStock();
    const value = Math.min(stock, Math.max(1, Number(nextValue || 1)));
    setForm((prev) => ({ ...prev, cantidad: value }));
  }

  async function handleCreateSale(e) {
    e.preventDefault();

    const id_producto = Number(form.id_producto);
    const cantidad = Number(form.cantidad);
    const id_cliente = form.id_cliente ? Number(form.id_cliente) : null;

    const stockDisponible = Number(selectedProduct?.stock || 0);

    if (!id_producto || cantidad <= 0) {
      setError("Selecciona producto y cantidad válida.");
      return;
    }

    if (cantidad > stockDisponible) {
      setError(`Stock insuficiente. Disponible: ${stockDisponible} unidad(es).`);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/ventas", {
        id_cliente,
        items: [{ id_producto, cantidad }],
      });

      setShowModal(false);
      setForm({ id_cliente: "", id_producto: "", cantidad: 1 });

      const ventaId =
        response?.data?.id_venta ||
        response?.data?.venta?.id_venta ||
        response?.data?.id ||
        "registrada";

      setSuccessMessage(
        `Venta ${ventaId !== "registrada" ? "#" + ventaId : ""} registrada correctamente. Total: ${money(
          estimatedTotal
        )}. Inventario validado.`
      );

      await loadData();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "No se pudo registrar la venta.";

      setError(`Operación no completada: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="sales-page">
      <section className="sales-panel">
        <header className="sales-header">
          <div>
            <div className="sales-eyebrow">
              Módulo comercial · SQLite → API REST → React
            </div>

            <h1>Gestión de Ventas</h1>

            <p>
              Registro y supervisión de operaciones comerciales persistidas en
              SQLite. Estos datos alimentan el módulo de Analítica Comercial.
            </p>
          </div>

          <div className="sales-actions">
            <button className="primary-btn" onClick={() => setShowModal(true)}>
              Nueva venta
            </button>

            <button className="dark-btn" onClick={() => navigate("/dashboard")}>
              Volver
            </button>
          </div>
        </header>

        {error && <div className="soft-alert">{error}</div>}
        {successMessage && <div className="success-alert">{successMessage}</div>}

        <section className="sales-kpis">
          <article className="sales-kpi">
            <span>Ventas registradas</span>
            <strong>{loading ? "…" : sales.length}</strong>
            <small>Operaciones activas desde API</small>
          </article>

          <article className="sales-kpi">
            <span>Importe total</span>
            <strong>{loading ? "…" : money(totalAmount)}</strong>
            <small>Facturación acumulada</small>
          </article>

          <article className="sales-kpi">
            <span>Venta promedio</span>
            <strong>{loading ? "…" : money(averageSale)}</strong>
            <small>Ticket medio comercial</small>
          </article>
        </section>

        <div className="sales-toolbar">
          <input
            className="sales-search"
            placeholder="Buscar por cliente, fecha o código de venta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="ghost-btn" onClick={loadData} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <section className="sales-table-card">
          <table>
            <thead>
              <tr>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    {loading
                      ? "Cargando ventas desde la API..."
                      : "No se encontraron ventas registradas."}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id_venta}>
                    <td className="sale-code">#{sale.id_venta}</td>
                    <td>{sale.fecha || "No registrado"}</td>
                    <td>{sale.cliente_nombre || "Cliente no registrado"}</td>
                    <td className="amount-cell">{money(sale.total)}</td>
                    <td>
                      <span
                        className={
                          sale.estado === 0
                            ? "status-pill inactive"
                            : "status-pill active"
                        }
                      >
                        {sale.estado === 0 ? "Inactiva" : "Activa"}
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
          <form className="sales-modal refined-modal" onSubmit={handleCreateSale}>
            <div className="modal-head">
              <h2>Nueva venta</h2>
              <p>
                Registra una venta persistida en SQLite y utilizada por el
                módulo de Analítica Comercial.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Cliente</label>
                <select
                  className="clean-select"
                  value={form.id_cliente}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      id_cliente: e.target.value,
                    }))
                  }
                >
                  <option value="">Cliente no registrado</option>
                  {clients.map((c) => (
                    <option
                      key={idOf(c, "id_cliente")}
                      value={idOf(c, "id_cliente")}
                    >
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Producto</label>
                <select
                  className="clean-select"
                  value={form.id_producto}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      id_producto: e.target.value,
                      cantidad: 1,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((p) => (
                    <option
                      key={idOf(p, "id_producto")}
                      value={idOf(p, "id_producto")}
                    >
                      {p.nombre} · {money(p.precio)} · stock {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Cantidad</label>

                <div className="stock-note">
                  Stock disponible: <strong>{Number(selectedProduct?.stock || 0)}</strong> unidad(es)
                </div>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() => updateQuantity(Number(form.cantidad) - 1)}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={Number(selectedProduct?.stock || 1)}
                    value={form.cantidad}
                    onChange={(e) => updateQuantity(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => updateQuantity(Number(form.cantidad) + 1)}
                    disabled={Number(form.cantidad) >= Number(selectedProduct?.stock || 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-total compact-total">
              <span>Total estimado</span>
              <strong>{money(estimatedTotal)}</strong>
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
                {saving ? "Registrando..." : "Registrar venta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
