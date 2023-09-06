// src/middlewares/error-handling.middleware.js

import { CustomError } from "../errors/customError.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).send({ errorMessage: err.message });
  }
  console.error(err.stack);
  res.status(500).send("Something broke!");
};

export default errorHandler;
