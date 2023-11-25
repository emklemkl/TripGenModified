const fs = require('fs');
const counter = require("../counter.json");
const geoTools = require('geo-tools');

// fs.writeFileSync("./stats.csv", `"bike","route","length_meter", "length_birdway","duration_sec", "duration_time"\r\n`);

for (let i = 1; i < counter.bike; i++) {
    const bike = require(`./${i}.json`);

    for (let j = 0; j<bike.trips.length; j++) {
        const from = {
            lng: bike.trips[j].coords[0][0],
            lat: bike.trips[j].coords[0][1]
        }
        const to = {
            lng: bike.trips[j].coords[bike.trips[j].coords.length - 1][0],
            lat: bike.trips[j].coords[bike.trips[j].coords.length - 1][1]
        }
        const meters = toMeters(distance(from, to));
        fs.appendFileSync("./stats.csv", `"${i}","${j+1}","${bike.trips[j].summary.distance}","${meters}","${bike.trips[j].summary.duration}","${Math.floor(bike.trips[j].summary.duration/60)} min ${Math.round(bike.trips[j].summary.duration % 60)} sec"\r\n`);
    }
}