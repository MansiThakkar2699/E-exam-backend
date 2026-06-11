const mongoose = require("mongoose")
const dns = require("dns");
require("dotenv").config()

// Force Node to use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const DBConnection = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("DB Connected")
    }).catch((e) => {
        console.log(e)
    })
}

module.exports = DBConnection