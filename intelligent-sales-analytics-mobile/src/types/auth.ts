export type InternalUser = {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  rol: 'admin' | 'gerente' | string;
};

export type LoginResult = {
  token: string;
  user: InternalUser;
};
