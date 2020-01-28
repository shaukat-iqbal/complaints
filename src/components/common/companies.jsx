import React, { Component } from "react";
import { getAllCompanies } from "../../services/companiesService";
import CompaniesList from "./companiesList";

class Companies extends Component {
  state = {
    companies: [],
    isLoading: true,
    isOpen: false
  };

  async componentDidMount() {
    let { data: companies } = await getAllCompanies();
    // companies = companies.filter(company => company.status !== "De-Activated");
    this.setState({
      companies,
      isLoading: false,
      isOpen: this.props.isOpen
    });
  }

  handleClick = id => {
    this.props.onCompanySelection(id);
  };

  render() {
    return (
      <CompaniesList
        companies={this.state.companies}
        isLoading={this.state.isLoading}
        onClick={this.handleClick}
        isOpen={this.props.isOpen}
      />
    );
  }
}

export default Companies;
