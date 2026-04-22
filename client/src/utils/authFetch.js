import Auth from "/src/utils/auth";

const getCsrfToken = () => {
  if (typeof document === "undefined") return "";
  const cookiePrefix = "; csrfToken=";
  const cookieValue = `; ${document.cookie}`;
  const parts = cookieValue.split(cookiePrefix);
  if (parts.length !== 2) return "";
  return parts.pop()?.split(";").shift() || "";
};

export const withAuthHeaders = (headers = {}, method = "GET") => {
  const token = Auth.getToken();
  const csrfToken = getCsrfToken();
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(String(method).toUpperCase());

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isStateChanging && csrfToken ? { "x-csrf-token": csrfToken } : {}),
  };
};

const DEBUG_ENDPOINT_PATTERNS = [
  '/api/bookings',
  '/api/finance/',
  '/api/invoices',
  '/api/customers',
];

const shouldDebugAuthFetch = (url) =>
  typeof url === 'string' && DEBUG_ENDPOINT_PATTERNS.some((pattern) => url.includes(pattern));

export const authFetch = async (url, options = {}) => {
  const headers = withAuthHeaders(options.headers, options.method);
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (shouldDebugAuthFetch(url)) {
    const hasAuthHeader = Boolean(headers.Authorization);
    console.info('[authFetch]', {
      url,
      method: (options.method || 'GET').toUpperCase(),
      hasAuthHeader,
      status: res.status,
      ok: res.ok,
    });
  }

  return res;
};
