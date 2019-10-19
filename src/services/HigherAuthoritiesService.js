import http from "./httpService";
import config from "../config.json";

export function getHigherAuthorityMembers() {
  return http.get(config.apiUrl + "/higher-authorities/");
}

export function deleteMember(id) {
  return http.delete(config.apiUrl + "/higher-authorities/" + id);
}

export function addHigherAuthorityMember(body) {
  return http.post(config.apiUrl + "/higher-authorities/", body);
}

export function editHigherAuthorityMember(body, id) {
  return http.put(config.apiUrl + "/higher-authorities/" + id, body);
}
