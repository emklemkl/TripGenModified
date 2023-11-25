const fs = require('fs');
const zoneId = {
    park: 1,
    charge: 2,
    forbidden: 3,
}
const speedLimit = 20;


fs.writeFileSync("../cities/city.csv", `'id','name', 'speed_limit', 'geometry'\r\n`);
fs.writeFileSync("../cities/zone_loc.csv", `'zone_id','city_id', 'date_from', 'geometry'\r\n`);

for (const cityid of [1, 2, 3]) {
    const city = require(`../cities/${cityid}.json`);
    fs.appendFileSync("../cities/city.csv", `'${city.id}','${city.name}','${speedLimit}','${JSON.stringify(city.coords.geometry)}'\r\n`);
    for (const zone of city.forbidden) {
        if (zone.properties.role === "forbidden") {
            fs.appendFileSync("../cities/zone_loc.csv", `'${zoneId.forbidden}','${city.id}','2023-10-01','${JSON.stringify(zone.geometry)}'\r\n`);
        }
    }
    for (const zone of city.park_zones) {
        fs.appendFileSync("../cities/zone_loc.csv", `'${zoneId.park}','${city.id}','2023-10-01','${JSON.stringify(zone.geometry)}'\r\n`);
    }
    for (const zone of city.charge_zones) {
        fs.appendFileSync("../cities/zone_loc.csv", `'${zoneId.charge}','${city.id}','2023-10-01','${JSON.stringify(zone.geometry)}'\r\n`);
    }
}






