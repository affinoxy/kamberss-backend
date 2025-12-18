// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");

// const images = [
//     {
//         name: "canon-1300d",
//         url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Canon_EOS_1300D.jpg"
//     },
//     {
//         name: "canon-600d",
//         url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Canon_EOS_600D.jpg"
//     },
//     {
//         name: "canon-700d",
//         url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Canon_EOS_700D.jpg"
//     },
//     {
//         name: "sony-a6000",
//         url: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Sony_Alpha_a6000.jpg"
//     },
//     {
//         name: "sony-a7-iii",
//         url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Sony_Alpha_a7_III.jpg"
//     },
//     {
//         name: "fujifilm-x-t3",
//         url: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Fujifilm_X-T3.jpg"
//     }
// ];

// const folderPath = path.join(__dirname, "public/images/cameras");

// // pastikan folder ada
// if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
// }

// async function downloadImage(image) {
//     const filePath = path.join(folderPath, `${image.name}.jpg`);

//     const response = await axios({
//         url: image.url,
//         method: "GET",
//         responseType: "stream",
//     });

//     response.data.pipe(fs.createWriteStream(filePath));

//     return new Promise((resolve) => {
//         response.data.on("end", () => {
//             console.log(`✔ Downloaded: ${image.name}.jpg`);
//             resolve();
//         });
//     });
// }

// async function run() {
//     for (const img of images) {
//         await downloadImage(img);
//     }
//     console.log("✅ Semua gambar berhasil di-download");
// }

// run();
