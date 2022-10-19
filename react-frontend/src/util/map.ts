import { RouteExistsError } from "../errors/route-exists.error";

export class Route {
  public currentMarker: google.maps.Marker;
  public endMarker: google.maps.Marker;
  private directionsRenderer: google.maps.DirectionsRenderer;

  constructor(options: {
    currentMarkerOptions: google.maps.ReadonlyMarkerOptions;
    endMarkerOptions: google.maps.ReadonlyMarkerOptions;
  }) {
    const { currentMarkerOptions, endMarkerOptions } = options;
    this.currentMarker = new google.maps.Marker(currentMarkerOptions);
    this.endMarker = new google.maps.Marker(endMarkerOptions);

    const strokeColor = (this.currentMarker.getIcon() as google.maps.ReadonlySymbol)
      .strokeColor;

    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor,
        strokeOpacity: 0.5,
        strokeWeight: 5,
      },
    });
    this.directionsRenderer.setMap(
      this.currentMarker.getMap() as google.maps.Map
    );

    this.calculateRoute();
  }

  private calculateRoute() {
    const currentPosition = this.currentMarker.getPosition() as google.maps.LatLng;
    const endPosition = this.endMarker.getPosition() as google.maps.LatLng;

    new google.maps.DirectionsService().route({
      origin: currentPosition,
      destination: endPosition,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === "OK") {
        this.directionsRenderer.setDirections(result);
        return;
      }

      throw new Error(status);
    });
  }

  delete() {
    this.currentMarker.setMap(null);
    this.endMarker.setMap(null);
    this.directionsRenderer.setMap(null);
  }
}

export class Map {
  public map: google.maps.Map;
  private routes: { [id: string]: Route } = {}

  constructor(element: Element, options: google.maps.MapOptions) {
    this.map = new google.maps.Map(element, options);
  }

  moveCurrentMarket(id: string, position: google.maps.LatLngLiteral) {
    this.routes[id].currentMarker.setPosition(position);
  }

  removeRoute(id: string) {
    const route = this.routes[id];
    route.delete();
    delete this.routes[id];
  }

  addRoute(
    id: string,
    routeOptions: {
      currentMarkerOptions: google.maps.ReadonlyMarkerOptions;
      endMarkerOptions: google.maps.ReadonlyMarkerOptions;
    }
  ) {
    if (id in this.routes) {
      throw new RouteExistsError();
    }

    const { currentMarkerOptions, endMarkerOptions } = routeOptions;
    this.routes[id] = new Route({
      currentMarkerOptions: { ...currentMarkerOptions, map: this.map },
      endMarkerOptions: { ...endMarkerOptions, map: this.map },
    });

    this.fitBounds();
  }

  private fitBounds() {
    const bounds = new google.maps.LatLngBounds();

    Object.keys(this.routes).forEach((id: string) => {
      const route = this.routes[id];
      bounds.extend(route.currentMarker.getPosition() as any);
      bounds.extend(route.endMarker.getPosition() as any);
    });

    this.map.fitBounds(bounds);
  }
}

export const makeCarIcon = (color: string) => ({
  path:
    "M10 37.8V42H6V24.3L10.75 10h26.5L42 24.3V42h-4.05v-4.2Zm.15-16.5h27.7L35.1 13H12.9Zm4.15 11q1.15 0 1.925-.8.775-.8.775-1.9 0-1.15-.775-1.975-.775-.825-1.925-.825t-1.975.825q-.825.825-.825 1.975 0 1.15.825 1.925.825.775 1.975.775Zm19.45 0q1.15 0 1.975-.8.825-.8.825-1.9 0-1.15-.825-1.975-.825-.825-1.975-.825-1.15 0-1.925.825-.775.825-.775 1.975 0 1.15.8 1.925.8.775 1.9.775Z",
  fillColor: color,
  strokeColor: color,
  strokeWeight: 1,
  fillOpacity: 1,
  anchor: new google.maps.Point(26, 20),
});

export const makeMarkerIcon = (color: string) => ({
  path:
    "M24 23.5q1.45 0 2.475-1.025Q27.5 21.45 27.5 20q0-1.45-1.025-2.475Q25.45 16.5 24 16.5q-1.45 0-2.475 1.025Q20.5 18.55 20.5 20q0 1.45 1.025 2.475Q22.55 23.5 24 23.5ZM24 44q-8.05-6.85-12.025-12.725Q8 25.4 8 20.4q0-7.5 4.825-11.95Q17.65 4 24 4q6.35 0 11.175 4.45Q40 12.9 40 20.4q0 5-3.975 10.875T24 44Z",
  fillColor: color,
  strokeColor: color,
  strokeWeight: 1,
  fillOpacity: 1,
  anchor: new google.maps.Point(26, 20),
});
