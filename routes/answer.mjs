import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import voteCreateValidation from "../middleware.mjs/voteValidation.mjs";

const answerRouter = Router();

answerRouter.post(
  "/:answerId/vote",
  voteCreateValidation,
  async (req, res) => {
    const newVote = req.body;
    const answerIdFromClient = req.params.answerId;
    let result;

    try {
      result = await connectionPool.query(
        `SELECT * FROM answers WHERE id = $1`,
        [answerIdFromClient]
      );
      if (!result.rows[0]) {
        return res.status(404).json({ message: "Question not found." });
      } else
        await connectionPool.query(
          `INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2)`,
          [answerIdFromClient, newVote.vote]
        );
    } catch {
      return res.status(500).json({ message: "Unable to vote answer." });
    }

    return res.status(201).json({
      message: "Vote on the answer has been recorded successfully.",
    });
  }
);

export default answerRouter;