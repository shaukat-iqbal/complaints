import http from "./httpService";
import config from "../config.json";

export function getCategories() {
  return http.get(config.apiUrl + "/categories/all");
}

export function getAssigneeCategories() {
  return http.get(config.apiUrl + "/categories/assignee");
}

export function getSpecificCategories(categoryId) {
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
