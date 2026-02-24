# TFM – Sistema de Gestión de Ventas para PYME
## Backend API (Node.js + Express + SQLite + JWT)

Autor: Carlos Alfredo Callagua  
Máster Universitario – Universidad de Alicante  
Año: 2026  

---

# 1. Descripción del Proyecto

Este proyecto corresponde al backend de un sistema de gestión de ventas orientado a pequeñas y medianas empresas (PYMES).

La aplicación expone una API REST desarrollada en Node.js utilizando Express, con persistencia en SQLite y autenticación basada en JSON Web Tokens (JWT).

El sistema permite:
- Gestión de usuarios con autenticación segura
- Gestión de categorías
- Gestión de productos
- Gestión de clientes
- Registro de ventas con control de stock
- Eliminación lógica de registros
- Control de acceso por roles

---

# 2. Arquitectura del Backend

Estructura por capas:

src/
- routes/        Definición de endpoints
- controllers/   Entrada/salida HTTP
- services/      Lógica de negocio
- repositories/  Acceso a datos
- middlewares/   JWT, roles, errores
- db/            SQLite init/seed
- app.js         Configuración Express
- server.js      Arranque

---

# 3. Tecnologías
- Node.js
- Express.js
- SQLite
- JWT
- bcrypt
- dotenv
- cors

---

# 4. Instalación

## Clonar
git clone https://gitlab.com/carlsalf1/tfm-pyme-ventas-api.git
cd tfm-pyme-ventas-api

## Instalar
npm install

## Variables de entorno
Crea .env:
PORT=3001
JWT_SECRET=super_secret_key

## Inicializar BD
node src/db/init.js
node src/db/seedAdmin.js

Admin por defecto:
Email: admin@pyme.com
Password: Admin123*

## Ejecutar
npm run dev
# o
node src/server.js

Servidor:
http://localhost:3001

---

# 5. Autenticación (JWT)

POST /api/auth/login
Body:
{ "email":"admin@pyme.com", "password":"Admin123*" }

Header para rutas protegidas:
Authorization: Bearer <TOKEN>

---

# 6. Endpoints

Auth:
- POST /api/auth/login

Me:
- GET /api/me

Categorías:
- GET /api/categorias
- POST /api/categorias
- PUT /api/categorias/:id
- DELETE /api/categorias/:id (lógica)

Productos:
- GET /api/productos
- POST /api/productos
- PUT /api/productos/:id
- DELETE /api/productos/:id

Clientes:
- GET /api/clientes
- POST /api/clientes
- PUT /api/clientes/:id
- DELETE /api/clientes/:id

Ventas:
- GET /api/ventas
- POST /api/ventas

---

# 7. Seguridad
- Hash de contraseñas con bcrypt
- JWT con expiración
- Middleware de validación de token
- Control de acceso por rol
- Eliminación lógica
- Manejo centralizado de errores

---

# 8. Estado
v1.0: Backend funcional base (CRUD + Auth + Ventas)

Futuro:
- Documentación OpenAPI
- Reportes/Exportación
- Integración App móvil

---

# 9. Licencia
Proyecto académico (TFM).
