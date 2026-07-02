import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Products.css";

const EMPTY_FORM = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProducts = async () => {
    try {
      setFormError("");
      const response = await api.get("/products");
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err.response?.data || err.message);
      setProducts([]);
      setFormError("No se pudieron cargar los productos. Inténtelo nuevamente.");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/categorias");
      setCategories(response.data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err.response?.data || err.message);
      setCategories([]);
      setFormError("No se pudieron cargar las categorías. Inténtelo nuevamente.");
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.nombre} ${product.categoria} ${product.precio} ${product.stock}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const stats = {
    total: products.length,
    stock: products.reduce((sum, p) => sum + Number(p.stock || 0), 0),
    value: products.reduce((sum, p) => sum + Number(p.precio || 0) * Number(p.stock || 0), 0),
    lowStock: products.filter((p) => Number(p.stock || 0) <= 5).length,
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      nombre: product.nombre || "",
      categoria: product.categoria || "",
      precio: String(product.precio ?? ""),
      stock: String(product.stock ?? ""),
    });
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const price = Number(form.precio);
    const stock = Number(form.stock);

    if (!form.nombre.trim()) return "El nombre del producto es obligatorio.";
    if (!form.categoria) return "Seleccione una categoría válida.";
    if (!Number.isFinite(price) || price <= 0 || price > 99999.99) {
      return "El precio debe ser mayor que 0 y menor o igual a 99999.99.";
    }
    if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
      return "El stock debe ser un número entero entre 0 y 9999 unidades.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      precio: Number(form.precio),
      stock: Number(form.stock),
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id_producto || editingProduct.id}`, payload);
        setSuccessMessage("Los cambios se guardaron correctamente.");
      } else {
        await api.post("/products", payload);
        setSuccessMessage("Producto registrado correctamente.");
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al guardar producto:", err.response?.data || err.message);
      setFormError(err.response?.data?.message || "No fue posible guardar el producto. Inténtelo nuevamente.");
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar el producto "${product.nombre}" del catálogo?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${product.id_producto || product.id}`);
      await loadProducts();
      setSuccessMessage("Producto eliminado correctamente.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error("Error al eliminar producto:", err.response?.data || err.message);
      setFormError(err.response?.data?.message || "No se pudo eliminar el producto.");
    }
  };

  return (
    <section className="products-page">
      <p className="module-kicker">Catálogo comercial · Inventario · Disponibilidad</p>
      <h1>Gestión de Productos</h1>
      <p className="module-description">
        Administración del catálogo comercial, precios, categorías y stock disponible
        para alimentar ventas, inventario y analítica.
      </p>

      <div className="module-actions">
        <button className="primary-button" onClick={openCreateForm}>Nuevo producto</button>
        <button className="secondary-button" onClick={loadProducts}>Actualizar catálogo</button>
      </div>

      {successMessage && !showForm && (
        <div className="toast-success">{successMessage}</div>
      )}
      {formError && !showForm && <p className="form-error">{formError}</p>}

      <div className="module-stats">
        <article className="stat-card"><span>Productos activos</span><strong>{stats.total}</strong><small>Catálogo disponible</small></article>
        <article className="stat-card"><span>Stock total</span><strong>{stats.stock}</strong><small>Unidades inventariadas</small></article>
        <article className="stat-card"><span>Valor del inventario</span><strong>€ {stats.value.toFixed(2)}</strong><small>Valor comercial disponible</small></article>
        <article className="stat-card"><span>Alertas de inventario</span><strong>{stats.lowStock}</strong><small>Sin stock o ≤ 5 unidades</small></article>
      </div>

      <div className="module-toolbar">
        <input
          placeholder="Buscar producto o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Disponibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id_producto || product.id}>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>€ {Number(product.precio || 0).toFixed(2)}</td>
                <td>{product.stock} unidad(es)</td>
                <td>
                  <span
                    className={`status-badge ${
                      Number(product.stock || 0) === 0
                        ? "status-empty"
                        : Number(product.stock || 0) <= 5
                          ? "status-warning"
                          : "status-success"
                    }`}>
                    {Number(product.stock || 0) === 0
                      ? "Sin stock"
                      : Number(product.stock || 0) <= 5
                        ? "Stock bajo"
                        : "En stock"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="secondary-button" onClick={() => openEditForm(product)}>Editar</button>
                    <button className="danger-button" onClick={() => handleDelete(product)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <span>{editingProduct ? "Edición de producto" : "Alta de producto"}</span>
                <h2>{editingProduct ? "Actualizar producto del catálogo" : "Registro de producto en catálogo"}</h2>
              </div>
              <button onClick={closeForm}>×</button>
            </div>

            <form className="entity-form" onSubmit={handleSubmit}>
              <label>
                Nombre del producto
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </label>

              <label>
                Categoría
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                  <option value="" disabled>Seleccione categoría</option>
                  {categories.map((category) => (
                    <option key={category.id_categoria} value={category.nombre}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Precio unitario
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej. 7.50"
                  value={form.precio}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    if (value === "" || /^\d{0,5}(\.\d{0,2})?$/.test(value)) {
                      setForm({ ...form, precio: value });
                    }
                  }}
                  required
                />
              </label>

              <label>
                Stock inicial
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej. 25"
                  value={form.stock}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (/^\d{1,4}$/.test(value) && Number(value) <= 9999)) {
                      setForm({ ...form, stock: value });
                    }
                  }}
                  required
                />
              </label>

              {formError && <p className="form-error">{formError}</p>}

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={closeForm}>Cancelar</button>
                <button type="submit" className="primary-button">
                  {editingProduct ? "Guardar cambios" : "Registrar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Products;
