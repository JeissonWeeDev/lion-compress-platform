import { API_URL } from "./constants";

export async function fetchData(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
}
