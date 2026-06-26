const express = require('express')
const db = require('../db/index')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
  const { problem_id, code, language } = req.body
  const user_id = req.user.id

  try {
    // 1. fetch all test cases for this problem
    const testCasesResult = await db.query(
      'SELECT * FROM test_cases WHERE problem_id = $1',
      [problem_id]
    )
    const testCases = testCasesResult.rows

    if (testCases.length === 0) {
      return res.status(404).json({ error: 'No test cases found for this problem' })
    }

    // 2. run code against each test case
    const results = []
    let allPassed = true

    for (const tc of testCases) {
      try {
        const response = await fetch('http://localhost:6001/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, input: tc.input })
        })

        const data = await response.json()

        const actualOutput = (data.output || '').trim()
        const expectedOutput = tc.expected_output.trim()
        const passed = actualOutput === expectedOutput

        if (!passed) allPassed = false

        results.push({
          input: tc.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed,
          is_sample: tc.is_sample
        })

      } catch (err) {
        allPassed = false
        results.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: 'Execution failed',
          passed: false,
          is_sample: tc.is_sample
        })
      }
    }

    // 3. determine final status
    const status = allPassed ? 'accepted' : 'wrong_answer'

    // 4. save submission to database
    await db.query(
      'INSERT INTO submissions (user_id, problem_id, code, language, status) VALUES ($1, $2, $3, $4, $5)',
      [user_id, problem_id, code, language || 'cpp', status]
    )

    // 5. send results back
    res.json({
      status,
      results,
      message: allPassed ? 'All test cases passed!' : 'Some test cases failed'
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router