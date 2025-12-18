require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://kambers-backend-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())

// ======================
// PostgreSQL Connection
// ======================
const dns = require('dns')
const { Resolver } = dns.promises

console.log('🔌 Connecting to database...')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

// Parse DATABASE_URL untuk force IPv4
const parseDatabaseUrl = (url) => {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    return {
      host: urlObj.hostname,
      port: urlObj.port || 5432,
      database: urlObj.pathname.slice(1),
      user: urlObj.username,
      password: urlObj.password
    }
  } catch (err) {
    console.error('❌ Failed to parse DATABASE_URL:', err.message)
    return null
  }
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL)

console.log('📝 Connecting to:', dbConfig?.host || 'connection string')

// Resolve hostname ke IPv4 address menggunakan Google DNS
const resolveToIPv4 = async (hostname) => {
  try {
    console.log('🔍 Resolving DNS for:', hostname)

    // Gunakan Google DNS (8.8.8.8) untuk bypass Railway DNS
    const resolver = new Resolver()
    resolver.setServers(['8.8.8.8', '8.8.4.4'])

    const addresses = await resolver.resolve4(hostname)
    console.log('✅ IPv4 addresses found:', addresses)
    return addresses[0] // Gunakan IP pertama
  } catch (err) {
    console.error('❌ DNS resolution failed:', err.message)
    console.log('⚠️ Falling back to hostname')
    return hostname // Fallback ke hostname
  }
}

// Initialize pool setelah resolve DNS
const initializePool = async () => {
  if (!dbConfig) {
    console.error('❌ No database config available')
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  }

  // Resolve hostname ke IPv4
  const ipv4Address = await resolveToIPv4(dbConfig.host)

  console.log('🔗 Connecting to IP:', ipv4Address)

  const pool = new Pool({
    host: ipv4Address, // Gunakan IPv4 address langsung
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: {
      rejectUnauthorized: false
    }
  })

  // Test koneksi
  try {
    const client = await pool.connect()
    console.log('✅ PostgreSQL connected to', ipv4Address)
    client.release()
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message)
    console.error('Stack:', err.stack)
  }

  return pool
}

// Create pool variable
let pool

// Initialize pool asynchronously
initializePool().then(p => {
  pool = p
}).catch(err => {
  console.error('❌ Failed to initialize pool:', err)
  // Fallback pool
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
})

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
      const category = p.category?.toLowerCase()
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
