import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Clients.css";

const EMPTY_CLIENT = {
  nombre: "",
  documento: "",
  telefono: "",
  email: "",
};

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
  const [statusFilter, setStatusFilter] = useState("todos");
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [editingClient, setEditingClient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/clients");
      setClients(normalizeArray(response.data, "clientes"));
    } catch (err) {
      console.error("Error al cargar clientes:", err.response?.data || err.message);
      setClients([]);
      setError("No se pudieron cargar los clientes. Inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const isMissing = (value) => value === null || value === undefined || String(value).trim() === "";

  const isClientInactive = (client) => Number(client.estado) === 0;

  const isClientIncomplete = (client) =>
    !isClientInactive(client) &&
    (isMissing(client.documento) || isMissing(client.telefono) || isMissing(client.email));

  const filteredClients = useMemo(() => {
    const q = query.toLowerCase().trim();

    const groupedClients = clients.filter((client) => {
      if (statusFilter === "disponibles") return !isClientInactive(client);
      if (statusFilter === "bajas") return isClientInactive(client);
      if (statusFilter === "pendientes") return isClientIncomplete(client);
      return true;
    });

    if (!q) return groupedClients;

    return groupedClients.filter((client) =>
      [
        client.nombre,
        client.documento,
        client.telefono,
        client.email,
        isClientInactive(client) ? "dado de baja" : "disponible",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, query, statusFilter]);

  const stats = {
    total: clients.length,
    active: clients.filter((client) => Number(client.estado) !== 0).length,
    inactive: clients.filter((client) => Number(client.estado) === 0).length,
    incomplete: clients.filter((client) =>
      isClientIncomplete(client)
    ).length,
  };

  function openCreateModal() {
    setEditingClient(null);
    setForm(EMPTY_CLIENT);
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function openEditModal(client) {
    setEditingClient(client);
    setForm({
      nombre: client.nombre || "",
      documento: client.documento || "",
      telefono: client.telefono || "",
      email: client.email || "",
    });
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingClient(null);
    setForm(EMPTY_CLIENT);
    setError("");
  }

  function validateForm() {
    const nombre = form.nombre.trim();
    const documento = form.documento.trim().toUpperCase();
    const telefono = form.telefono.trim();
    const email = form.email.trim().toLowerCase();

    if (!nombre) return "El nombre del cliente es obligatorio.";
    if (nombre.length < 3 || nombre.length > 80) {
      return "El nombre debe tener entre 3 y 80 caracteres.";
    }
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,'&-]+$/.test(nombre)) {
      return "El nombre contiene caracteres no válidos.";
    }

    if (
      documento &&
      !(
        /^[A-Z][0-9]{8}$/.test(documento) ||
        /^[0-9]{8}[A-Z]$/.test(documento) ||
        /^[XYZ][0-9]{7}[A-Z]$/.test(documento)
      )
    ) {
      return "El documento debe tener un formato válido. Ejemplos: U87890967, 12345678A o X1234567L.";
    }

    if (telefono && !/^[6789][0-9]{8}$/.test(telefono)) {
      return "El teléfono debe tener 9 dígitos válidos en España.";
    }

    if (email) {
      if (email.length > 120) return "El correo no debe superar los 120 caracteres.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return "El correo electrónico debe tener un formato válido.";
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      documento: form.documento.trim().toUpperCase(),
      telefono: form.telefono.trim(),
      email: form.email.trim().toLowerCase(),
    };

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingClient) {
        await api.put(`/clients/${editingClient.id_cliente || editingClient.id}`, payload);
        setSuccessMessage("Los cambios se guardaron correctamente.");
      } else {
        await api.post("/clients", payload);
        setSuccessMessage("Cliente registrado correctamente.");
      }

      await loadData();
      setShowModal(false);
      setEditingClient(null);
      setForm(EMPTY_CLIENT);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al guardar cliente:", err.response?.data || err.message);
      setError(err.response?.data?.message || "No fue posible guardar el cliente. Inténtelo nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivate(client) {
    const confirmed = window.confirm(
      `¿Deseas reactivar a "${client.nombre}" en la cartera comercial?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await api.put(`/clients/${client.id_cliente || client.id}/reactivar`);
      await loadData();
      setSuccessMessage("Cliente reactivado correctamente.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al reactivar cliente:", err.response?.data || err.message);
      setError(err.response?.data?.message || "No fue posible reactivar el cliente. Inténtelo nuevamente.");
    }
  }

  async function handleDelete(client) {
    const confirmed = window.confirm(
      `¿Deseas dar de baja a "${client.nombre}" de la cartera comercial?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await api.delete(`/clients/${client.id_cliente || client.id}`);
      await loadData();
      setSuccessMessage("Cliente dado de baja correctamente.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al dar de baja cliente:", err.response?.data || err.message);
      setError(err.response?.data?.message || "No fue posible dar de baja el cliente. Inténtelo nuevamente.");
    }
  }

  return (
    <main className="clients-page">
      <p className="module-kicker">Cartera comercial · Clientes · Relaciones comerciales</p>
      <h1>Gestión de Clientes</h1>
      <p className="module-description">
        Administra la cartera de clientes, mantén actualizada su información de contacto
        y facilita el seguimiento de las relaciones comerciales.
      </p>

      <div className="module-actions">
        <button className="primary-button" onClick={openCreateModal}>
          Nuevo cliente
        </button>
        <button className="secondary-button" onClick={loadData} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar cartera"}
        </button>
      </div>

      {successMessage && !showModal && (
        <div className="toast-success">{successMessage}</div>
      )}

      {error && !showModal && <p className="form-error">{error}</p>}

      <div className="module-stats">
        <article className="stat-card">
          <span>Clientes registrados</span>
          <strong>{loading ? "…" : stats.total}</strong>
          <small>Cartera comercial</small>
        </article>

        <article className="stat-card">
          <span>Disponibles</span>
          <strong>{loading ? "…" : stats.active}</strong>
          <small>Disponibles para venta</small>
        </article>

        <article className="stat-card">
          <span>Dados de baja</span>
          <strong>{loading ? "…" : stats.inactive}</strong>
          <small>Bajas lógicas registradas</small>
        </article>

        <article
          className={`stat-card ${stats.incomplete > 0 ? "stat-card-warning" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter("pendientes")}
          onKeyDown={(event) => {
            if (event.key === "Enter") setStatusFilter("pendientes");
          }}
        >
          <span>Datos incompletos</span>
          <strong>{loading ? "…" : stats.incomplete}</strong>
          <small>{stats.incomplete > 0 ? "Revisar información pendiente" : "Cartera completa"}</small>
        </article>
      </div>

      <div className="module-toolbar">
        <input
          placeholder="Buscar cliente, documento, teléfono o correo..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="segmented-filter" aria-label="Filtro de cartera comercial">
          <button
            type="button"
            className={statusFilter === "todos" ? "active" : ""}
            onClick={() => setStatusFilter("todos")}
          >
            Cartera completa
          </button>
          <button
            type="button"
            className={statusFilter === "disponibles" ? "active" : ""}
            onClick={() => setStatusFilter("disponibles")}
          >
            Disponibles
          </button>
          <button
            type="button"
            className={statusFilter === "bajas" ? "active" : ""}
            onClick={() => setStatusFilter("bajas")}
          >
            Dados de baja
          </button>
          <button
            type="button"
            className={statusFilter === "pendientes" ? "active" : ""}
            onClick={() => setStatusFilter("pendientes")}
          >
            Pendientes
          </button>
        </div>
      </div>

      <div className="results-summary">
        {statusFilter === "todos" && `Mostrando ${filteredClients.length} cliente(s) de la cartera completa`}
        {statusFilter === "disponibles" && `Mostrando ${filteredClients.length} cliente(s) disponibles para venta`}
        {statusFilter === "bajas" && `Mostrando ${filteredClients.length} cliente(s) dados de baja`}
        {statusFilter === "pendientes" && `Mostrando ${filteredClients.length} cliente(s) con información pendiente`}
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  {loading ? "Cargando clientes..." : "No se encontraron clientes."}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id_cliente || client.id}>
                  <td>{client.nombre}</td>
                  <td>{client.documento || <span className="missing-badge">Pendiente</span>}</td>
                  <td>{client.telefono || <span className="missing-badge">Pendiente</span>}</td>
                  <td>{client.email || <span className="missing-badge">Pendiente</span>}</td>
                  <td>
                    <span className={`status-badge ${client.estado === 0 ? "status-neutral" : "status-success"}`}>
                      {client.estado === 0 ? "Inactivo" : "Activo"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="secondary-button" onClick={() => openEditModal(client)}>
                        Editar
                      </button>
                      {client.estado === 0 ? (
                        <button className="secondary-button" onClick={() => handleReactivate(client)}>
                          Reactivar
                        </button>
                      ) : (
                        <button className="danger-button" onClick={() => handleDelete(client)}>
                          Dar de baja
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <span>{editingClient ? "Edición de cliente" : "Alta de cliente"}</span>
                <h2>
                  {editingClient
                    ? "Editar información del cliente"
                    : "Registro de cliente"}
                </h2>
              </div>
              <button type="button" onClick={closeModal}>×</button>
            </div>

            <form className="entity-form" onSubmit={handleSubmit}>
              <label>
                Nombre del cliente
                <input
                  value={form.nombre}
                  maxLength={80}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,'&-]{0,80}$/.test(value)) {
                      setForm({ ...form, nombre: value });
                    }
                  }}
                  placeholder="Nombre o razón social"
                  required
                />
              </label>

              <label>
                Documento
                <input
                  value={form.documento}
                  maxLength={9}
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase();
                    if (/^[A-Z0-9]{0,9}$/.test(value)) {
                      setForm({ ...form, documento: value });
                    }
                  }}
                  placeholder="Ej. U87890967, 12345678A o X1234567L"
                />
              </label>

              <label>
                Teléfono
                <input
                  value={form.telefono}
                  maxLength={9}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "");
                    if (/^[0-9]{0,9}$/.test(value)) {
                      setForm({ ...form, telefono: value });
                    }
                  }}
                  placeholder="9 dígitos. Ej. 600123456"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={form.email}
                  maxLength={120}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\s/g, "").toLowerCase();
                    if (value.length <= 120) setForm({ ...form, email: value });
                  }}
                  placeholder="correo@empresa.com"
                />
              </label>

              {error && showModal && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving
                    ? "Guardando..."
                    : editingClient
                      ? "Guardar cambios"
                      : "Registrar cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}