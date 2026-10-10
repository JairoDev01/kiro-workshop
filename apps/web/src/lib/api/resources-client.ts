import { resolveApiBaseUrl } from './api-config';

/**
 * A single saved resource returned by the API.
 */
export type Resource = {
  resourceId: string;
  title: string;
  url: string;
  createdAt: string;
};

/**
 * Fetches all saved resources from `GET ${baseUrl}/resources`.
 *
 * No `Authorization` header is sent — the local API does not validate tokens
 * (R3, R12). Network or non-2xx failures throw an `Error` with a human-facing
 * message so callers can display it directly.
 *
 * The outer try/catch ensures this async function never produces an unexpected
 * rejected promise; every failure path re-throws an `Error` with a clear
 * message, mirroring the defensive pattern in `hello-client.ts`.
 */
export const listResources = async (): Promise<Resource[]> => {
  try {
    const baseUrl = resolveApiBaseUrl();

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/resources`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch {
      throw new Error(
        'No se pudo conectar con el API. Verifica que el servidor local esté en ejecución.',
      );
    }

    if (!response.ok) {
      throw new Error(
        `Error al cargar los recursos (HTTP ${response.status}).`,
      );
    }

    try {
      const body: unknown = await response.json();
      if (!Array.isArray(body)) {
        throw new Error('Respuesta inesperada del API al listar recursos.');
      }
      return body as Resource[];
    } catch (parseError) {
      if (parseError instanceof Error) throw parseError;
      throw new Error('No se pudo leer la respuesta del API.');
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Error desconocido al listar recursos.');
  }
};

/**
 * Creates a new saved resource via `POST ${baseUrl}/resources`.
 *
 * Sends `{ title, url }` as JSON. No `Authorization` header is included
 * (R3, R12). On a `400` response the API's validation message is surfaced to
 * the caller. Any other non-2xx status or network failure also throws with a
 * descriptive message.
 *
 * Returns the created `Resource` (HTTP 201) on success.
 */
export const createResource = async (
  title: string,
  url: string,
): Promise<Resource> => {
  try {
    const baseUrl = resolveApiBaseUrl();

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ title, url }),
      });
    } catch {
      throw new Error(
        'No se pudo conectar con el API. Verifica que el servidor local esté en ejecución.',
      );
    }

    if (response.status === 400) {
      // Surface the API's validation message when available.
      try {
        const body = (await response.json()) as {
          error?: { message?: string };
        };
        const message = body?.error?.message ?? 'Datos inválidos (400).';
        throw new Error(message);
      } catch (parseError) {
        if (parseError instanceof Error) throw parseError;
        throw new Error('Datos inválidos (400).');
      }
    }

    if (!response.ok) {
      throw new Error(`Error al crear el recurso (HTTP ${response.status}).`);
    }

    try {
      const body: unknown = await response.json();
      return body as Resource;
    } catch {
      throw new Error('No se pudo leer la respuesta del API tras crear el recurso.');
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Error desconocido al crear el recurso.');
  }
};
