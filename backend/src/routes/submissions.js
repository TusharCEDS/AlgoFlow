const express = require("express");
const db = require("../db/index");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { problem_id, code, language } = req.body;
  const user_id = req.user.id;

  try {
    // 1. fetch all test cases for this problem
    const testCasesResult = await db.query(
      "SELECT * FROM test_cases WHERE problem_id = $1",
      [problem_id],
    );
    const testCases = testCasesResult.rows;

    if (testCases.length === 0) {
      return res
        .status(404)
        .json({ error: "No test cases found for this problem" });
    }

    // 2. run code against each test case
    const results = [];
    let allPassed = true;

    for (const tc of testCases) {
      try {
        const response = await fetch("http://localhost:6001/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, input: tc.input }),
        });

        const data = await response.json();

        const actualOutput = (data.output || "").trim();
        const expectedOutput = tc.expected_output.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) allPassed = false;

        results.push({
          input: tc.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed,
          is_sample: tc.is_sample,
        });
      } catch (err) {
        allPassed = false;
        results.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: "Execution failed",
          passed: false,
          is_sample: tc.is_sample,
        });
      }
    }

    // 3. determine final status
    const status = allPassed ? "accepted" : "wrong_answer";

    // 4. save submission to database
    await db.query(
      "INSERT INTO submissions (user_id, problem_id, code, language, status) VALUES ($1, $2, $3, $4, $5)",
      [user_id, problem_id, code, language || "cpp", status],
    );

    // 5. send results back
    res.json({
      status,
      results,
      message: allPassed ? "All test cases passed!" : "Some test cases failed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// GET user stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // total solved
    const solvedResult = await db.query(
      `SELECT COUNT(DISTINCT problem_id) as solved 
       FROM submissions 
       WHERE user_id = $1 AND status = 'accepted'`,
      [user_id],
    );

    // total attempted
    const attemptedResult = await db.query(
      `SELECT COUNT(DISTINCT problem_id) as attempted 
       FROM submissions 
       WHERE user_id = $1`,
      [user_id],
    );

    // total submissions
    const totalResult = await db.query(
      `SELECT COUNT(*) as total 
       FROM submissions 
       WHERE user_id = $1`,
      [user_id],
    );

    // recent submissions
    const recentResult = await db.query(
      `SELECT s.id, s.status, s.created_at, p.title, p.difficulty
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 10`,
      [user_id],
    );

    const solved = parseInt(solvedResult.rows[0].solved);
    const attempted = parseInt(attemptedResult.rows[0].attempted);
    const total = parseInt(totalResult.rows[0].total);

    res.json({
      solved,
      attempted,
      total,
      acceptanceRate: total > 0 ? Math.round((solved / total) * 100) : 0,
      recentSubmissions: recentResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// GET battle stats
router.get("/battle-stats", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    const winsResult = await db.query(
      "SELECT COUNT(*) as wins FROM battles WHERE winner_id = $1",
      [user_id],
    );

    const lossesResult = await db.query(
      "SELECT COUNT(*) as losses FROM battles WHERE loser_id = $1",
      [user_id],
    );

    const recentBattlesResult = await db.query(
      `SELECT b.room_id, b.created_at,
        w.username as winner, l.username as loser,
        p.title as problem_title
       FROM battles b
       JOIN users w ON b.winner_id = w.id
       JOIN users l ON b.loser_id = l.id
       JOIN problems p ON b.problem_id = p.id
       WHERE b.winner_id = $1 OR b.loser_id = $1
       ORDER BY b.created_at DESC
       LIMIT 5`,
      [user_id],
    );

    const collabResult = await db.query(
      "SELECT COUNT(*) as sessions FROM collab_sessions WHERE created_by = $1",
      [user_id],
    );

    res.json({
      wins: parseInt(winsResult.rows[0].wins),
      losses: parseInt(lossesResult.rows[0].losses),
      collabSessions: parseInt(collabResult.rows[0].sessions),
      recentBattles: recentBattlesResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
