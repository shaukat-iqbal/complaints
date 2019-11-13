import http from "./httpService";
import { apiUrl } from "../config.json";

let endPoint = apiUrl + "/companies";

export function insertCompanyDetails(details) {
  return http.post(endPoint, details);
}
export function updateCompanyDetails(details, id) {
  return http.put(endPoint + "/" + id, details);
}

export function createDetailsFormData({ data, profilePath }) {
  const fd = new FormData();
  let body = data;
  if (body.confirmPassword) delete body.confirmPassword;
  for (const key in body) {
    fd.append(key, body[key]);
  }
  if (profilePath) {
    if (typeof profilePath === "object") {
      fd.append("profilePicture", profilePath, profilePath.name);
    } else {
      fd.append("profilePath", profilePath);
    }
  }

  return fd;
}
