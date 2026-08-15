import * as SecureStore from 'expo-secure-store';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3001/api';

const TOKEN_KEY =
  'iss_internal_analytics_token';

type ApiOptions =
  RequestInit & {
    authenticated?: boolean;
  };

async function parseResponse(
  response: Response,
) {
  const body =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      'No se pudo completar la operación';

    throw new Error(message);
  }

  return body;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const headers =
    new Headers(options.headers);

  headers.set(
    'Content-Type',
    'application/json',
  );

  if (options.authenticated) {
    const token =
      await SecureStore.getItemAsync(
        TOKEN_KEY,
      );

    if (token) {
      headers.set(
        'Authorization',
        `Bearer ${token}`,
      );
    }
  }

  const url = `${API_URL}${path}`;

  console.log(
    '[ISS API]',
    options.method ?? 'GET',
    url,
  );

  try {
    const response = await fetch(
      url,
      {
        ...options,
        headers,
      },
    );

    console.log(
      '[ISS API RESPONSE]',
      response.status,
      url,
    );

    return parseResponse(
      response,
    ) as Promise<T>;
  } catch (error) {
    console.log(
      '[ISS API NETWORK ERROR]',
      url,
    );

    throw new Error(
      'No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.',
    );
  }
}

export async function saveToken(
  token: string,
) {
  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token,
  );
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(
    TOKEN_KEY,
  );
}

export async function getToken() {
  return SecureStore.getItemAsync(
    TOKEN_KEY,
  );
}
