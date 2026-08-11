# Intelligent Sales Store Mobile

Aplicación móvil B2C de Intelligent Sales System desarrollada con React Native + Expo para Android e iOS.

## Arquitectura

- React Native + Expo Router.
- API REST compartida con el Centro de Administración Web.
- JWT de cliente independiente del JWT administrativo.
- Token de sesión almacenado con Expo SecureStore.
- Catálogo público; autenticación para operaciones asociadas a la identidad del cliente.

## Inicio

```bash
npm install
cp .env.example .env
npm start
```

Para iOS en macOS:

```bash
npm run ios
```

La API debe estar disponible en `EXPO_PUBLIC_API_URL`. En un iPhone físico no utilizar `localhost`; configurar la IP LAN del Mac que ejecuta el backend.

## Estado de migración

- [x] Proyecto móvil React Native inicializado.
- [x] Navegación base por pestañas.
- [x] Catálogo público conectado a `/api/store/products`.
- [x] Registro de cliente conectado a `/api/store/auth/register`.
- [x] Login conectado a `/api/store/auth/login`.
- [x] Restauración de sesión con `/api/store/auth/me`.
- [x] Logout.
- [ ] Detalle de producto.
- [ ] Carrito persistente.
- [ ] Checkout y direcciones.
- [ ] Pago/confirmación.
- [ ] Historial y seguimiento de pedidos.
