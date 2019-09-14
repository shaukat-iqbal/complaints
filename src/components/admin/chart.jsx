import React from "react";
import { useState } from "react";
import SpamChart from "./charts/spamCharts";
import ProgressChart from "./charts/progressChart";
import ResolvedChart from "./charts/resolvedChart";
// import httpService from "../../services/httpService";
import config from "../../config.json";
import { getReport } from "../../services/complaintService";
import { sendEmailToAuthorities } from "../../services/emailService";
import { toast } from "react-toastify";

const Chart = props => {
  const [reportname, setReportname] = useState("");
  const [reportPath, setReportPath] = useState("");

  // handleGenerateReport
  const handleGenerateReport = async () => {
    // window.open(
    //   "http://localhost:5000/api/admin-complaints//generate/pdf/v1",
    //   "_blank"
    // );

    const { headers } = await getReport();
    console.log(headers);
    setReportname(headers.filename.split("\\")[3]);
    setReportPath(headers.filename);
  };

  const handleEmailSend = async () => {
    const data = {
      reportName: reportname
    };
    const { data: response } = await sendEmailToAuthorities(data);
    toast.success(response);
  };

  return (
    <div className="container">
      <a
        className="btn button-outline-secondary mb-3"
        href={`${config.apiUrl}/admin-complaints/generate/pdf/v1`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleGenerateReport}
      >
        Generate Report
      </a>
      {reportname && (
        <div>
          You report has been generated with name "{" "}
          <i className="fa fa-file-pdf-o" style={{ color: "#b65599" }}></i>{" "}
          {reportname} "{/* #fc4364 */}
          <button
            className="btn button-outline-primary btn-sm my-3 ml-4"
            onClick={handleEmailSend}
          >
            Send to Authorities?
          </button>
        </div>
      )}

      <div className="">
        <div className="text-center mb-3">
          <SpamChart />
        </div>

        <div className="text-center my-3">
          <ProgressChart />
        </div>
      </div>
      <div className="text-center">
        {/* <div className="card"> */}
        <ResolvedChart />
        {/* </div> */}
      </div>
    </div>
  );
};

export default Chart;
