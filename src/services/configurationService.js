import http from "./httpService";
import config from "../config.json";
const endPoint = config.apiUrl + "/config/";

export function getConfiguration() {
  return http.get(endPoint);
}

export function deleteConfiguration(id) {
  return http.delete(endPoint + id);
}

export function addConfiguration(body) {
  return http.post(endPoint, body);
}

export function updateConfiguration(body, id) {
  return http.put(endPoint + id, body);
}

export function getConfigToken() {
  return JSON.parse(localStorage.getItem("configuration"));
}
