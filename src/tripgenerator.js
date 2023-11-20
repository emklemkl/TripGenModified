const randomPointsOnPolygon = require('random-points-on-polygon');
const geoPointInPolygon = require('geo-point-in-polygon');
require('dotenv').config();
const token = process.env.TOKEN;
const fs = require('fs');
const polyline = require('@mapbox/polyline');
const counter = require("../counter.json")
const tokenGenerator = require("./tokengenerator.js");

const tripGenerator = {
    cityid: 1,
    /**
     * Coordinates of the city as polygon
     * Note! Loaded from file!
     */
    cityCoords: {},
    /**
     * Coordinates of the forbidden zones within the city,
     * an array of Polygons - Note! loaded from json file!
     */
    forbidden: [],
    /**
     * Set this attribute to false if you do not want the
     * endpoint of last trip to be the same as startpoint of first trip
     */
    sameStartEnd: false,
    
    /**
     * Number of subsequent routes (endpoint for route n = startpoint for route n + 1)
     * that will be generated for each bike. If number of routes per bike is higher than
     * 2 then endpoint of the last route will be start-point of first route
     */
    routesPerBike: 3,

    /**
     * Number of bikes to generate routes for
     */
    bikes: 5,

    /**
     * Maximal distance between start and endpoint
     * of a trip "birdway"
     */
    maxDistance: 0.0549976308604803,

    /**
     * Minimal distance between start and endpoint
     * of a trip "birdway"
     */
    minDistance: 0.0192575756257603,

    /**
     * Sets the coordinates for city area and the forbidden zones
     * @param {Number} cityid  - number of the json document containing
     * the city data
     */
    setCoords: function setCoords() {
        const city = require(`../cities/${this.cityid}.json`);

        this.cityCoords = city.coords;


        for (const zone of city.forbidden) {
            this.forbidden.push(zone.geometry.coordinates);
        }

        // Optional way to set distance by inserting
        // coords into the city json file
        if (city.start && city.min && city.max) {
            this.minDistance = this.calcDistance(city.start, city.min);
            this.maxDistance = this.calcDistance(city.start, city.max);
        }
    },
    /**
    * distance is square root of (delta-x squared + delta-y squared)
    */
    calcDistance: function calcDistance(startpoint, endpoint) {
        return ((startpoint[0]-endpoint[0]) ** 2 + (startpoint[1]-endpoint[1]) ** 2) ** (1/2);
    },
    withinDistance: function withinDistance(startpoint, endpoint) {
        // const distance = ((startpoint[0]-endpoint[0]) ** 2 + (startpoint[1]-endpoint[1]) ** 2) ** (1/2);
        const distance = this.calcDistance(startpoint, endpoint);

        return distance >= this.minDistance ** 2 && distance <= this.maxDistance ** 2;
    },

    /**
     * Returns an array with lat and long coords,
     * within the city area but not in any of the forbidden zones
     * @returns {array}
     */
    getPoint: function getPoint(startPoint=null) {
        const numberOfPoints = 1;
        const polygon = this.cityCoords;
        let point;

        while (!point) {
            let temp = randomPointsOnPolygon(numberOfPoints, polygon);
            let inForbidden = false;
            let withinDistance = true;
            const tempCoords = temp[0].geometry.coordinates;

            if (startPoint) {
                withinDistance = this.withinDistance(startPoint, tempCoords);
            }

            if (withinDistance) {
                for (const zone of this.forbidden) {
                    const zoneCoords = zone[0];
                    
                    if (geoPointInPolygon(tempCoords, zoneCoords)) {
                        inForbidden = true;
                        break;
                    }
                }
                if (!inForbidden) {
                    point = tempCoords;
                    break;
                }
            }
        }
        return point;
    },

    /**
     * 
     * @param {array} start array with lat and long coords for start point
     * @param {array} end array with lat and long coords for end point
     * @returns an associative array containing polyline-encoded coordinates
     * for a route between start point and end point and an array containing
     * duration and distance data for waypoints along the coords
     */
    getTripCoords: async function getTripCoords(start, end) {
        let params = {
            coordinates:[start, end],
            // preference:"shortest",
            options:
            {
                avoid_polygons:
                {
                    coordinates: this.forbidden,
                    "type":"MultiPolygon"
                }
            }
        }
        const url = "https://api.openrouteservice.org/v2/directions/cycling-electric/json";
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(params)
        });
        const resJson = await res.json();

        return resJson.routes[0].geometry;
    },

    /**
     * Reverses the coordinates to be in "geojson"-order
     * @param {array} coordsArr - array with lng lat coords
     * @returns {array} coords in reversed order
     */
    reverseCoords: function reverseCoords(coordsArr) {
        return coordsArr.map((coord) => coord.reverse());
    },

    /**
     * Generate many routes to json and csv files
     */
    generateMany: async function generateMany() {
        const stopAt = counter.bike + this.bikes;

        for (let bike=counter.bike; bike<stopAt; bike++) {
            const initial = this.getPoint();
            let startPoint = initial;
            let endPoint = this.getPoint(startPoint);

            while (endPoint === startPoint) {
                endPoint = this.getPoint(startPoint);
            }
            const bikeObj = {
                city: this.cityid,
                initialStart: startPoint,
                trips: [],
            };

            let route = 1
    
            while (route<=this.routesPerBike) {
                try {
                    const trip = await this.getTripCoords(startPoint, endPoint);
                    const trip_decoded = this.reverseCoords(polyline.decode(trip));
                    const userId = counter.user;

                    tripObj = {
                        user: {
                            id: userId,
                            token: tokenGenerator.getOne(userId)
                        },
                        coords: trip_decoded
                    };


                    bikeObj.trips.push(tripObj);
        
                    // Append one trip to the general csv file
    
                    startPoint = endPoint;
                    route++;
                    counter.user += 1;
                } catch (error) {
                    console.error(error, "Bad response from OpenRouteService, exiting with status code 1")
                    process.exit(1);
                }


                if (route === this.routesPerBike - 1 && this.sameStartEnd && this.routesPerBike > 2) {
                    endPoint = initial;
                } else {
                    while (endPoint === startPoint) {
                        endPoint = this.getPoint(startPoint);
                    }
                }
            }

            // Save all trips for one bike to a new json file
            fs.writeFileSync(`./bike-routes/${bike}.json`, JSON.stringify(bikeObj, null, 4));
            fs.appendFileSync("./bike-routes/bike.csv", `"${bike}","${JSON.stringify(initial)}"\r\n`);
            counter.bike += 1;
            fs.writeFileSync(`./counter.json`, JSON.stringify(counter, null, 4));
        }
        // Update the number in the bike_counter file, in order to not use
        // same "bike ids" next time
    }
}

module.exports = tripGenerator;
