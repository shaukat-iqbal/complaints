import React, { useEffect } from "react";
import { useState } from "react";
// import httpService from "../../services/httpService";
import config from "../../config.json";
import {
  getReportOfMonth,
  getComplaintsByRole
} from "../../services/complaintService";
import { sendEmailToAuthorities } from "../../services/emailService";
import { toast } from "react-toastify";

import DatePickerModal from "./DatePickerModal";
import MembersModal from "./MembersModal";
import PieChart from "./charts/pie";
import BarChart from "./charts/bar";
import LineChart from "./charts/LineChart";
import { getConfigToken } from "../../services/configurationService.js";
import { countComplainers } from "../../services/complainerService.js";

const Chart = props => {
  const [reportname, setReportname] = useState("");
  const [reportPath, setReportPath] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complainersCount, setComplainersCount] = useState([]);
  // handleGenerateReport
  const handleGenerateReport = async body => {
    let companyId = getConfigToken().companyId;
    window.open(
      `${config.apiUrl}/admin-complaints/generateReport/${companyId}/${body.from}/${body.to}`
    );
    body.companyId = companyId;
    try {
      const { headers } = await getReportOfMonth(body);
      console.log(headers);
      setReportname(headers.filename.split("\\")[3]);
      setReportPath(headers.filename);
      setIsOpen(false);
    } catch (error) {
      toast.error("Some error occured");
    }
  };
  useEffect(() => {
    async function setAttributes() {
      let { data: complaints } = await getComplaintsByRole();
      let { data: months } = await countComplainers();
      setComplainersCount(months);
      setComplaints(complaints);
    }
    setAttributes();
  }, []);

  const onClose = () => {
    setIsOpen(false);
    setIsMembersDialogOpen(false);
  };

  const showMembersDialog = () => {
    setIsMembersDialogOpen(true);
  };

  const handleEmailSend = async recievers => {
    setIsMembersDialogOpen(false);
    try {
      const data = {
        recievers: JSON.stringify(recievers),
        reportName: reportname
      };
      const { data: response } = await sendEmailToAuthorities(data);
      toast.success(response);
    } catch (error) {
      toast.error("Some error ocuured while sending email");
    }
  };
  const showModal = () => {
    setIsOpen(true);
  };
  return (
    <div className="container">
      <button className="btn button-outline-secondary mb-3" onClick={showModal}>
        Generate Report
      </button>
      {reportname && (
        <div>
          Your report has been generated with name "{" "}
          <i className="fa fa-file-pdf-o" style={{ color: "#b65599" }}></i>{" "}
          {reportname} "{/* #fc4364 */}
          <button
            className="btn button-outline-primary btn-sm my-3 ml-4"
            onClick={showMembersDialog}
          >
            Send Report
          </button>
        </div>
      )}

      <DatePickerModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleGenerateReport}
      />

      <MembersModal
        isOpen={isMembersDialogOpen}
        onClose={onClose}
        onSubmit={handleEmailSend}
      />

      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-12 ">
          <BarChart complaints={complaints} />
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12  ">
          <LineChart
            chartData={{
              data: complainersCount,
              label: "Users Registered"
            }}
          />
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12  ">
          <PieChart complaints={complaints} />
        </div>
      </div>
    </div>
  );
};

export default Chart;
