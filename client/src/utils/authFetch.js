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

export const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: withAuthHeaders(options.headers, options.method),
  });
};
