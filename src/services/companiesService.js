import http from "./httpService";
import config from "../config.json";

export function getAllCompanies() {
  return http.get(config.apiUrl + "/companies");
}

export function getCompany(id) {
  return http.get(config.apiUrl + "/companies/" + id);
}
