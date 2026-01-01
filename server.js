require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const midtransClient = require('midtrans-client')

const app = express()

// Middleware
app.use(cors()) // Permissive CORS for initial stabilization
app.use(express.json())

// Health check (Top priority for serverless survival)
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
// Helper to clean connection string (remove sslmode to avoid conflict)
const getConnectionString = () => {
  if (!process.env.DATABASE_URL) return ''
  try {
    // Parse URL to safely remove sslmode param without breaking structure
    const url = new URL(process.env.DATABASE_URL)
    url.searchParams.delete('sslmode')
    return url.toString()
  } catch (err) {
    console.warn('Could not parse DATABASE_URL as URL, using raw value')
    return process.env.DATABASE_URL
  }
}

const pool = new Pool({
  connectionString: getConnectionString(),
  // Supabase (and many cloud PGs) require SSL, but the pooler often uses self-signed certs.
  // We force rejectUnauthorized: false to allow the connection.
  ssl: { rejectUnauthorized: false }
})

pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL error:', err))

// Midtrans Snap Client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
})

console.log('✅ Midtrans Snap initialized (Sandbox mode)')

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

// AUTH - REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body
  console.log('📝 Register attempt:', { name, email, hasPassword: !!password })

  try {
    // Check if email already exists
    console.log('🔍 Checking if email exists...')
    const existingUser = await pool.query('SELECT * FROM public.users WHERE email = $1', [email])

    if (existingUser.rows.length > 0) {
      console.log('❌ Email already exists:', email)
      return res.status(400).json({ error: 'Email sudah terdaftar' })
    }

    // Insert new user
    console.log('➕ Creating new user...')
    const result = await pool.query(
      'INSERT INTO public.users (name, email, password, role, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
      [name, email, password, 'CUSTOMER']
    )

    console.log('✅ User created successfully:', result.rows[0])
    res.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      user: result.rows[0]
    })
  } catch (err) {
    console.error('❌ Register error:', err.message)
    console.error('Error code:', err.code)
    console.error('Error detail:', err.detail)
    console.error('Full error:', err)
    res.status(500).json({ error: 'Server error', details: err.message })
  }
})

// USER MANAGEMENT - GET ALL USERS (Admin only)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM public.users ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// USER MANAGEMENT - CREATE USER (Admin only)
app.post('/api/users', async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM public.users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar' })
    }

    // Insert new user
    const roleUpper = role ? role.toUpperCase() : 'CUSTOMER'
    const result = await pool.query(
      'INSERT INTO public.users (name, email, password, role, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
      [name, email, password, roleUpper]
    )

    res.json({
      success: true,
      message: 'User berhasil dibuat',
      user: result.rows[0]
    })
  } catch (err) {
    console.error('Error creating user:', err)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// USER MANAGEMENT - UPDATE USER (Admin only)
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params
  const { name, email, role, password } = req.body
  try {
    let query, params

    const roleUpper = role ? role.toUpperCase() : undefined

    if (password) {
      // Update with password
      query = 'UPDATE public.users SET name = $1, email = $2, role = $3, password = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role'
      params = [name, email, roleUpper, password, id]
    } else {
      // Update without password
      query = 'UPDATE public.users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, role'
      params = [name, email, roleUpper, id]
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' })
    }

    res.json({
      success: true,
      message: 'User berhasil diupdate',
      user: result.rows[0]
    })
  } catch (err) {
    console.error('Error updating user:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// USER MANAGEMENT - DELETE USER (Admin only)
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM public.users WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' })
    }

    res.json({
      success: true,
      message: 'User berhasil dihapus'
    })
  } catch (err) {
    console.error('Error deleting user:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})


// PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, price, image, specs, description, category, stock
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
  const { name, email, phone, startDate, endDate, items, userRole } = req.body
  try {
    // Validate that user exists (unless admin is booking)
    if (userRole?.toLowerCase() !== 'admin') {
      const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email])
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Email tidak terdaftar. Silakan register terlebih dahulu.' })
      }
    }

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
    res.json({ success: true, rentalId: rentalId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create rental' })
  }
})

