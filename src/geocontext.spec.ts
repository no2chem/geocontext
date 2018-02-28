import 'mocha';
import * as chai from 'chai';
import geocontext from './geocontext';

chai.should();

// Needed for should.not.be.undefined.
/* tslint:disable:no-unused-expression */

it('Can use a promise to get location', async () => {
  const location = await geocontext().getCurrentPositionPromise();
  location.coords.longitude.should.not.be.undefined;
  location.coords.longitude.should.not.be.null;
  location.coords.latitude.should.not.be.undefined;
  location.coords.latitude.should.not.be.null;
});

it('Can use callback API to get location', (done) => {
  geocontext().getCurrentPosition(location => {
    location.coords.longitude.should.not.be.undefined;
    location.coords.longitude.should.not.be.null;
    location.coords.latitude.should.not.be.undefined;
    location.coords.latitude.should.not.be.null;
    done();
  });
});

it('Can use a mocked coordinate (with promises)', async () => {
  const location = await geocontext({
                     mockCoordinates: {
                       latitude: 10,
                       longitude: 20,
                       accuracy: 100,
                       speed: null,
                       heading: null,
                       altitude: null,
                       altitudeAccuracy: null
                     }
                   }).getCurrentPositionPromise();

  location.coords.latitude.should.be.eq(10);
  location.coords.longitude.should.be.eq(20);
  location.coords.accuracy.should.be.eq(100);
});

it('Can use a mocked coordinate (with callback API)', (done) => {
  geocontext({
    mockCoordinates: {
      latitude: 10,
      longitude: 20,
      accuracy: 100,
      speed: null,
      heading: null,
      altitude: null,
      altitudeAccuracy: null
    }
  }).getCurrentPosition(location => {
    location.coords.latitude.should.be.eq(10);
    location.coords.longitude.should.be.eq(20);
    location.coords.accuracy.should.be.eq(100);
    done();
  });
});