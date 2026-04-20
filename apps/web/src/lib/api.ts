/**
 * Base de la API Nest.
 * - Si `NEXT_PUBLIC_API_URL` está definida: se usa tal cual (desarrollo o API en otro dominio).
 * - Si no está definida en producción: mismo origen vía rewrite `/api/nest/*` → Nest (ver `next.config.ts`).
 */
export function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001";
  }
  return "/api/nest";
}

export async function apiFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
