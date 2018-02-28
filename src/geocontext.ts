declare var process: {browser: boolean;};

// We want a single default export.
/* tslint:disable:no-default-export */

/** Default IP-based geolocation accuracy (in meters). */
export const DEFAULT_IP_ACCURACY = 10000;

/** Options. */
export interface GeocontextOptions {
  /**
   * Mock coordinates. If supplied, these coordinates are returned instead of
   * real coordinates, and geolocation is not queried.
   */
  mockCoordinates?: Coordinates;
  /**
   * Optional "accuracy" to return when IP-based geolocation services are used,
   * in meters. Defaults to 10000.
   */
  ipAccuracy?: number;
}

/**
 * A function which matches the API of the W3C Geolocation specification
 * https://w3c.github.io/geolocation-api/#navi-geo
 */
export type W3CCurrentPositionRequest =
    (successCallback: (position: Position) => void,
     errorCallback?: (error: PositionError) => void,
     options?: PositionOptions) => void;

/**
 * A function which takes an optional option and returns a promise which
 * supplies a position.
 */
export type PositionPromiseRequest = (options?: PositionOptions) =>
    Promise<Position>;

/**
 * The interface to a geographical context, which currently implements two
 * functions to get the current position.
 */
export interface Geocontext {
  /**
   * A function which returns the current position. Provides the same API as
   * the W3C Geolocation spec https://w3c.github.io/geolocation-api/#navi-geo
   */
  getCurrentPosition: W3CCurrentPositionRequest;
  /** Get a promise which returns the current position when fulfilled. */
  getCurrentPositionPromise: PositionPromiseRequest;
}

class MockGeocontext implements Geocontext {
  constructor(public mockCoordinates: Coordinates) {}

  getCurrentPosition(
      successCallback: (position: Position) => void,
      errorCallback?: (error: PositionError) => void,
      options?: PositionOptions) {
    successCallback(this.getMockPosition());
  }

  async getCurrentPositionPromise(options?: PositionOptions):
      Promise<Position> {
    return this.getMockPosition();
  }

  getMockPosition(): Position {
    return {coords: this.mockCoordinates, timestamp: Date.now()};
  }
}

const toPromiseApi =
    (posRequest: W3CCurrentPositionRequest): PositionPromiseRequest => {
      return (options?: PositionOptions) => {
        const p = new Promise<Position>((resolve, reject) => {
          posRequest(
              (result: Position) => resolve(result),
              (error: PositionError) => reject(error), options);
        });
        return p;
      };
    };

interface IpLocationInfo {
  lat: number;
  lon: number;
}

/**
 * Get a GeoContext object used for querying the geographical context.
 *
 * @param {GeocontextOptions} options   Optional options to supply (mocking, etc.)
 * @returns {Geocontext}                A geographical context.
 */
export default function getGeoContext(options?: GeocontextOptions): Geocontext {
  if (options !== undefined && options.mockCoordinates !== undefined) {
    return new MockGeocontext(options.mockCoordinates);
  } else if (process.browser) {
    if ('geolocation' in navigator) {
      return {
        getCurrentPosition: navigator.geolocation.getCurrentPosition,
        getCurrentPositionPromise:
            toPromiseApi(navigator.geolocation.getCurrentPosition)
      };
    }
    throw new Error('Geolocation not supported by browser!');
  } else {
    // If macos Core Location is available, use it.
    try {
      const macosLocation = require('macos-location');
      return {
        getCurrentPosition: macosLocation.getCurrentPosition,
        getCurrentPositionPromise:
            toPromiseApi(macosLocation.getCurrentPosition)
      };
    } catch {
      // If Core Location is not avaiable, fall back to ip location
      const ipLocation: (location?: string) => Promise<IpLocationInfo> =
          require('iplocation');
      const ipAccuracy =
          options !== undefined && options.ipAccuracy !== undefined ?
          options.ipAccuracy :
          10000;
      return {
        getCurrentPosition: (success, fail, options) => {
          ipLocation()
              .then(res => success({
                      coords: {
                        latitude: res.lat,
                        longitude: res.lon,
                        accuracy: ipAccuracy,
                        speed: null,
                        heading: null,
                        altitude: null,
                        altitudeAccuracy: null
                      },
                      timestamp: Date.now()
                    }))
              .catch(err => {
                const error = {
                  code: PositionError.POSITION_UNAVAILABLE,
                  message: 'Couldn\'t get IP-based position!',
                };
                if (fail !== undefined) {
                  fail(error as PositionError);
                }
              });
        },
        getCurrentPositionPromise: async (options) => {
          const loc = await ipLocation();
          return {
            coords: {
              latitude: loc.lat,
              longitude: loc.lon,
              accuracy: ipAccuracy,
              speed: null,
              heading: null,
              altitude: null,
              altitudeAccuracy: null
            },
            timestamp: Date.now()
          };
        }
      };
    }
  }
}