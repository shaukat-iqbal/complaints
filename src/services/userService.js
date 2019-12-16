import http from "./httpService";
import { apiUrl } from "../config.json";

export function register(user) {
  return http.post(apiUrl + "/complainers", {
    name: user.name,
    email: user.email,
    password: user.password
  });
}

export function getAllUsers(
  pageNum = 1,
  pageSize = 5,
  searchBy = "",
  searchKeyword = "",
  keywordType,
  role
) {
  console.log(
    `${apiUrl}/${role}/paginated/${pageNum}/${pageSize}?searchBy=${searchBy}&searchKeyword=${searchKeyword}&keywordType=${keywordType}`
  );
  return http.get(
    `${apiUrl}/${role}/paginated/${pageNum}/${pageSize}?searchBy=${searchBy}&searchKeyword=${searchKeyword}&keywordType=${keywordType}`
  );
}

export function registerUser(userData, isAssignee) {
  if (isAssignee) return http.post(apiUrl + "/assignees/", userData);
  return http.post(apiUrl + "/complainers/", userData);
}

export function registerAdmin(userData) {
  return http.post(apiUrl + "/admins/", userData);
}

export function createFormData({
  data,
  currentUser,
  responsibilities,
  profilePath,
  isAssignee,
  companyId
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
  if (companyId) fd.append("companyId", companyId);
  return fd;
}

export function updateUser(userId, userData, isAssignee) {
  if (isAssignee) return http.put(apiUrl + "/assignees/" + userId, userData);
  return http.put(apiUrl + "/complainers/" + userId, userData);
}

export function updateAdmin(userId, userData) {
  return http.put(apiUrl + "/admins/" + userId, userData);
}

// export function getPaginatedUsers(role, pageSize) {
//   return http.get(`${apiUrl}/${role}/allUsers/` + pageSize);
// }
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
  // alert(userId + " " + role);

  return http.get(`${apiUrl}/${role}s/${userId}`);
}

export function getSpecificAdmin(id) {
  return http.get(`${apiUrl}/admins/${id}`);
}

export function getUserByEmail(body) {
  return http.post(`${apiUrl}/admins/user/search`, body);
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
