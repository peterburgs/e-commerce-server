const errorHandler = (error, req, res, next) => {
  if (error.name === "UnauthorizedError") {
    // jwt authentication error
    return res.status(401).json({ message: "The user is not authorized" });
  }

  if (error.name === "ValidationError") {
    //  validation error
    return res.status(401).json({ message: error });
  }

  // default to 500 server error
  return res.status(500).json(error);
};
module.exports = errorHandler;
