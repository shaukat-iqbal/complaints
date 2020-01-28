import http from "./httpService";
import { apiUrl } from "../config.json";

let endPoint = apiUrl + "/companies";

export function insertCompanyDetails(details) {
  return http.post(endPoint, details);
}
export function updateCompanyDetails(details, id) {
  return http.put(endPoint + "/" + id, details);
}

export function createDetailsFormData({ data, profilePath, profilePicture }) {
  const fd = new FormData();
  let body = data;
  if (body.confirmPassword) delete body.confirmPassword;
  for (const key in body) {
    fd.append(key, body[key]);
  }
  fd.append("profilePath", profilePath);

  if (profilePicture) {
    fd.append("profilePicture", profilePicture, profilePicture.name);
  }

  return fd;
}
