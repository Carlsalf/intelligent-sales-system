import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../Dashboard/Dashboard.css";

const initialForm = {
  nombre: "",
  email: "",
  password: "",
  id_rol: 2,
};

function roleName(user) {
  const id = Number(user?.id_rol);
  if (id === 1) return "Administrador General";
  if (id === 3) return "Gerente Comercial";
  if (id === 2) return "Vendedor Comercial";
  return "Usuario del Sistema";
}

function roleBadgeClass(user) {
  const id = Number(user?.id_rol);
  if (id === 1) return "role-admin";
  if (id === 3) return "role-manager";
  if (id === 2) return "role-seller";
  return "role-default";
}

function userInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "US";
}

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function loadData() {
    try {
      setError("");
      const [usersRes, rolesRes] = await Promise.all([
        api.get("/users"),
        api.get("/users/roles"),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "No fue posible cargar usuarios.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
      [user.nombre, user.email, user.rol, roleName(user), String(user.id_usuario)]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [users, query]);

  const stats = {
    total: users.length,
    activos: users.filter((u) => Number(u.estado) === 1).length,
    inactivos: users.filter((u) => Number(u.estado) === 0).length,
    admins: users.filter((u) => Number(u.id_rol) === 1).length,
  };

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post("/users", {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        id_rol: Number(form.id_rol),
      });

      setMessage("Usuario creado correctamente. Ya puede acceder desde el login principal.");
      setForm(initialForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "No fue posible crear el usuario.");
    }
  }

  async function toggleStatus(user) {
    const nextStatus = Number(user.estado) === 1 ? 0 : 1;

    if (!window.confirm(`¿Confirmas cambiar el estado de ${user.nombre}?`)) return;

    try {
      setError("");
      setMessage("");
      await api.patch(`/users/${user.id_usuario}/status`, { estado: nextStatus });
      setMessage(nextStatus === 1 ? "Usuario activado correctamente." : "Usuario desactivado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "No fue posible actualizar el estado.");
    }
  }

  return (
    <section className="dashboard-page dashboard-pro">
      <header className="dashboard-hero-pro users-hero-refined">
        <div>
          <span className="dashboard-eyebrow">Administración · Seguridad · RBAC</span>
          <h1>Gestión de usuarios</h1>
          <p>
            Administra accesos, roles y estados del sistema. Cada usuario accede desde
            el login principal con sus propias credenciales.
          </p>
        </div>

        <aside className="dashboard-profile-card">
          <div className="profile-avatar">RBAC</div>
          <div>
            <strong>Control de acceso</strong>
            <span>Administración del sistema</span>
            <small><b></b> Usuarios · Roles · Seguridad</small>
          </div>
        </aside>
      </header>

      {(message || error) && (
        <div className={error ? "form-alert error" : "form-alert success"}>
          {error || message}
        </div>
      )}

      <div className="dashboard-kpis-pro">
        <article>
          <span>Usuarios registrados</span>
          <strong>{stats.total}</strong>
          <small>Cuentas del sistema</small>
        </article>
        <article>
          <span>Usuarios activos</span>
          <strong>{stats.activos}</strong>
          <small>Acceso habilitado</small>
        </article>
        <article className={stats.inactivos > 0 ? "warning" : ""}>
          <span>Usuarios inactivos</span>
          <strong>{stats.inactivos}</strong>
          <small>Cuentas deshabilitadas</small>
        </article>
        <article>
          <span>Perfiles críticos</span>
          <strong>{stats.admins}</strong>
          <small>Administradores generales</small>
        </article>
      </div>

      <section className="enterprise-panel users-master-panel">
        <div className="users-panel-header">
          <div>
            <span>Usuarios y roles</span>
            <h2>Control de accesos</h2>
            <p>Consulta, filtra y administra las cuentas autorizadas del sistema.</p>
          </div>
          <button className="primary-action" onClick={() => setShowForm(true)}>
            + Nuevo usuario
          </button>
        </div>

        <div className="users-toolbar">
          <input
            className="users-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar usuario, correo o rol..."
          />
        </div>

        <div className="users-table-wrapper">
          <table className="users-table users-table-refined">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Última actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id_usuario}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{userInitials(user.nombre)}</div>
                      <div>
                        <strong>{user.nombre.replace("Administrador TFM", "Administrador del Sistema")}</strong>
                        <small>ID #{user.id_usuario}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${roleBadgeClass(user)}`}>
                      {roleName(user)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${Number(user.estado) === 1 ? "status-success" : "status-neutral"}`}>
                      {Number(user.estado) === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>{user.updated_at || user.created_at || "Sin registro"}</td>
                  <td>
                    <div className="user-actions">
                      <button disabled>Editar</button>
                      <button
                        className={Number(user.estado) === 1 ? "danger-button" : "secondary-button"}
                        onClick={() => toggleStatus(user)}
                      >
                        {Number(user.estado) === 1 ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6">No hay usuarios para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="modal-backdrop">
          <div className="user-modal">
            <div className="user-modal-header">
              <div>
                <span>Alta de usuario</span>
                <h2>Nuevo acceso al sistema</h2>
                <p>La contraseña inicial será usada por el usuario en el login principal.</p>
              </div>
              <button onClick={() => setShowForm(false)}>×</button>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
              <label>
                Nombre completo
                <input
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  placeholder="Ej. Gerente Comercial"
                  required
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="usuario@pyme.com"
                  required
                />
              </label>

              <label>
                Contraseña inicial
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="Ej. gerente123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </label>

              <label>
                Rol del sistema
                <select
                  value={form.id_rol}
                  onChange={(event) => setForm({ ...form, id_rol: Number(event.target.value) })}
                >
                  {roles.map((role) => (
                    <option key={role.id_rol} value={role.id_rol}>
                      {roleName(role)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-action">
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Users;
