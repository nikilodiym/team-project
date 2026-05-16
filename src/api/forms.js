import { apiRequest } from "./client";

export function getForms({ search = "", sortBy = "createdAt", sortDir = "desc" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("sortBy", sortBy);
  params.set("sortDir", sortDir);
  return apiRequest(`/forms?${params.toString()}`);
}

export function getForm(id) {
  return apiRequest(`/forms/${id}`);
}

export function createForm(payload) {
  return apiRequest("/forms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateForm(id, payload) {
  return apiRequest(`/forms/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteForm(id) {
  return apiRequest(`/forms/${id}`, { method: "DELETE" });
}

export function uploadThumbnail(formId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest(`/forms/${formId}/thumbnail`, {
    method: "POST",
    body: formData,
  });
}
