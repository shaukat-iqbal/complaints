import http from "./httpService";
import config from "../config.json";

export function getCategories() {
  return http.get(config.apiUrl + "/categories/all");
}

export function getAssigneeCategories() {
  return http.get(config.apiUrl + "/categories/assignee/allCategories/all");
}

export function getSpecificCategories() {
  return http.get(config.apiUrl + "/categories/assignee");
}

// getting categories for selection with no parent
export function getCategoriesWithNoParent() {
  return http.get(config.apiUrl + "/categories/specific/noparent");
}

// getting categories for selection with no parent
export function getCategoriesWithParent(categoryId) {
  return http.get(config.apiUrl + `/categories/specific/parent/${categoryId}`);
}

// getting categories for selection with no parent
export function getSentimentCategory(details) {
  return http.post(config.apiUrl + `/categories/sentiment/selection`, details);
}
// getting categories for selection with no parent
export function getParentCategory(categoryId) {
  return http.get(
    config.apiUrl + `/categories/find/parent/category/${categoryId}`
  );
}

export function getSiblingsOf(categoryId) {
  return http.get(config.apiUrl + "/categories/siblingsOf/" + categoryId);
}

export function getChildsOf(categoryId) {
  return http.get(config.apiUrl + "/categories/childsOf/" + categoryId);
}
export function getCategoryById(categoryId) {
  return http.get(config.apiUrl + "/categories/" + categoryId);
}

export function updateCategoryById(categoryId, body) {
  return http.put(config.apiUrl + "/categories/" + categoryId, body);
}

export function createCategory(body) {
  return http.post(config.apiUrl + "/categories/", body);
}
export function deleteCategory(id) {
  return http.delete(config.apiUrl + "/categories/" + id);
}
export function deleteChildsOf(id) {
  return http.delete(config.apiUrl + "/categories/childsOf/" + id);
}
// getting categories for selection with no parent
export function insertMultipleCategories(body) {
  return http.post(config.apiUrl + `/categories/bulk`, body);
}

export function updateMultipleCategories(categories) {
  return http.put(config.apiUrl + `/categories/updatebulk`, {
    categories: categories
  });
}

export function getRootCategory() {
  return http.get(config.apiUrl + "/categories/root/category");
}

export function getMultiplePaths(body) {
  return http.post(config.apiUrl + "/categories/get/multiplePaths", body);
}

export function getSinglePath(id) {
  return http.get(config.apiUrl + "/categories/fullPath/" + id);
}

export function deleteMany(ids) {
  return http.post(config.apiUrl + "/categories/delete/many", ids);
}
