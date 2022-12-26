import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import HttpStatusCode from "./constants/HttpStatusCode";
import userRouter from "./routes/user";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

app.set("x-powered-by", false);

app.use(userRouter);

app.get("/", (req, res, next) => {
  res.setHeader("Content-Type", "text/plain");
  res.status(HttpStatusCode.OK).send("Hello world!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send("Something went wrong");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
