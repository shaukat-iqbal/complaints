import http from "./httpService";
import config from "../config.json";

export function getSpecificComplainer(complainerId) {
  return http.get(config.apiUrl + `/complainers/${complainerId}`);
}
