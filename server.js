import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes/index.js"; 
import morgan from "morgan";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.set("port", port);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());

app.disable("x-powered-by");

server.listen(port, "0.0.0.0", function () {
  console.log("Aplicacion de NodeJS en el puerto " + port + " Iniciando...");
});

routes(app);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.stack);
});