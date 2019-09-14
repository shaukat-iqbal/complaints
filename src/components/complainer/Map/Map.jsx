import React, { Component } from "react";
import google from "react-google-maps";
import styles from "./Map.module.css";

class Map extends Component {
  constructor(props) {
    super(props);

    this.map = null;
    this.marker = null;
    this.state = {
      currentLocation: {
        lat: 0.0,
        lng: 0.0
      }
    };
  }

  componentDidMount() {
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = pos.coords;
        this.setState({
          currentLocation: {
            lat: coords.latitude,
            lng: coords.longitude
          }
        });
        this.setPin(coords.latitude, coords.longitude);
      });

      this.map = new Window.google.maps.Map(document.getElementById("root"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
      });
    } else {
      //TODO:
    }
  }

  setPin(lat, lng) {
    if (this.map) {
      this.map.setCenter({ lat: lat, lng: lng });

      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }

      this.marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: this.map,
        title: "Current Location"
      });
    } else {
      console.log("Map has not loaded yet");
    }
  }

  render() {
    return (
      <div class="app">
        {this.state.currentLocation.lat} / {this.state.currentLocation.lng}
        <div id="map" />
      </div>
    );
  }
}

export default Map;
