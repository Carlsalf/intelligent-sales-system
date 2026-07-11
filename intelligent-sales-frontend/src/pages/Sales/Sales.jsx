import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { canManageCriticalActions } from "../../utils/roles";
import "./Sales.css";

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

const EMPTY_FORM = {
  id_cliente: "",
  id_producto: "",
  cantidad: 1,
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState("todas");
  const [form, setForm] = useState(EMPTY_FORM);

  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [ventasRes, clientesRes, productosRes, meRes] = await Promise.all([
        api.get("/ventas"),
        api.get("/clients"),
        api.get("/products"),
        api.get("/me"),
      ]);

      setSales(normalizeArray(ventasRes.data));
      setClients(normalizeArray(clientesRes.data).filter((client) => Number(client.estado) !== 0));
      setProducts(normalizeArray(productosRes.data).filter((product) => Number(product.estado) !== 0));
      setCurrentUser(meRes.data || null);
    } catch (err) {
      console.error("Error al cargar ventas:", err.response?.data || err.message);
      setError("No se pudieron cargar las ventas. Inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find(
      (product) => String(idOf(product, "id_producto")) === String(form.id_producto)
    );
  }, [products, form.id_producto]);

  const selectedClient = useMemo(() => {
    return clients.find(
      (client) => String(idOf(client, "id_cliente")) === String(form.id_cliente)
    );
  }, [clients, form.id_cliente]);

  const estimatedTotal = Number(selectedProduct?.precio || 0) * Number(form.cantidad || 0);

  const stats = {
    totalSales: sales.length,
    revenue: sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
    averageTicket: sales.length
      ? sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0) / sales.length
      : 0,
    totalItems: sales.reduce((sum, sale) => sum + Number(sale.cantidad_items || 0), 0),
  };

  const filteredSales = useMemo(() => {
    const q = query.toLowerCase().trim();
    const now = new Date();

    const byPeriod = sales.filter((sale) => {
      if (periodFilter === "todas") return true;

      const saleDate = new Date(String(sale.fecha || "").replace(" ", "T"));
      if (Number.isNaN(saleDate.getTime())) return true;

      const diffMs = now.getTime() - saleDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (periodFilter === "hoy") {
        return saleDate.toDateString() === now.toDateString();
      }

      if (periodFilter === "semana") return diffDays <= 7;
      if (periodFilter === "mes") return diffDays <= 31;

      return true;
    });

    if (!q) return byPeriod;

    return byPeriod.filter((sale) =>
      [
        sale.id_venta,
        sale.fecha,
        sale.cliente_nombre,
        sale.total,
        sale.cantidad_items,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [sales, query, periodFilter]);

  function openSaleModal() {
    setForm(EMPTY_FORM);
    setError("");
    setSuccessMessage("");
    setShowSaleModal(true);
  }

  function closeSaleModal() {
    setShowSaleModal(false);
    setForm(EMPTY_FORM);
    setError("");
  }

  function getAvailableStock() {
    return Number(selectedProduct?.stock || 0);
  }

  function updateQuantity(nextValue) {
    const stock = getAvailableStock();
    const value = Number(nextValue || 1);

    if (!selectedProduct) {
      setForm((prev) => ({ ...prev, cantidad: 1 }));
      return;
    }

    const nextQuantity = Math.min(stock, Math.max(1, value));
    setForm((prev) => ({ ...prev, cantidad: nextQuantity }));
  }

  function validateSale() {
    if (!form.id_producto) return "Seleccione un producto para registrar la venta.";

    const cantidad = Number(form.cantidad);
    const stock = getAvailableStock();

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return "La cantidad debe ser un número entero mayor que cero.";
    }

    if (stock <= 0) {
      return "El producto seleccionado no tiene stock disponible.";
    }

    if (cantidad > stock) {
      return `Stock insuficiente. Disponible: ${stock} unidad(es).`;
    }

    return "";
  }

  async function handleCreateSale(event) {
    event.preventDefault();

    const validationError = validateSale();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      id_cliente: form.id_cliente ? Number(form.id_cliente) : null,
      items: [
        {
          id_producto: Number(form.id_producto),
          cantidad: Number(form.cantidad),
        },
      ],
    };

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/ventas", payload);

      await loadData();

      const ventaId = response?.data?.id_venta || "registrada";
      setSuccessMessage(
        `Venta ${ventaId !== "registrada" ? "#" + ventaId : ""} registrada correctamente. Inventario actualizado.`
      );

      setShowSaleModal(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al registrar venta:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || "No fue posible registrar la venta.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelSale(sale) {
    const ok = window.confirm(
      `¿Deseas anular la venta #${sale.id_venta}? Se repondrá el stock asociado.`
    );

    if (!ok) return;

    try {
      setError("");
      setSuccessMessage("");
      await api.put(`/ventas/${sale.id_venta}/anular`);
      await loadData();
      setSuccessMessage(`Venta #${sale.id_venta} anulada correctamente. Inventario repuesto.`);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al anular venta:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || "No fue posible anular la venta.");
    }
  }

  async function openSaleDetail(sale) {
    try {
      setLoadingDetail(true);
      setError("");
      setSelectedSale(null);
      setShowDetailModal(true);

      const response = await api.get(`/ventas/${sale.id_venta}`);
      setSelectedSale(response.data);
    } catch (err) {
      console.error("Error al consultar detalle:", err.response?.data || err.message);
      setError("No se pudo cargar el detalle de la venta.");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  }

  const stockStatus = (() => {
    const stock = getAvailableStock();
    if (!selectedProduct) return "";
    if (stock === 0) return "Producto agotado";
    if (stock <= 5) return "Stock bajo";
    return "Disponible";
  })();

  return (
    <main className="sales-page">
      <p className="module-kicker">Ventas · Facturación · Seguimiento comercial</p>
      <h1>Gestión de Ventas</h1>
      <p className="module-description">
        Registre las ventas realizadas, supervise la facturación y consulte el detalle
        de cada operación comercial para apoyar la toma de decisiones.
      </p>

      <div className="module-actions">
        <button className="primary-button" onClick={openSaleModal}>
          Nueva venta
        </button>
        <button className="secondary-button" onClick={loadData} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar ventas"}
        </button>
      </div>

      {successMessage && <div className="toast-success">{successMessage}</div>}
      {error && !showSaleModal && <p className="form-error">{error}</p>}

      <div className="module-stats">
        <article className="stat-card">
          <span>Ventas registradas</span>
          <strong>{loading ? "…" : stats.totalSales}</strong>
          <small>Operaciones comerciales</small>
        </article>

        <article className="stat-card">
          <span>Facturación acumulada</span>
          <strong>{loading ? "…" : money(stats.revenue)}</strong>
          <small>Ingresos registrados</small>
        </article>

        <article className="stat-card">
          <span>Ticket promedio</span>
          <strong>{loading ? "…" : money(stats.averageTicket)}</strong>
          <small>Valor medio por venta</small>
        </article>

        <article className="stat-card">
          <span>Productos vendidos</span>
          <strong>{loading ? "…" : stats.totalItems}</strong>
          <small>Items comercializados</small>
        </article>
      </div>

      <div className="module-toolbar">
        <input
          placeholder="Buscar por cliente, fecha o número de venta..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="segmented-filter" aria-label="Filtro de ventas">
          <button
            type="button"
            className={periodFilter === "todas" ? "active" : ""}
            onClick={() => setPeriodFilter("todas")}
          >
            Todas las ventas
          </button>
          <button
            type="button"
            className={periodFilter === "hoy" ? "active" : ""}
            onClick={() => setPeriodFilter("hoy")}
          >
            Ventas de hoy
          </button>
          <button
            type="button"
            className={periodFilter === "semana" ? "active" : ""}
            onClick={() => setPeriodFilter("semana")}
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            className={periodFilter === "mes" ? "active" : ""}
            onClick={() => setPeriodFilter("mes")}
          >
            Últimos 31 días
          </button>
        </div>
      </div>

      <div className="results-summary">
        Mostrando {filteredSales.length} venta(s)
        {periodFilter === "hoy" ? " de hoy" : ""}
        {periodFilter === "semana" ? " de los últimos 7 días" : ""}
        {periodFilter === "mes" ? " de los últimos 31 días" : ""}
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {loading ? "Cargando ventas..." : "No se encontraron ventas registradas."}
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id_venta}>
                  <td>#{sale.id_venta}</td>
                  <td>{sale.fecha || "No registrado"}</td>
                  <td>{sale.cliente_nombre || "Venta sin cliente asociado"}</td>
                  <td>{Number(sale.cantidad_items || 0)}</td>
                  <td>{money(sale.total)}</td>
                  <td>
                    <span className={`status-badge ${Number(sale.estado) === 0 ? "status-neutral" : "status-success"}`}>
                      {Number(sale.estado) === 0 ? "Anulada" : "Confirmada"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="secondary-button" onClick={() => openSaleDetail(sale)}>
                        Ver detalle
                      </button>
                      {Number(sale.estado) !== 0 && canManageCriticalActions(currentUser) && (
                        <button className="danger-button" onClick={() => handleCancelSale(sale)}>
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSaleModal && (
        <div className="modal-backdrop">
          <div className="modal-card sales-modal-card">
            <div className="modal-header">
              <div>
                <span>Registro comercial</span>
                <h2>Nueva venta</h2>
              </div>
              <button type="button" onClick={closeSaleModal}>×</button>
            </div>

            <form className="entity-form" onSubmit={handleCreateSale}>
              <label>
                Cliente
                <select
                  value={form.id_cliente}
                  onChange={(event) => setForm({ ...form, id_cliente: event.target.value })}
                >
                  <option value="">Venta sin cliente asociado</option>
                  {clients.map((client) => (
                    <option key={idOf(client, "id_cliente")} value={idOf(client, "id_cliente")}>
                      {client.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Producto
                <select
                  value={form.id_producto}
                  onChange={(event) => setForm({ ...form, id_producto: event.target.value, cantidad: 1 })}
                  required
                >
                  <option value="">Seleccione producto</option>
                  {products.map((product) => (
                    <option
                      key={idOf(product, "id_producto")}
                      value={idOf(product, "id_producto")}
                      disabled={Number(product.stock || 0) <= 0}
                    >
                      {product.nombre} · {money(product.precio)} · {Number(product.stock || 0)} disponible(s)
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cantidad
                <div className="quantity-stepper">
                  <button
                    type="button"
                    onClick={() => updateQuantity(Number(form.cantidad) - 1)}
                    disabled={!selectedProduct || Number(form.cantidad) <= 1}
                  >
                    −
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.cantidad}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (/^\d{0,4}$/.test(value)) updateQuantity(value);
                    }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => updateQuantity(Number(form.cantidad) + 1)}
                    disabled={!selectedProduct || Number(form.cantidad) >= getAvailableStock()}
                  >
                    +
                  </button>
                </div>
              </label>

              <div className="sale-summary-card">
                <span>Resumen de la operación</span>
                <p><strong>Cliente:</strong> {selectedClient?.nombre || "Venta sin cliente asociado"}</p>
                <p><strong>Producto:</strong> {selectedProduct?.nombre || "Producto no seleccionado"}</p>
                <p><strong>Precio unitario:</strong> {money(selectedProduct?.precio)}</p>
                <p><strong>Stock disponible:</strong> {Number(selectedProduct?.stock || 0)} unidad(es)</p>
                {selectedProduct && (
                  <p>
                    <strong>Disponibilidad:</strong>{" "}
                    <span className={`status-badge ${
                      getAvailableStock() === 0
                        ? "status-empty"
                        : getAvailableStock() <= 5
                          ? "status-warning"
                          : "status-success"
                    }`}>
                      {stockStatus}
                    </span>
                  </p>
                )}
                <div className="sale-total-line">
                  <strong>Total estimado</strong>
                  <strong>{money(estimatedTotal)}</strong>
                </div>
              </div>

              {error && showSaleModal && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={closeSaleModal} disabled={saving}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving || !selectedProduct || getAvailableStock() <= 0}
                >
                  {saving ? "Registrando..." : "Registrar venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="modal-backdrop">
          <div className="modal-card sales-modal-card">
            <div className="modal-header">
              <div>
                <span>Detalle de venta</span>
                <h2>{selectedSale ? `Venta #${selectedSale.id_venta}` : "Consultando venta"}</h2>
              </div>
              <button type="button" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            {loadingDetail || !selectedSale ? (
              <p className="module-description">Cargando detalle comercial...</p>
            ) : (
              <>
                <div className="sale-detail-grid">
                  <article>
                    <span>Cliente</span>
                    <strong>{selectedSale.cliente_nombre || "Venta sin cliente asociado"}</strong>
                  </article>
                  <article>
                    <span>Fecha</span>
                    <strong>{selectedSale.fecha}</strong>
                  </article>
                  <article>
                    <span>Total</span>
                    <strong>{money(selectedSale.total)}</strong>
                  </article>
                </div>

                <div className="table-card compact-table-card">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.detalles?.map((item) => (
                        <tr key={item.id_detalle}>
                          <td>{item.producto_nombre}</td>
                          <td>{item.cantidad}</td>
                          <td>{money(item.precio_unitario)}</td>
                          <td>{money(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}