const tripGenerator = require("./src/tripgenerator.js");
// const crypto = require('crypto');

// // Generate a random JWT secret (32 bytes)
// const jwtSecret = crypto.randomBytes(32).toString('hex');

// console.log('JWT Secret:', jwtSecret);
(async function () {
    "use strict";
    /**
     * These can be passed into script from commandline
     */
    if (process.argv[2]) {
        tripGenerator.cityid = process.argv[2];
    }
    if (process.argv[3]) {
        tripGenerator.bikes = parseInt(process.argv[3]);
    }

    tripGenerator.setCoords();
    tripGenerator.generateMany();
})();
