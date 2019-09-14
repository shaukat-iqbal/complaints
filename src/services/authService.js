import jwtDecode from "jwt-decode";
import http from "./httpService";

import { apiUrl } from "../config.json";

const tokenKey = "token";

http.setJwt(getJwt());

export async function login(email, password, apiEndpoint) {
  const Endpoint = apiUrl + apiEndpoint;
  const { data: jwt } = await http.post(Endpoint, {
    email,
    password
  });
  localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  localStorage.removeItem(tokenKey);
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
