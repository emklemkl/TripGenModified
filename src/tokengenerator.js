// require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


const tokenGenerator = {
    getOne: function getOne(userid) {
        const payload = {
            id: userid,
            role: "user"
        };
        const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '365d' });

        return jwtToken;
    }
}

module.exports = tokenGenerator;
