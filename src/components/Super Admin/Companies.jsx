import React, { Component } from "react";
import { getAllCompanies } from "../../services/companiesService";
import { paginate } from "../../utils/paginate";
import _ from "lodash";
import CompaniesTable from "./CompaniesTable";
import Pagination from "../common/pagination";
import SearchBox from "../common/searchBox";
import CompanyDetailsForm from "../common/companyDetailsForm";
import { Dialog } from "@material-ui/core";
import Loading from "../common/loading";

class Companies extends Component {
  state = {
    isLoading: true,
    pageSize: 10,
    currentPage: 1,
    sortColumn: { path: "name", order: "asc" },
    searchQuery: "",
    selectedCompany: null,
    searchBy: "name",
    companies: []
  };

  async componentDidMount() {
    let { data: companies } = await getAllCompanies();
    console.log("Companies returned", companies);
    this.setState({ companies, isLoading: false });
  }

  handleDetail = company => {
    // console.log(company);
    this.setState({
      selectedCompany: company,
      isProfileView: true,
      isEditView: false,
      isDetailFormEnabled: true
    });
  };

  handleClose = () => {
    this.setState({ selectedCompany: null, isDetailFormEnabled: false });
  };

  handleEdit = company => {
    this.setState({
      selectedCompany: company,
      isProfileView: false,
      isEditView: true,
      isDetailFormEnabled: true
    });
  };

  // handle pagination
  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  // handle Sort
  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };
  // handle Search
  handleSearch = query => {
    this.setState({
      searchQuery: query,
      selectedCategory: null,
      currentPage: 1
    });
  };
  render() {
    const {
      companies: allCompanies,
      pageSize,
      sortColumn,
      currentPage,
      selectedCompany,
      searchQuery,
      isEditView,
      isProfileView
    } = this.state;

    let filtered = allCompanies;
    if (searchQuery) {
      filtered = allCompanies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const companies = paginate(sorted, currentPage, pageSize);

    return (
      <div>
        {this.state.isLoading && <Loading />}
        {this.state.companies.length > 0 && (
          <div className="container mt-5">
            <Dialog
              open={this.state.isDetailFormEnabled}
              onClose={this.handleClose}
              fullWidth={true}
              maxWidth="md"
              scroll={"paper"}
              height="500px"
            >
              <CompanyDetailsForm
                isEditView={isEditView}
                isProfileView={isProfileView}
                company={selectedCompany}
              />
            </Dialog>

            <div>
              Showing {filtered.length} of {this.state.companies.length}{" "}
              companies
            </div>

            <SearchBox value={searchQuery} onChange={this.handleSearch} />

            <CompaniesTable
              companies={companies}
              sortColumn={sortColumn}
              onSort={this.handleSort}
              onEdit={this.handleEdit}
              onDetail={this.handleDetail}
            />

            <Pagination
              itemsCount={filtered.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
        )}
      </div>
    );
  }
}

export default Companies;
