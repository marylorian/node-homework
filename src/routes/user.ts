import express from "express";
import { v4 as uuid } from "uuid";
import { createValidator } from "express-joi-validation";

import HttpStatusCode from "../constants/HttpStatusCode";
import { User } from "../types/user";
import userSchema from "../schemas/user";

const runtimeStorage: { [key: string]: User } = {};

const userRouter = express.Router();
const validator = createValidator();

userRouter
  .route("/users")
  .get((req, res, next) => {
    const { limit = 5, loginSubstring = "" } = req.query;
    const result = Object.values(runtimeStorage)
      .filter(
        ({ isDeleted, login }) =>
          !isDeleted && login.includes(loginSubstring.toString())
      )
      .slice(0, Number.parseInt(limit.toString()))
      .sort((a, b) => Number(a.login > b.login));

    res.status(HttpStatusCode.OK).json(result);
  })
  .post(validator.body(userSchema), (req, res, next) => {
    const { login, password, age } = req.body;

    if (login && password && age) {
      const id = uuid();
      runtimeStorage[id] = {
        id,
        login,
        password,
        age,
        isDeleted: false,
      };

      res.status(HttpStatusCode.OK).send(runtimeStorage[id]);
      return;
    }

    res.status(HttpStatusCode.BAD_REQUEST).send("Something went wrong");
  });

userRouter
  .route("/users/:id")
  .get((req, res, next) => {
    const { id } = req.params;

    if (!id) {
      res.status(HttpStatusCode.BAD_REQUEST).send("Incorrect ID");
      return;
    }

    const user = runtimeStorage[id];

    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).send("User was not found");
      return;
    }
    res.status(HttpStatusCode.OK).json(user);
  })
  .post((req, res, next) => {
    const { id } = req.params;
    const { age, login, password, isDeleted } = req.body;

    if (!id) {
      res.status(HttpStatusCode.BAD_REQUEST).send("Incorrect ID");
      return;
    }

    const user = runtimeStorage[id];

    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).send("User was not found");
      return;
    }

    if (login || isDeleted) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("You have no permissions to change login, isDeleted fields");
      return;
    }

    if (age) {
      user.age = age;
    }
    if (password) {
      user.password = password;
    }

    res.status(HttpStatusCode.OK).json(runtimeStorage[id]);
  })
  .delete((req, res, next) => {
    const { id } = req.params;
    const userToRemove = runtimeStorage[id];

    if (!userToRemove) {
      res.status(HttpStatusCode.NOT_FOUND).send("User was not found");
      return;
    }

    if (userToRemove.isDeleted) {
      res.status(HttpStatusCode.OK).send("User was already removed");
      return;
    }

    userToRemove.isDeleted = true;
    res.sendStatus(HttpStatusCode.OK);
  });

userRouter.use((err, req, res, next) => {
  if (err?.error?.isJoi) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      type: err.type,
      message: err.error.toString(),
    });
    return;
  }
  next(err);
});

export default userRouter;
