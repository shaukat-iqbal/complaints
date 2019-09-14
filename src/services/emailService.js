import http from "./httpService";
import config from "../config.json";

// getting all Resolved complaints
export function sendEmailToAuthorities(data) {
  return http.post(config.apiUrl + `/emails`, data);
}
