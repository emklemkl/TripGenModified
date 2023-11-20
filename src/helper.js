const fs = require('fs');
const cityid = 1;
const city = require(`../cities/${cityid}.json`);
const forbiddenId = 4;

fs.appendFileSync("../cities/city.csv", `'id','name', 'geometry'\r\n`);
fs.appendFileSync("../cities/city.csv", `'${city.id}','${city.name}','${JSON.stringify(city.coords.geometry)}'\r\n`);

fs.appendFileSync("../cities/zone_loc.csv", `'zone_id','city_id', 'date_from', 'geometry'\r\n`);



for (const zone of city.forbidden) {
    if (zone.properties.role === "forbidden") {
        fs.appendFileSync("../cities/zone_loc.csv", `'${forbiddenId}','${city.id}','2023-10-01','${JSON.stringify(zone.geometry)}'\r\n`);
    }
}