import React, { Component } from "react";
import CompanyDetailsForm from "../common/companyDetailsForm";
import Settings from "./../admin/Configuration/Settings";
import AdminForm from "../common/adminForm";
class Wizard extends Component {
  state = { step: 1 };

  // Proceed to next step
  handleNextStep = () => {
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
  };

  // Go back to prev step
  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1
    });
  };

  render() {
    let { step } = this.state;

    switch (step) {
      case 1:
        return (
          <CompanyDetailsForm {...this.props} onNext={this.handleNextStep} />
        );
      case 2:
        return (
          <div className="container">
            <div className="card-body">
              <Settings />
            </div>
            <div className="card-footer">
              <button
                className="btn button-outline-primary"
                onClick={this.handleNextStep}
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return <AdminForm {...this.props} onNext={this.handleNextStep} />;
      case 4:
        return <h4>Congrats you are all set</h4>;
      default:
        return <h3>Default</h3>;
    }
  }
}

export default Wizard;
