import { apiRequest } from "./client";

export function getResponses(formId) {
  const params = formId ? `?formId=${formId}` : "";
  return apiRequest(`/responses${params}`);
}
