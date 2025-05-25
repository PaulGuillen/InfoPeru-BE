const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const routes = require("./routes");

app.set("port", port);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());

app.disable("x-powered-by");

server.listen(port, function () {
  console.log("Aplicacion de NodeJS en el puerto " + port + " Iniciando...");
});


// Cargar todas las rutas centralizadas
routes(app);

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.stack);
});