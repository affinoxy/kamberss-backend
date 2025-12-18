// const fetch = require('node-fetch'); // Fallback if global fetch missing, but usually standard in v18+
// // If node-fetch isn't installed, we might need to rely on native fetch or install it.
// // Let's try native fetch first by suppressing this line if needed or just using keys.

// const API_URL = 'http://localhost:5000/api';

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
//         name: 'Sony 24-70mm f/2.8 GM',
//         category: 'lenses',
//         price: 100000,
//         image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=500',
//         specs: 'Zoom Lens',
//         description: 'Versatile zoom lens for all situations.'
//     }
// ];

// const rentals = [
//     {
//         name: 'Budi Santoso',
//         email: 'budi@example.com',
//         phone: '08123456789',
//         startDate: '2023-12-20',
//         endDate: '2023-12-23',
//         items: [] // Will be filled with product IDs
//     },
//     {
//         name: 'Siti Aminah',
//         email: 'siti@test.com',
//         phone: '08987654321',
//         startDate: '2023-12-25',
//         endDate: '2023-12-26',
//         items: []
//     }
// ];

// async function seed() {
//     console.log('🌱 Starting seed...');

//     try {
//         // 1. Create Products
//         const createdProducts = [];
//         for (const p of products) {
//             console.log(`Adding product: ${p.name}...`);
//             const res = await fetch(`${API_URL}/products`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(p)
//             });

//             if (!res.ok) {
//                 console.error(`Failed to add product ${p.name}`);
//                 continue;
//             }

//             const newProduct = await res.json();
//             createdProducts.push(newProduct);
//             console.log(`✅ Added ${newProduct.name} (ID: ${newProduct.id})`);
//         }

//         if (createdProducts.length === 0) {
//             console.error('❌ No products created, skipping rentals.');
//             return;
//         }

//         // 2. Create Rentals
//         rentals[0].items = [createdProducts[0], createdProducts[2]]; // Budi rents Camera 1 + Lens
//         rentals[1].items = [createdProducts[1]]; // Siti rents Camera 2

//         for (const r of rentals) {
//             console.log(`Adding rental for: ${r.name}...`);
//             const res = await fetch(`${API_URL}/rental`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(r)
//             });

//             if (!res.ok) {
//                 console.error(`Failed to add rental for ${r.name}`);
//                 const txt = await res.text();
//                 console.error(txt);
//                 continue;
//             }

//             console.log(`✅ Added rental for ${r.name}`);
//         }

//         console.log('🎉 Seeding completed!');

//     } catch (err) {
//         console.error('❌ Error during seeding:', err);
//     }
// }

// seed();
