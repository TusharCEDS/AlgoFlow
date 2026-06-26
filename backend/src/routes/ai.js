const express = require('express')
const Groq = require('groq-sdk')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/hint', authMiddleware, async (req, res) => {
  const { problemTitle, problemDescription, userCode } = req.body

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert DSA mentor helping students who are stuck on coding problems. You give concise, encouraging hints without revealing the full solution.'
        },
        {
          role: 'user',
          content: `Problem Title: ${problemTitle}
Problem Description: ${problemDescription}

Student's Current Code:
${userCode}

Please:
1. Identify the DSA pattern this problem uses
2. Briefly explain WHY this pattern applies
3. Give a small hint to nudge the student in the right direction WITHOUT giving the full solution

Format your response as:
**Pattern:** [pattern name]
**Why:** [1-2 sentences explaining why this pattern fits]
**Hint:** [1-2 sentences nudging them without giving away the answer]

Keep it concise and encouraging. Do not write the solution code.`
        }
      ],
      max_tokens: 300
    })

    const hint = completion.choices[0].message.content
    res.json({ hint })

  } catch (err) {
    console.error('Groq error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to generate hint' })
  }
})

module.exports = router