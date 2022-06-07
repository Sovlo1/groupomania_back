const express = require("express");
const app = express();
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// let whitelist = ["http://localhost:4200"];
// let corsOptions = {
//   origin: "http://localhost:4200",
//   credentials: true,
// };

const userRoutes = require("./routes/userroute");
const postRoutes = require("./routes/postroute");
const commentRoutes = require("./routes/commentroute");

// app.use(cors(corsOptions));
// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
});

app.use("/files", express.static(path.join(__dirname, "files")));
app.use("/api/auth", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

module.exports = app;