// ADMIN RENTALS
app.get('/api/rentals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        (COALESCE(SUM(ri.price), 0) * GREATEST(1, (r.end_date::date - r.start_date::date))) as total_price,
        COALESCE(
          json_agg(
            json_build_object('name', p.name, 'price', ri.price)
          ) FILTER (WHERE ri.id IS NOT NULL), 
          '[]'
        ) as items
      FROM rentals r
      LEFT JOIN rental_items ri ON r.id = ri.rental_id
      LEFT JOIN products p ON ri.product_id = p.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching rentals:', err)
    res.status(500).json({ error: 'Failed' })
  }
})

app.put('/api/rentals/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Update status rental
    await client.query(
      'UPDATE rentals SET status = $1 WHERE id = $2',
      [status, id]
    )

    // Jika disetujui → kurangi stok
    if (status === 'disetujui') {
      await client.query(`
        UPDATE products p
        SET stock = p.stock - 1
        FROM rental_items ri
        WHERE p.id = ri.product_id
        AND ri.rental_id = $1
      `, [id])
    }

    await client.query('COMMIT')
    res.json({ success: true })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Update status error:', err)
    res.status(500).json({ error: 'Failed' })
  } finally {
    client.release()
  }
})


app.put('/api/rentals/:id/return', async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Update status rental
    await client.query(`
      UPDATE rentals
      SET status = 'dikembalikan',
          return_date = CURRENT_TIMESTAMP,
          return_notes = $1
      WHERE id = $2
    `, [notes || '', id])

    // Tambah stok kembali
    await client.query(`
      UPDATE products p
      SET stock = p.stock + 1
      FROM rental_items ri
      WHERE p.id = ri.product_id
      AND ri.rental_id = $1
    `, [id])

    await client.query('COMMIT')
    res.json({ success: true })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Return error:', err)
    res.status(500).json({ error: 'Failed' })
  } finally {
    client.release()
  }
})


// UPDATE PRODUCT STOCK
app.put('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params
  const { stock } = req.body
  try {
    await pool.query('UPDATE products SET stock = $1 WHERE id = $2', [stock, id])
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating stock:', err)
    res.status(500).json({ error: 'Failed to update stock' })
  }
})

// PAYMENT - CREATE TRANSACTION
app.post('/api/payment/create-transaction', async (req, res) => {
  const { rentalId, customerDetails, items, totalAmount, duration } = req.body

  try {
    const qty = duration || 1

    const parameter = {
      transaction_details: {
        order_id: `RENTAL-${rentalId}-${Date.now()}`,
        gross_amount: totalAmount
      },
      customer_details: {
        first_name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone
      },
      item_details: items.map(item => ({
        id: item.id,
        price: item.price,
        quantity: qty,
        name: item.name
      }))
    }

    const transaction = await snap.createTransaction(parameter)

    res.json({
      success: true,
      snap_token: transaction.token,
      redirect_url: transaction.redirect_url
    })
  } catch (err) {
    console.error('Error creating transaction:', err)
    res.status(500).json({ error: 'Failed to create payment transaction' })
  }
})

// PAYMENT - NOTIFICATION WEBHOOK
app.post('/api/payment/notification', async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body)
    const orderId = notification.order_id
    const transactionStatus = notification.transaction_status
    const fraudStatus = notification.fraud_status

    console.log(`Payment notification: ${orderId} - ${transactionStatus}`)

    // Extract rental ID from order_id (format: RENTAL-{id}-{timestamp})
    const rentalId = orderId.split('-')[1]

    let newStatus = 'pending'

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        newStatus = 'disetujui'
      }
    } else if (transactionStatus === 'settlement') {
      newStatus = 'disetujui'
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'dibatalkan'
    } else if (transactionStatus === 'pending') {
      newStatus = 'menunggu'
    }

    // Update rental status
    await pool.query('UPDATE rentals SET status = $1 WHERE id = $2', [newStatus, rentalId])

    res.json({ success: true })
  } catch (err) {
    console.error('Error handling payment notification:', err)
    res.status(500).json({ error: 'Failed to process notification' })
  }
})

// Start Server
// Start Server
const PORT = process.env.PORT || 5000

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend live on port ${PORT}`)
  })
}

module.exports = app
