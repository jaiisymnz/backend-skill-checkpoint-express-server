const voteCreateValidation = (req, res, next) => {
  const { vote } = req.body;

  if (!vote ) {
    return res.status(400).json({ message: "Invalid vote value" });
  }

   if (vote!=1 && vote != -1) {
     return res.status(400).json({ message: "Invalid vote value" });
   }


  next();
};

export default voteCreateValidation;
