import { apiJson } from "./http";

export function getHealth() {
  return apiJson("/api/health/");
}
