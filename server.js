const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()

app.use(cors())
app.use(express.json())

// ======================
// PostgreSQL Connection
// ======================
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'kamberss_kamera',
  port: 5432
})

require('dotenv').config()
// const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
})


// Test koneksi
pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL error:', err))

// ======================
// API ROUTES
// ======================

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email tidak ditemukan' })
    }

    const user = result.rows[0]

    // Note: In production, compare hashed password!
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

// GET PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, price, image, specs, description, category
      FROM products
      ORDER BY id
    `)

    // kelompokkan sesuai frontend
    const products = {
      cameras: [],
      lenses: [],
      actioncam: [],
      lighting: [],
      gimbals: [],
      packages: []
    }

    result.rows.forEach(p => {
      let category = p.category ? p.category.toLowerCase() : '';
      
      // Normalize category names (singular -> plural)
      if (category === 'camera') category = 'cameras';
      if (category === 'lens') category = 'lenses';
      if (category === 'actioncam') category = 'actioncams';
      if (category === 'gimbal') category = 'gimbals';
      if (category === 'package') category = 'packages';
      if (category === 'lighting') category = 'lighting'; 

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

// POST RENTAL
app.post('/api/rental', async (req, res) => {
  const { name, email, phone, startDate, endDate, items } = req.body

  try {
    const rentalResult = await pool.query(
      `INSERT INTO rentals (name, email, phone, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,'pending')
       RETURNING id`,
      [name, email, phone, startDate, endDate]
    )

    const rentalId = rentalResult.rows[0].id

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

// ADD PRODUCT
app.post('/api/products', async (req, res) => {
  const { name, category, price, image, specs, description } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO products (name, category, price, image, specs, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, category, price, image, specs, description]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add product' })
  }
})

// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// GET RENTALS (ADMIN)
app.get('/api/rentals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM rentals
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rentals' })
  }
})

// UPDATE RENTAL STATUS
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
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
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
    console.error(err)
    res.status(500).json({ error: 'Failed to process return' })
  }
})

// ======================
const PORT = 5000
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})


// ======================
// BACKEND - server.js (Node.js API)
// ======================

// const express = require('express');
// const cors = require('cors');
// const app = express();
// const mysql = require("mysql");
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',      
//   database: 'kamberss_kamera'
// });

// app.use(cors());
// app.use(express.json());

// // Mock database
// const products = {
//   cameras: [
//     { id: 1, name: 'Sony A7 III', price: 150000, image: '📷', specs: '24MP Full Frame', description: 'Professional mirrorless camera' },
//     { id: 2, name: 'Canon EOS R6', price: 180000, image: '📷', specs: '20MP Full Frame', description: 'High-performance hybrid camera' },
//     { id: 3, name: 'Fujifilm X-T4', price: 120000, image: '📷', specs: '26MP APS-C', description: 'Versatile APS-C camera' }
//   ],
//   lenses: [
//     { id: 4, name: 'Sony 24-70mm f/2.8', price: 80000, image: '🔭', specs: 'Standard Zoom', description: 'Professional zoom lens' },
//     { id: 5, name: 'Canon RF 50mm f/1.2', price: 70000, image: '🔭', specs: 'Prime Lens', description: 'Ultra-fast prime lens' },
//     { id: 6, name: 'Sigma 85mm f/1.4', price: 60000, image: '🔭', specs: 'Portrait Lens', description: 'Premium portrait lens' }
//   ],
//   lighting: [
//     { id: 7, name: 'Godox SL-60W', price: 40000, image: '💡', specs: 'LED Light', description: 'Powerful LED video light' },
//     { id: 8, name: 'Aputure 120D', price: 50000, image: '💡', specs: 'COB LED', description: 'Professional COB LED' },
//     { id: 9, name: 'Softbox Set', price: 30000, image: '💡', specs: 'Light Modifier', description: 'Complete softbox kit' }
//   ],
//   gimbals: [
//     { id: 10, name: 'DJI Ronin SC', price: 75000, image: '🎬', specs: '3-Axis Gimbal', description: 'Compact 3-axis stabilizer' },
//     { id: 11, name: 'Zhiyun Crane 3S', price: 90000, image: '🎬', specs: 'Heavy Duty', description: 'Professional gimbal system' },
//     { id: 12, name: 'Moza Air 2', price: 65000, image: '🎬', specs: 'Compact Design', description: 'Lightweight gimbal' }
//   ],
//   packages: [
//     { id: 13, name: 'Vlog Package', price: 250000, image: '🎥', specs: 'Camera + Lens + Gimbal', description: 'Complete vlogging setup' },
//     { id: 14, name: 'Wedding Package', price: 400000, image: '💒', specs: 'Complete Wedding Setup', description: 'Professional wedding kit' }
//   ]
// };

// let rentals = [];

// // API Routes
// app.get('/api/products', (req, res) => {
//   res.json(products);
// });

// app.get('/api/products/:category', (req, res) => {
//   const category = req.params.category;
//   if (products[category]) {
//     res.json(products[category]);
//   } else {
//     res.status(404).json({ error: 'Category not found' });
//   }
// });

// app.post('/api/rental', (req, res) => {
//   const { name, email, phone, startDate, endDate, items } = req.body;
  
//   const rental = {
//     id: Date.now(),
//     name,
//     email,
//     phone,
//     startDate,
//     endDate,
//     items,
//     total: items.reduce((sum, item) => sum + item.price, 0),
//     status: 'pending',
//     createdAt: new Date()
//   };
  
//   rentals.push(rental);
//   res.json({ success: true, rental });
// });

// app.get('/api/rentals', (req, res) => {
//   res.json(rentals);
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Backend API running on port ${PORT}`);
// });
