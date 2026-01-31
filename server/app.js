const express = require("express");
const cors = require("cors");
const kanbanRoutes = require("./routes/kanbanRoutes");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", kanbanRoutes);
module.exports = app;
