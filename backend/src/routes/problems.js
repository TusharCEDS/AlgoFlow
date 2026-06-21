const express = require('express')
const db = require('../db/index')

const router = express.Router()

// GET all problems (list view)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, difficulty, tags FROM problems ORDER BY id'
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET single problem with sample test cases
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const problemResult = await db.query(
      'SELECT * FROM problems WHERE id = $1',
      [id]
    )

    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    const testCasesResult = await db.query(
      'SELECT input, expected_output FROM test_cases WHERE problem_id = $1 AND is_sample = true',
      [id]
    )

    res.json({
      problem: problemResult.rows[0],
      sampleTestCases: testCasesResult.rows
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router