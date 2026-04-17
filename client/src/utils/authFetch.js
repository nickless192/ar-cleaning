import Auth from "/src/utils/auth";

export const withAuthHeaders = (headers = {}) => {
  const token = Auth.getToken();
  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: withAuthHeaders(options.headers),
  });
};
