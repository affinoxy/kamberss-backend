require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()

// Middleware
app.use(cors()) // Permissive CORS for initial stabilization
app.use(express.json())

// Health check (Top priority for Railway survival)
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Kambers Kamera running 🚀',
    timestamp: new Date().toISOString()
  })
})

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

console.log('--- Server Startup ---')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL error:', err))

// AUTH - LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(401).json({ error: 'Email tidak ditemukan' })
    const user = result.rows[0]
    if (user.password !== password) return res.status(401).json({ error: 'Password salah' })
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, price, image, specs, description, category
      FROM products ORDER BY id
    `)
    const products = {
      cameras: [], lenses: [], actioncam: [],
      lighting: [], gimbals: [], packages: []
    }
    result.rows.forEach(p => {
      let cat = p.category?.toLowerCase()
      if (cat === 'camera') cat = 'cameras'
      if (cat === 'gimbal') cat = 'gimbals'
      if (products[cat]) products[cat].push(p)
    })
    res.json(products)
  } catch (err) {
    console.error('❌ Error products:', err.message)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// RENTAL
app.post('/api/rental', async (req, res) => {
  const { name, email, phone, startDate, endDate, items } = req.body
  try {
    const rental = await pool.query(
      `INSERT INTO public.rentals (name, email, phone, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,'pending') RETURNING id`,
      [name, email, phone, startDate, endDate]
    )
    const rentalId = rental.rows[0].id
    for (const item of items) {
      await pool.query(
        `INSERT INTO public.rental_items (rental_id, product_id, price) VALUES ($1,$2,$3)`,
        [rentalId, item.id, item.price]
      )
    }
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create rental' })
  }
})

// ADMIN RENTALS
app.get('/api/rentals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rentals ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed' })
  }
})

app.put('/api/rentals/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    await pool.query('UPDATE rentals SET status = $1 WHERE id = $2', [status, id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed' })
  }
})

app.put('/api/rentals/:id/return', async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  try {
    await pool.query(
      `UPDATE rentals SET status = 'dikembalikan', return_date = CURRENT_TIMESTAMP, return_notes = $1 WHERE id = $2`,
      [notes || '', id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed' })
  }
})

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend live on port ${PORT}`)
})
