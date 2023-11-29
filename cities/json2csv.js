/**
 * This is a script to convert your json city files
 * into data for csv that easily can be loaded into an SQL database
 */

const fs = require('fs');
const zoneId = {
    park: 1,
    charge: 2,
    forbidden: 3,
}
const speedLimit = 20;

const cities = [1]


fs.writeFileSync("./city.csv", `'id','name', 'speed_limit', 'geometry'\r\n`);
fs.writeFileSync("./zone_loc.csv", `'zone_id','city_id', 'date_from', 'geometry'\r\n`);

for (const cityid of cities) {
    const city = require(`./${cityid}.json`);
    fs.appendFileSync("./city.csv", `'${city.id}','${city.name}','${speedLimit}','${JSON.stringify(city.coords.geometry)}'\r\n`);
    for (const zone of city.forbidden) {
        if (zone.properties.role === "forbidden") {
            fs.appendFileSync("./zone_loc.csv", `'${zoneId.forbidden}','${city.id}','2023-10-01','${JSON.stringify(zone.geometry)}'\r\n`);
        }
    }
}






