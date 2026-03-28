export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response;
}

export async function apiJson(path, options = {}) {
  const response = await apiRequest(path, options);
  return response.json();
}
