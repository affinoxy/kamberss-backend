require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()

// app.use(cors())
const corsOptions = {
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://kamberss-kamera.vercel.app' // Fallback for specific vercel app
  ],
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())

// ======================
// PostgreSQL Connection
// ======================
// const pool = new Pool({
//   host: 'localhost',
//   user: 'postgres',
//   password: 'postgres',
//   database: 'kamberss_kamera',
//   port: 5432
// })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Test koneksi
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
      'SELECT * FROM public.users WHERE email = $1',
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
    console.log('📦 Fetching products...')

    const result = await pool.query(`
      SELECT id, name, price, image, specs, description, category
      FROM products
      ORDER BY id
    `)

    console.log(`✅ Found ${result.rows.length} products`)

    const products = {
      cameras: [],
      lenses: [],
      actioncam: [],
      lighting: [],
      gimbals: [],
      packages: []
    }

    result.rows.forEach(p => {
      let category = p.category?.toLowerCase()

      // Normalize category names (database uses singular, frontend expects plural)
      if (category === 'camera') category = 'cameras'
      if (category === 'gimbal') category = 'gimbals'

      if (products[category]) {
        products[category].push(p)
      } else {
        console.warn(`⚠️ Unknown category: ${category} for product: ${p.name}`)
      }
    })

    console.log('📊 Products by category:', {
      cameras: products.cameras.length,
      lenses: products.lenses.length,
      actioncam: products.actioncam.length,
      lighting: products.lighting.length,
      gimbals: products.gimbals.length,
      packages: products.packages.length
    })

    res.json(products)
  } catch (err) {
    console.error('❌ Error fetching products:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).json({
      error: 'Failed to fetch products',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
})

// ======================
// RENTAL
// ======================
app.post('/api/rental', async (req, res) => {
  const { name, email, phone, startDate, endDate, items } = req.body

  try {
    const rental = await pool.query(
      `INSERT INTO public.rentals (name, email, phone, start_date, end_date, status)
    VALUES ($1,$2,$3,$4,$5,'pending')
    RETURNING id`,
      [name, email, phone, startDate, endDate]
    )

    const rentalId = rental.rows[0].id

    for (const item of items) {
      await pool.query(
        `INSERT INTO public.rental_items (rental_id, product_id, price)
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
    console.error('❌ Error fetching rentals:', err.message)
    res.status(500).json({ error: 'Failed to fetch rentals', message: err.message })
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
    console.error('❌ Error updating status:', err.message)
    res.status(500).json({ error: 'Failed to update status', message: err.message })
  }
})

// PROCESS RETURN
app.put('/api/rentals/:id/return', async (req, res) => {
  const { id } = req.params
  const { notes } = req.body

  try {
    const result = await pool.query(
      `UPDATE rentals 
       SET status = 'dikembalikan', 
           return_date = CURRENT_TIMESTAMP,
           return_notes = $1
       WHERE id = $2
       RETURNING *`,
      [notes || '', id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rental not found' })
    }

    res.json({ success: true, rental: result.rows[0] })
  } catch (err) {
    console.error('❌ Error processing return:', err.message)
    res.status(500).json({ error: 'Failed to process return', message: err.message })
  }
})

// ======================
// SERVER
// ======================
// const PORT = 5000
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Kambers Kamera running 🚀'
  })
})


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})
