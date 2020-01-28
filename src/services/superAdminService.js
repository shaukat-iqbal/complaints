import http from "./httpService";
import { apiUrl } from "../config.json";

export function getSuperAdmin(id) {
  return http.get(apiUrl + "/super-admins/" + id);
}
export function updateSuperAdmin(id, data) {
  return http.put(apiUrl + "/super-admins/" + id, data);
}
