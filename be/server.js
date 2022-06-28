const ENV = require('./utils/env');
const express = require('express');
const Routes = require("./routes");

var path = require("path");
const {connectDB, mongoose} = require("./start/db");
var cors = require('cors')

connectDB();
const app = express();

const PORT = ENV.get("PORT",5000);
app.use(cors())

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    "/script-adminlte",
    express.static(path.join(__dirname, "/node_modules/admin-lte/"))
  );

  
Routes(app);

app.listen(PORT,function (){
    console.log(" server listening on port " + PORT);
});

module.exports = app;

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});