import http from "./httpService";
import config from "../config.json";

// let endPoint=config.apiUrl + "/locations";

export function getLocations() {
  return http.get(config.apiUrl + "/locations/all");
}

export function getAssigneeLocations() {
  return http.get(config.apiUrl + "/locations/assignee/allLocations/all");
}

export function getSpecificLocations() {
  return http.get(config.apiUrl + "/locations/assignee");
}

// getting locations for selection with no parent
export function getLocationsWithNoParent() {
  return http.get(config.apiUrl + "/locations/specific/noparent");
}

// getting locations for selection with no parent
export function getLocationsWithParent(locationId) {
  return http.get(config.apiUrl + `/locations/specific/parent/${locationId}`);
}

// getting locations for selection with no parent
export function getParentLocation(locationId) {
  return http.get(
    config.apiUrl + `/locations/find/parent/location/${locationId}`
  );
}

export function getSiblingsOf(locationId) {
  return http.get(config.apiUrl + "/locations/siblingsOf/" + locationId);
}

export function getChildsOf(locationId) {
  return http.get(config.apiUrl + "/locations/childsOf/" + locationId);
}
export function getLocationById(locationId) {
  return http.get(config.apiUrl + "/locations/" + locationId);
}

export function updateLocationById(locationId, body) {
  return http.put(config.apiUrl + "/locations/" + locationId, body);
}

export function createLocation(body) {
  return http.post(config.apiUrl + "/locations/", body);
}
export function deleteLocation(id) {
  return http.delete(config.apiUrl + "/locations/" + id);
}
export function deleteChildsOf(id) {
  return http.delete(config.apiUrl + "/locations/childsOf/" + id);
}
// getting locations for selection with no parent
export function insertMultipleLocations(body) {
  return http.post(config.apiUrl + `/locations/bulk`, body);
}

export function updateMultipleLocations(locations) {
  return http.put(config.apiUrl + `/locations/updatebulk`, {
    locations: locations
  });
}

export function getRootLocation() {
  return http.get(config.apiUrl + "/locations/root/location");
}

export function getMultiplePaths(body) {
  return http.post(config.apiUrl + "/locations/get/multiplePaths", body);
}

export function getSinglePath(id) {
  return http.get(config.apiUrl + "/locations/fullPath/" + id);
}
