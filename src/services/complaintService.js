import http from "./httpService";
import config from "../config.json";

export function getComplaints() {
  return http.get(config.apiUrl + "/complainer-complaints");
}

// getting a single complaint
export function getComplaint(complaintId) {
  return http.get(config.apiUrl + "/complainer-complaints/" + complaintId);
}

// getting a single complaint
export function getComplaintForAdmin(complaintId) {
  return http.get(config.apiUrl + "/admin-complaints/" + complaintId);
}

// saving a complaint
export function saveComplaint(complaint) {
  return http.post(config.apiUrl + "/complainer-complaints", complaint);
}

// saving a complaint
export function reOpen(id) {
  return http.put(config.apiUrl + "/assignee-complaints/" + id, {
    status: "in-progress"
  });
}

// downloading file
export function downloadFile(complaintId) {
  return http.get(
    config.apiUrl + "/complainer-complaints/download/image/" + complaintId
  );
}

// view file
export function viewFile(complaintId) {
  return http.get(
    config.apiUrl + "/complainer-complaints/view/image/" + complaintId
  );
}

// getting all admin complaints
export function getAdminComplaints(
  pageNum = 1,
  pageSize = 10,
  searchBy = "",
  searchKeyword = "",
  keywordType
) {
  console.log(
    `${config.apiUrl}/admin-complaints/paginated/${pageNum}/${pageSize}?searchBy=${searchBy}&searchKeyword=${searchKeyword}&keywordType=${keywordType}`
  );
  return http.get(
    `${config.apiUrl}/admin-complaints/paginated/${pageNum}/${pageSize}?searchBy=${searchBy}&searchKeyword=${searchKeyword}&keywordType=${keywordType}`
  );
}

// getting all assignee complaints
export function getAssigneeComplaints() {
  return http.get(config.apiUrl + "/assignee-complaints");
}

// changing status
export function changeStatus(complaintId, status, remarks) {
  return http.put(
    config.apiUrl + `/assignee-complaints/${complaintId}/${status}/${remarks}`
  );
}

// marking spam
export function markSpam(complaintId, spam) {
  return http.put(
    config.apiUrl + `/assignee-complaints/${spam}/${complaintId}`
  );
}

// marking remove spam
export function removeSpam(complaintId) {
  return http.put(
    config.apiUrl + `/assignee-complaints/remove/spam/${complaintId}`
  );
}

// getting spam complaints
export function getSpamList() {
  return http.get(
    config.apiUrl + `/assignee-complaints/assignee/spam/complaints`
  );
}

// giving feedback
export function giveFeedback(complaintId, feedback) {
  return http.put(
    config.apiUrl + `/complainer-complaints/feedback/${complaintId}`,
    feedback
  );
}

// Task assignment ( complaint )
export function taskAssignment(complaintId, assigneeId) {
  return http.put(
    config.apiUrl + `/admin-complaints/assigned/${complaintId}/${assigneeId}`
  );
}

// drop responsibility ( Assignee )
export function dropResponsibility(complaintId) {
  return http.put(config.apiUrl + `/assignee-complaints/drop/${complaintId}`);
}

// getting all spam complaints
export function getAllSpamComplaints() {
  return http.get(config.apiUrl + `/complainer-complaints/get/all/spam`);
}

// getting all in progress complaints
export function getAllprogressComplaints() {
  return http.get(config.apiUrl + `/complainer-complaints/get/all/progress`);
}

// getting all Resolved complaints
export function getAllResolvedComplaints() {
  return http.get(config.apiUrl + `/complainer-complaints/get/all/resolved`);
}

// getting all Resolved complaints
export function getReport() {
  return http.get(config.apiUrl + `/admin-complaints/generate/pdf/v1`);
}

// Generating report of specified month
export function getReportOfMonth(body) {
  return http.get(
    config.apiUrl +
      `/admin-complaints/generateReport/${body.companyId}/${body.from}/${body.to}`
  );
}

export function segmentsCount() {
  return http.get(config.apiUrl + `/admin-complaints/segments/count`);
}

export function calculateAggregate() {
  return http.get(config.apiUrl + `/admin-complaints/aggregate/monthwise`);
}
