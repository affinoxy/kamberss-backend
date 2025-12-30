// require('dotenv').config();
// const { Pool } = require('pg');

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//     console.error('❌ Error: DATABASE_URL is not defined in .env file');
//     console.error('👉 Tip: Pastikan Anda sudah membuat file .env dan mengisi DATABASE_URL');
//     process.exit(1);
// }

// const pool = new Pool({
//     connectionString: connectionString,
//     ssl: process.env.NODE_ENV === 'production' || connectionString.includes('railway')
//         ? { rejectUnauthorized: false }
//         : false
// });

// const products = [
//     {
//         name: 'Sony A7 III',
//         category: 'cameras',
//         price: 150000,
//         image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500',
//         specs: '24MP Full Frame',
//         description: 'Professional mirrorless camera perfect for low light.'
//     },
//     {
//         name: 'Canon EOS R5',
//         category: 'cameras',
//         price: 250000,
//         image: 'https://images.unsplash.com/photo-1519183071295-37f20c4d8c42?auto=format&fit=crop&w=500',
//         specs: '45MP Full Frame',
//         description: 'High-resolution professional camera.'
//     },
//     {
//         name: 'Fujifilm X-T4',
//         category: 'cameras',
//         price: 180000,
//         image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500',
//         specs: '26MP APS-C',
//         description: 'Great for video and stills with IBS.'
//     },
//     {
//         name: 'Sony 24-70mm f/2.8 GM',
//         category: 'lenses',
//         price: 100000,
//         image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=500',
//         specs: 'Zoom Lens',
//         description: 'Versatile zoom lens for all situations.'
//     },
//     {
//         name: 'Sigma 16mm f/1.4',
//         category: 'lenses',
//         price: 50000,
//         image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=500',
//         specs: 'Prime Lens',
//         description: 'Wide angle lens perfect for landscape.'
//     },
//     {
//         name: 'GoPro Hero 11',
//         category: 'actioncam',
//         price: 75000,
//         image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=500',
//         specs: '5.3K Video',
//         description: 'Ultimate action camera for adventure.'
//     },
//     {
//         name: 'DJI RS 3',
//         category: 'gimbals',
//         price: 120000,
//         image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=500',
//         specs: '3-Axis Stabilizer',
//         description: 'Professional stabilizer for smooth footage.'
//     },
//     {
//         name: 'Godox SL60W',
//         category: 'lighting',
//         price: 60000,
//         image: 'https://images.unsplash.com/photo-1524397057410-1e775ed476f3?auto=format&fit=crop&w=500',
//         specs: '60W LED',
//         description: 'Continuous lighting for video shoots.'
//     },
//     {
//         name: 'Paket Vlogging',
//         category: 'packages',
//         price: 200000,
//         image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500',
//         specs: 'Camera + Mic + Tripod',
//         description: 'Complete starter kit for vloggers.'
//     }
// ];

// const users = [
//     {
//         name: 'Admin Kamberss',
//         email: 'admin@kamberss.com',
//         password: 'admin123', // In real app, hash this!
//         role: 'admin'
//     },
//     {
//         name: 'Customer Demo',
//         email: 'user@gmail.com',
//         password: 'user123',
//         role: 'customer'
//     }
// ];

// async function seed() {
//     console.log('🌱 Starting database seed...');
//     const client = await pool.connect();

//     try {
//         await client.query('BEGIN');

//         // ============================================
//         // 1. Drop existing tables (clean slate)
//         // ============================================
//         console.log('🗑️  Dropping old tables...');
//         await client.query(`DROP TABLE IF EXISTS rental_items CASCADE`);
//         await client.query(`DROP TABLE IF EXISTS rentals CASCADE`);
//         await client.query(`DROP TABLE IF EXISTS products CASCADE`);
//         await client.query(`DROP TABLE IF EXISTS users CASCADE`);

//         // ============================================
//         // 2. Create Tables
//         // ============================================
//         console.log('🏗️  Creating tables...');

//         // Users Table
//         await client.query(`
//       CREATE TABLE users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         email VARCHAR(100) UNIQUE NOT NULL,
//         password VARCHAR(100) NOT NULL,
//         role VARCHAR(20) DEFAULT 'customer',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//         // Products Table
//         await client.query(`
//       CREATE TABLE products (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         category VARCHAR(50) NOT NULL,
//         price INTEGER NOT NULL,
//         image TEXT,
//         specs TEXT,
//         description TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//         // Rentals Table
//         await client.query(`
//       CREATE TABLE rentals (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         email VARCHAR(100) NOT NULL,
//         phone VARCHAR(20) NOT NULL,
//         start_date DATE NOT NULL,
//         end_date DATE NOT NULL,
//         status VARCHAR(20) DEFAULT 'pending',
//         return_date TIMESTAMP,
//         return_notes TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//         // Rental Items Table (Many-to-Many relationship)
//         await client.query(`
//       CREATE TABLE rental_items (
//         id SERIAL PRIMARY KEY,
//         rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
//         product_id INTEGER REFERENCES products(id),
//         price INTEGER NOT NULL
//       );
//     `);

//         // ============================================
//         // 3. Insert Data
//         // ============================================
//         console.log('📝 Inserting data...');

//         // Insert Users
//         for (const u of users) {
//             await client.query(
//                 `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
//                 [u.name, u.email, u.password, u.role]
//             );
//         }
//         console.log(`✅ Inserted ${users.length} users`);

//         // Insert Products
//         for (const p of products) {
//             await client.query(
//                 `INSERT INTO products (name, category, price, image, specs, description)
//          VALUES ($1, $2, $3, $4, $5, $6)`,
//                 [p.name, p.category, p.price, p.image, p.specs, p.description]
//             );
//         }
//         console.log(`✅ Inserted ${products.length} products`);

//         await client.query('COMMIT');
//         console.log('🎉 Database seeded successfully!');

//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error('❌ Error seeding database:', err);
//     } finally {
//         client.release();
//         pool.end();
//     }
// }

// seed();
