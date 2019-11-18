import http from "./httpService";
import config from "../config.json";

// sending message
export function getAllNotifications() {
  return http.get(config.apiUrl + "/notifications/getnotifications");
}
