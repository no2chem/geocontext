# Geocontext - A cross-platform geographical context API

[![Build Status](https://travis-ci.org/no2chem/geocontext.svg?branch=master)](https://travis-ci.org/no2chem/geocontext)

Geocontext provides an API to query the geographical context (geocontext) of a user in a simple, cross-platform way. It is designed to work both in the browser as well in node.

In the browser, the [W3C geolocation API](https://w3c.github.io/geolocation-api/#navi-geo) is used if available. In node.js, two mechanisms are used: If running on macos, the CoreLocation services are used through the [macos-location](https://www.npmjs.com/package/macos-location) module. Otherwise, IP-based geolocation is used using [iplocation](https://www.npmjs.com/package/iplocation).

To make life using promises simpler, a promisified version of the W3C API is also provided. The API is the same whether running in the browser, on macos, or when the IP-based geolocation fallback is used. 

You can find API documentation [here](https://no2chem.github.io/geocontext/). Typescript definitions are included.

A quick example which prints the current geographical context:
```typescript
import geolocation from "geolocation";

async function printContext() : void {
  let location = await geocontext().getCurrentPositionPromise();
  console.log(JSON.stringify(location, null , 2));
};

printContext();
```
