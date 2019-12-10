import React, { Component } from "react";
import LocationsList from "./LocationsList";
import {
  getSiblingsOf,
  getChildsOf,
  getLocationsWithNoParent
} from "../../services/locationService";
import "./../admin/usersManagement/categories.css";

class Locations extends Component {
  state = {
    locations: [],
    isLoading: true,
    isOpen: false
  };

  async componentDidMount() {
    const { data: locations } = await getLocationsWithNoParent();

    this.setState({
      locations,
      isLoading: false,
      isOpen: this.props.isOpen,
      parentLocationName: "Root Locations"
    });
  }

  handleClick = async event => {
    const id = event.target.value;
    let { parentLocationName } = this.state;
    let location = this.state.locations.find(l => l._id === id);
    if (location) parentLocationName = location.name;

    const { data: locations } = await getChildsOf(id);
    if (locations.length > 0) {
      this.setState({ locations: locations, parentLocationName });
      return;
    }
    const { locations: allCategories } = this.state;
    let selected = allCategories.find(c => c._id === id);
    if (selected) this.props.onCategorySeletion(selected);
  };

  // to close the opened locations dialog
  handleClose = () => {
    this.setState({ isOpen: false });
  };

  handleBack = async () => {
    try {
      const { data: siblingCategories } = await getSiblingsOf(
        this.state.locations[0].parentLocation
      );
      if (siblingCategories.length > 0)
        this.setState({ locations: siblingCategories });
    } catch (error) {}
  };

  render() {
    return (
      <LocationsList
        locations={this.state.locations}
        parentLocationName={this.state.parentLocationName}
        isLoading={this.state.isLoading}
        onClick={this.handleClick}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        onBack={this.handleBack}
        onTick={this.props.onCategorySeletion}
        isCrud={this.props.isCrud}
      />
    );
  }
}

export default Locations;
