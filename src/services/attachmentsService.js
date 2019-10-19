import http from "./httpService";
import config from "../config.json";

export function getAllowedAttachments() {
  return http.get(config.apiUrl + "/attachments/");
}

export function deleteAttachment(id) {
  return http.delete(config.apiUrl + "/attachments/" + id);
}

export function addAttachment(body) {
  return http.post(config.apiUrl + "/attachments/", body);
}

export function editAttachment(body, id) {
  return http.put(config.apiUrl + "/attachments/" + id, body);
}
