import http from "./httpService";
import config from "../config.json";

export function getSpecificComplainer(complainerId) {
  return http.get(config.apiUrl + `/complainers/${complainerId}`);
}

export function getComplainer(complainerId) {
  return http.get(config.apiUrl + `/complainers/${complainerId}`);
}

export function deleteComplainer(complainerId) {
  return http.delete(config.apiUrl + "/complainers/" + complainerId);
}
