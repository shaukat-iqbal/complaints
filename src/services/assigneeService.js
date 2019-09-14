import http from "./httpService";
import config from "../config.json";

export function getAllAssignees() {
  return http.get(config.apiUrl + "/assignees/all");
}

export function getAllAssigneesForComplainer() {
  return http.get(config.apiUrl + "/assignees/all");
}

export function getSpecificAssignee(assigneeId) {
  return http.get(config.apiUrl + `/assignees/me/${assigneeId}`);
}

export function getAssignee(assigneeId) {
  return http.get(config.apiUrl + "/assignees/" + assigneeId);
}

export function deleteAssignee(assigneeId) {
  return http.delete(config.apiUrl + "/assignees/" + assigneeId);
}
// setting chatWith
export function setChatWith(assigneeId, complaintId) {
  return http.put(
    config.apiUrl +
      `/assignees/change/chatwith/messages/${assigneeId}/${complaintId}`
  );
}

export function getImage() {
  return http.get(config.apiUrl + "/assignees/getPhoto");
}
