require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()

// ✅ FIX CORS (WAJIB)
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())



// ======================
// PostgreSQL Connection
// ======================
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
})

// Test koneksi DB
pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL error:', err))

// ======================
// DEBUG LOG (sementara)
// ======================
app.use((req, res, next) => {
  console.log('➡️', req.method, req.url)
  next()
})

// ======================
// AUTH - LOGIN
// ======================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email tidak ditemukan' })
    }

    const user = result.rows[0]

    if (user.password !== password) {
      return res.status(401).json({ error: 'Password salah' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================
// PRODUCTS
// ======================
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, price, image, specs, description, category
      FROM products
      ORDER BY id
    `)

    const products = {
      cameras: [],
      lenses: [],
      actioncam: [],
      lighting: [],
      gimbals: [],
      packages: []
    }

    result.rows.forEach(p => {
      const category = p.category?.toLowerCase()
      if (products[category]) {
        products[category].push(p)
      }
    })

    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// ======================
// RENTAL
// ======================
app.post('/api/rental', async (req, res) => {
  const { name, email, phone, startDate, endDate, items } = req.body

  try {
    const rental = await pool.query(
      `INSERT INTO rentals (name, email, phone, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,'pending')
       RETURNING id`,
      [name, email, phone, startDate, endDate]
    )

    const rentalId = rental.rows[0].id

    for (const item of items) {
      await pool.query(
        `INSERT INTO rental_items (rental_id, product_id, price)
         VALUES ($1,$2,$3)`,
        [rentalId, item.id, item.price]
      )
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create rental' })
  }
})

// ======================
// ADMIN
// ======================
app.get('/api/rentals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rentals ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rentals' })
  }
})

app.put('/api/rentals/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    await pool.query(
      'UPDATE rentals SET status = $1 WHERE id = $2',
      [status, id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// ======================
// SERVER
// ======================
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Kambers Kamera running 🚀'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})
