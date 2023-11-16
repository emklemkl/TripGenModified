const counter = require("../counter.json")
const fs = require('fs');

counter.bike = 1;
counter.user = 1;

fs.writeFileSync(`../counter.json`, JSON.stringify(counter, null, 4));
