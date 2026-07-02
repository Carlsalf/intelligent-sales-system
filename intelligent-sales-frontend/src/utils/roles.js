export const ROLES = {
  ADMIN: 1,
  VENDEDOR: 2,
  GERENTE: 3,
};

export function isAdmin(user) {
  return Number(user?.id_rol) === ROLES.ADMIN;
}

export function isManager(user) {
  return Number(user?.id_rol) === ROLES.GERENTE;
}

export function isSeller(user) {
  return Number(user?.id_rol) === ROLES.VENDEDOR;
}

export function canManageCriticalActions(user) {
  return isAdmin(user);
}

export function canSeeAnalytics(user) {
  return [ROLES.ADMIN, ROLES.GERENTE].includes(Number(user?.id_rol));
}

export function roleLabel(user) {
  const id = Number(user?.id_rol);
  if (id === ROLES.ADMIN) return "Administrador General";
  if (id === ROLES.GERENTE) return "Gerente Comercial";
  if (id === ROLES.VENDEDOR) return "Vendedor Comercial";
  return "Usuario del Sistema";
}

export function roleCode(user) {
  const id = Number(user?.id_rol);
  if (id === ROLES.ADMIN) return "ADM";
  if (id === ROLES.GERENTE) return "GER";
  if (id === ROLES.VENDEDOR) return "VEN";
  return "USR";
}

export function permissionSummary(user) {
  const id = Number(user?.id_rol);
  if (id === ROLES.ADMIN) return "Acceso total al sistema";
  if (id === ROLES.GERENTE) return "Gestión comercial y analítica";
  if (id === ROLES.VENDEDOR) return "Operación comercial diaria";
  return "Permisos estándar";
}

export function initials(name = "", user = null) {
  return roleCode(user);
}
