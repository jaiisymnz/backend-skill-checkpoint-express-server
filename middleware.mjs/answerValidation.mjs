const ansCreateValidation = (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ message: "Invalid request data. Content is required" });
  }
  next();
};

export default ansCreateValidation;
