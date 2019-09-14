import http from "./httpService";
import { apiUrl } from "../config.json";

export function register(user) {
  return http.post(apiUrl + "/complainers", {
    name: user.name,
    email: user.email,
    password: user.password
  });
}

export function getAllUsers(role) {
  return http.get(apiUrl + "/" + role + "/all");
}

export function registerUser(userData, isAssignee) {
  if (isAssignee) return http.post(apiUrl + "/assignees/", userData);
  return http.post(apiUrl + "/complainers/", userData);
}

export function createFormData({
  data,
  currentUser,
  responsibilities,
  profilePath,
  isAssignee
}) {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("email", data.email);
  if (currentUser.role !== "admin") {
    fd.append("password", data.password);
  }
  fd.append("phone", data.phone);
  if (isAssignee) {
    fd.append("responsibilities", JSON.stringify(responsibilities));
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

export function updateUser(userId, userData, isAssignee) {
  if (isAssignee) return http.put(apiUrl + "/assignees/" + userId, userData);
  return http.put(apiUrl + "/complainers/" + userId, userData);
}

export function createUsers(role, FormData) {
  return http.post(`${apiUrl}/${role}s/uploadCsv`, FormData);
}
export function convertToPicture(buffer) {
  var base64Flag = "data:image/jpeg;base64,";
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  var profilePicture = base64Flag + window.btoa(binary);
  return profilePicture;
}

export function getUser(userId, role) {
  return http.get(`${apiUrl}/${role}s/${userId}`);
}

export function getUserByEmail(email, role) {
  return http.get(`${apiUrl}/${role}s/email/${email}`);
}

export function recoverPassword(body) {
  return http.post(`${apiUrl}/password/recover`, body);
}

export function resetPassword(body) {
  return http.put(`${apiUrl}/password/reset`, body);
}
export function getProfilePicture() {
  let profilePicture = "";
  if (localStorage.getItem("profilePicture"))
    return localStorage.getItem("profilePicture");
  return profilePicture;
}
