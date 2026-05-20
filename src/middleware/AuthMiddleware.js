const jwt = require("jsonwebtoken")
require("dotenv").config()
const secret = process.env.JWT_SECRET

const validateToken = async (req, res, next) => {

    try {

        const token = req.headers.authorization
        if (token) {
            if (token.startsWith("Bearer ")) {
                const tokenValue = token.split(" ")[1]
                const decodedData = jwt.verify(tokenValue, secret)
                req.user = decodedData
                next()
            } else {
                res.status(401).json({
                    message: "token is not Bearer token"
                })
            }
        }
        else {
            res.status(401).json({
                message: "token is not present.."
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "error while validating token",
            err: err
        })
    }
}

// Role based access
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(", ")} can access this route`,
      });
    }

    next();
  };
};

module.exports = {
    validateToken,
    authorizeRoles
}