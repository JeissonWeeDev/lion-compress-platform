import { API_URL } from "./constants";

export async function fetchData(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
}

export async function postData(endpoint: string, data: unknown) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}
