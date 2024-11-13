import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import questionCreateValidation from "../middleware.mjs/questionValidation.mjs";

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

//Delete post by ID
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

// VIew all posts
questionRouter.get("/", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`SELECT * FROM questions`);
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }

  return res.status(201).json({ data: result.rows });
});

//View by ID
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

export default questionRouter;
