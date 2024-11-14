import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import questionCreateValidation from "../middleware.mjs/questionValidation.mjs";
import ansCreateValidation from "../middleware.mjs/answerValidation.mjs";
import voteCreateValidation from "../middleware.mjs/voteValidation.mjs";

const questionRouter = Router();

//Create Question
questionRouter.post("/", questionCreateValidation, async (req, res) => {
  const newQuestion = req.body;
  try {
    await connectionPool.query(
      `INSERT INTO questions (title,description,category) VALUES ($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );
  } catch {
    return res.status(500).json({ message: "Unable to create question." });
  }

  return res.status(201).json({
    message: "Question created successfully.",
  });
});

// VIew all Question
questionRouter.get("/", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`SELECT * FROM questions`);
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }

  return res.status(201).json({ data: result.rows });
});

//View Question by ID
questionRouter.get("/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  let result;
  try {
    result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionIdFromClient]
    );
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
  if (!result.rows[0]) {
    return res.status(404).json({ message: "Question not found." });
  }
  return res.status(200).json({ data: result.rows[0] });
});

//Edit Question
questionRouter.put(
  "/:questionId",
  questionCreateValidation,
  async (req, res) => {
    const questionIdFromClient = req.params.questionId;
    const updatedQuestion = req.body;

    try {
      const result = await connectionPool.query(
        `UPDATE questions
      SET title = $2, description = $3, category =$4
      WHERE id = $1`,
        [
          questionIdFromClient,
          updatedQuestion.title,
          updatedQuestion.description,
          updatedQuestion.category,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Question not found." });
      }
    } catch {
      res.status(500).json({ message: "Unable to fetch questions." });
    }
    return res.status(200).json({
      message: "Question updated successfully.",
    });
  }
);

//Delete Question by ID
questionRouter.delete("/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `DELETE FROM questions WHERE id = $1`,
      [questionIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }
  } catch {
    res.status(500).json({ message: "Unable to delete question." });
  }

  return res.status(200).json({
    message: "Question post has been deleted successfully.",
  });
});

//Search by title,category (ไม่เสร็จ)
questionRouter.get("/search", async (req, res) => {
  const { title, category } = req.query;

  if (!title && !category) {
    return res.status(400).json({
      message: "Invalid search parameters.",
    });
  }

  try {
    let query =
      "SELECT * FROM (SELECT * FROM questions WHERE category IS NOT NULL AND title IS NOT NULL)";
    let conditions = [];
    let values = [];

    if (title) {
      conditions.push("title ILIKE $" + (values.length + 1));
      values.push(`%${title}%`);
    }

    if (category) {
      conditions.push("category ILIKE $" + (values.length + 1));
      values.push(`%${category}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    const result = await connectionPool.query(query, values);

    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Create Answer
questionRouter.post(
  "/:questionId/answers",
  ansCreateValidation,
  async (req, res) => {
    const newAnswer = req.body;
    const questionIdFromClient = req.params.questionId;
    let result;

    try {
      result = await connectionPool.query(
        `SELECT * FROM questions WHERE id = $1`,
        [questionIdFromClient]
      );
      if (!result.rows[0]) {
        return res.status(404).json({ message: "Question not found." });
      } else
        await connectionPool.query(
          `INSERT INTO answers (question_id, content) VALUES ($1, $2)`,
          [questionIdFromClient, newAnswer.content]
        );
    } catch {
      return res.status(500).json({ message: "Unable to create answer." });
    }

    return res.status(201).json({
      message: "Answer created successfully.",
    });
  }
);

//View Question's Answer
questionRouter.get("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  let result;
  try {
    result = await connectionPool.query(
      `SELECT * FROM answers WHERE question_id = $1`,
      [questionIdFromClient]
    );
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
  if (!result.rows[0]) {
    return res.status(404).json({ message: "Question not found." });
  }
  return res.status(200).json({ data: result.rows });
});



//Create question vote
questionRouter.post(
  "/:questionId/vote",
  voteCreateValidation,
  async (req, res) => {
    const newVote = req.body;
    const questionIdFromClient = req.params.questionId;
    let result;

    try {
      result = await connectionPool.query(
        `SELECT * FROM questions WHERE id = $1`,
        [questionIdFromClient]
      );
      if (!result.rows[0]) {
        return res.status(404).json({ message: "Question not found." });
      } else
        await connectionPool.query(
          `INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)`,
          [questionIdFromClient, newVote.vote]
        );
    } catch {
      return res.status(500).json({ message: "Unable to create answer." });
    }

    return res.status(201).json({
      message: "Vote on the question has been recorded successfully.",
    });
  }
);

//Delete answer when questions are deleted
questionRouter.delete("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `DELETE FROM answers WHERE id = $1`,
      [questionIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }
  } catch {
    res.status(500).json({ message: "Unable to delete answer." });
  }

  return res.status(200).json({
    message:
      "All abswers for this question post has been deleted successfully.",
  });
});

export default questionRouter;
