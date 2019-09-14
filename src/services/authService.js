import jwtDecode from "jwt-decode";
import http from "./httpService";

import { apiUrl } from "../config.json";

const tokenKey = "token";

http.setJwt(getJwt());

export function login(email, password, apiEndpoint) {
  const Endpoint = apiUrl + apiEndpoint;
  return http.post(Endpoint, {
    email,
    password
  });
  // console.log(response);
  // let profilePicture = "";
  // if (response.data.profilePicture)
  //   profilePicture = convertToPicture(response.data.profilePicture.data);
  // console.log(profilePicture);
  // if (localStorage.getItem("profilePicture"))
  //   localStorage.removeItem("profilePicture");
  // localStorage.setItem("profilePicture", profilePicture);
}

export function logout() {
  localStorage.removeItem(tokenKey);
  if (localStorage.getItem("profilePicture"))
    localStorage.removeItem("profilePicture");
}

export function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    return jwtDecode(jwt);
  } catch (ex) {
    // window.location = '/login';
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

export default {
  login,
  logout,
  getCurrentUser,
  getJwt
};
