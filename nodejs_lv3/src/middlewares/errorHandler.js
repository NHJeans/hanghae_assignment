// src/middlewares/error-handling.middleware.js


const errorHandler =  (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
}

export default errorHandler;