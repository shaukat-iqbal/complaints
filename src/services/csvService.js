import http from "./httpService";
import { apiUrl } from "../config.json";

export function getSample(fileName) {
  return http.get(apiUrl + `/samplecsv/${fileName}.csv`, {
    responseType: "blob"
  });
}
