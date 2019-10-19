import http from "./httpService";
import config from "../config.json";

export function getAllowedAttachments() {
  return http.get(config.apiUrl + "/attachments/");
}
