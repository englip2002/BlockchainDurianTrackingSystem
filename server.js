const express = require("express");
const path = require("path");
const app = express();

app.use('/', express.static(__dirname));


// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname + "/index.html"));
// })

// app.get("/page2", (req, res) => {
//     res.sendFile(path.join(__dirname + "/page2.html"))
// })

const server = app.listen(5000);
const portNumber = server.address().port;
console.log(`port is open on ${portNumber}`);
