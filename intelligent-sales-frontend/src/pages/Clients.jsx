import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function normalizeArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

export default function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clientes");
      setClients(normalizeArray(response.data, "clientes"));
    } catch {
      setError("No se pudieron cargar los clientes desde la API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredClients = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return clients;

    return clients.filter((c) =>
      [c.nombre, c.documento, c.telefono, c.email, c.estado]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, query]);

  const activeClients = clients.filter((c) => c.estado !== 0).length;
  const withEmail = clients.filter((c) => Boolean(c.email)).length;
  const withPhone = clients.filter((c) => Boolean(c.telefono)).length;

  async function handleCreateClient(e) {
    e.preventDefault();

    const nombre = form.nombre.trim();

    if (!nombre) {
      setError("El nombre del cliente es requerido.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/clientes", {
        nombre,
        documento: form.documento.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
      });

      const id = response?.data?.id_cliente || "registrado";

      setShowModal(false);
      setForm({ nombre: "", documento: "", telefono: "", email: "" });
      setSuccessMessage(
        `Cliente ${id !== "registrado" ? "#" + id : ""} creado correctamente. Cartera comercial actualizada.`
      );

      await loadData();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "No se pudo crear el cliente.";
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
              Cartera comercial · SQLite → API REST → React
            </div>
            <h1>Gestión de Clientes</h1>
            <p>
              Consulta y seguimiento de clientes registrados para asociar ventas,
              mantener trazabilidad comercial y facilitar el análisis posterior.
            </p>
          </div>

          <div className="module-actions">
            <button className="primary-btn" onClick={() => setShowModal(true)}>
              Nuevo cliente
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
            <span>Clientes registrados</span>
            <strong>{loading ? "…" : clients.length}</strong>
            <small>Cartera comercial</small>
          </article>

          <article className="module-kpi">
            <span>Clientes activos</span>
            <strong>{loading ? "…" : activeClients}</strong>
            <small>Disponibles para venta</small>
          </article>

          <article className="module-kpi">
            <span>Con email</span>
            <strong>{loading ? "…" : withEmail}</strong>
            <small>Contacto digital</small>
          </article>

          <article className="module-kpi">
            <span>Con teléfono</span>
            <strong>{loading ? "…" : withPhone}</strong>
            <small>Contacto directo</small>
          </article>
        </section>

        <div className="module-toolbar">
          <input
            className="module-search"
            placeholder="Buscar por nombre, documento, teléfono o correo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="ghost-btn" onClick={loadData} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <section className="module-table-card">
          <table className="professional-table clients-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    {loading
                      ? "Cargando clientes desde la API..."
                      : "No se encontraron clientes."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id_cliente}>
                    <td className="strong-cell truncate-cell" title={c.nombre}>
                      {c.nombre}
                    </td>
                    <td>{c.documento || "No registrado"}</td>
                    <td>{c.telefono || "No registrado"}</td>
                    <td className="truncate-cell" title={c.email}>
                      {c.email || "No registrado"}
                    </td>
                    <td>
                      <span
                        className={
                          c.estado === 0
                            ? "status-pill inactive"
                            : "status-pill active"
                        }
                      >
                        {c.estado === 0 ? "Inactivo" : "Activo"}
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
          <form className="sales-modal refined-modal" onSubmit={handleCreateClient}>
            <div className="modal-head">
              <h2>Nuevo cliente</h2>
              <p>
                Registra un cliente persistido en SQLite para asociarlo a ventas
                y mantener trazabilidad comercial.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Nombre completo</label>
                <input
                  className="clean-input"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  placeholder="Ej. Laura Sánchez"
                  required
                />
              </div>

              <div className="form-two-cols">
                <div className="form-field">
                  <label>Documento</label>
                  <input
                    className="clean-input"
                    value={form.documento}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        documento: e.target.value,
                      }))
                    }
                    placeholder="Documento"
                  />
                </div>

                <div className="form-field">
                  <label>Teléfono</label>
                  <input
                    className="clean-input"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, telefono: e.target.value }))
                    }
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  className="clean-input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="cliente@example.com"
                />
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
                {saving ? "Guardando..." : "Guardar cliente"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
