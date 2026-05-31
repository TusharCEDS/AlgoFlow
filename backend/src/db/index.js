const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'algoflow',
  user: 'postgres',
  password: 'postgres'
})

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
  } else {
    console.log('Connected to PostgreSQL successfully')
  }
})

module.exports = pool