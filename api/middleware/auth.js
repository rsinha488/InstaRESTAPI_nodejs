const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const verifyToken = jwt.verify(token, 'this is dummy text');
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid token" })
    }

}