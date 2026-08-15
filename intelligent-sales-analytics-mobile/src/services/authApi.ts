import {
  apiRequest,
} from '@/src/services/api';

import type {
  InternalUser,
  LoginResult,
} from '@/src/types/auth';

export async function loginInternal(
  email: string,
  password: string,
) {
  console.log(
    '[ISS LOGIN PAYLOAD]',
    {
      email,
      emailLength: email.length,
      passwordLength: password.length,
    },
  );

  return apiRequest<LoginResult>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );
}

export async function fetchMe() {
  return apiRequest<{
    message: string;
    user: InternalUser;
  }>(
    '/me',
    {
      authenticated: true,
    },
  );
}
