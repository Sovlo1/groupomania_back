const express = require("express");
const app = express();
const helmet = require("helmet");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
})


module.exports = app;