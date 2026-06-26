import {
  getValidAccessToken,
  refreshAccessToken,
  clearSessionAndRedirectToLogin,
} from "@/lib/sessionToken";

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const doFetch = async () => {
    const headers = new Headers(init.headers);
    const token = await getValidAccessToken();

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(input, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    });
  };

  let response = await doFetch();

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch();
    } else {
      clearSessionAndRedirectToLogin();
    }
  }

  return response;
}
