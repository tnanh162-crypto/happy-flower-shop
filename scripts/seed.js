/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

// Minimal .env.local loader so we don't need an extra dependency.
(function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
})();

const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "shop.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Khac',
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    retail_price INTEGER NOT NULL DEFAULT 0,
    wholesale_price INTEGER NOT NULL DEFAULT 0,
    ctv_price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_bestseller INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "admin123";
const hash = bcrypt.hashSync(password, 10);

const existing = db.prepare("SELECT id FROM admin WHERE username = ?").get(username);
if (existing) {
  db.prepare("UPDATE admin SET password_hash = ? WHERE username = ?").run(hash, username);
  console.log(`Updated password for existing admin "${username}".`);
} else {
  db.prepare("INSERT INTO admin (username, password_hash) VALUES (?, ?)").run(username, hash);
  console.log(`Created admin account "${username}".`);
}

const productCount = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
if (productCount === 0) {
  const insert = db.prepare(`
    INSERT INTO products
      (name, slug, category, description, image_url, retail_price, wholesale_price, ctv_price, stock, is_featured, is_bestseller)
    VALUES (@name, @slug, @category, @description, @image_url, @retail_price, @wholesale_price, @ctv_price, @stock, @is_featured, @is_bestseller)
  `);

  const sample = [
    {
      name: "Bó Hồng Đỏ Passion",
      slug: "bo-hong-do-passion",
      category: "Bó hoa",
      description: "20 bông hồng đỏ Ecuador phối lá bạc, gói giấy kraft mộc mạc. Thích hợp tặng người yêu, kỷ niệm ngày cưới.",
      image_url: "",
      retail_price: 550000,
      wholesale_price: 420000,
      ctv_price: 460000,
      stock: 25,
      is_featured: 1,
      is_bestseller: 1,
    },
    {
      name: "Giỏ Hoa Hướng Dương Rực Rỡ",
      slug: "gio-hoa-huong-duong",
      category: "Giỏ hoa",
      description: "Giỏ mây tự nhiên cắm hướng dương tươi cùng cúc baby, mang năng lượng tích cực. Phù hợp chúc mừng khai trương.",
      image_url: "",
      retail_price: 680000,
      wholesale_price: 520000,
      ctv_price: 570000,
      stock: 15,
      is_featured: 1,
      is_bestseller: 0,
    },
    {
      name: "Bình Lan Hồ Điệp Trắng",
      slug: "binh-lan-ho-diep-trang",
      category: "Chậu/Bình",
      description: "3 cành lan hồ điệp trắng cắm bình sứ cao cấp, giữ hoa lâu tàn. Sang trọng cho không gian phòng khách hoặc văn phòng.",
      image_url: "",
      retail_price: 1250000,
      wholesale_price: 980000,
      ctv_price: 1050000,
      stock: 8,
      is_featured: 1,
      is_bestseller: 1,
    },
    {
      name: "Bó Tulip Hà Lan Pastel",
      slug: "bo-tulip-ha-lan-pastel",
      category: "Bó hoa",
      description: "15 cành tulip nhập khẩu tông pastel dịu dàng, gói vải lanh be. Món quà tinh tế cho sinh nhật hoặc cảm ơn.",
      image_url: "",
      retail_price: 720000,
      wholesale_price: 560000,
      ctv_price: 610000,
      stock: 12,
      is_featured: 0,
      is_bestseller: 1,
    },
    {
      name: "Hộp Hoa Baby Trắng Mini",
      slug: "hop-hoa-baby-trang-mini",
      category: "Hộp hoa",
      description: "Hộp tròn nhỏ xinh cắm hoa baby trắng, phù hợp làm quà tặng nhẹ nhàng hoặc trang trí bàn làm việc.",
      image_url: "",
      retail_price: 320000,
      wholesale_price: 240000,
      ctv_price: 270000,
      stock: 30,
      is_featured: 0,
      is_bestseller: 0,
    },
    {
      name: "Kệ Hoa Chúc Mừng Khai Trương",
      slug: "ke-hoa-khai-truong",
      category: "Kệ hoa",
      description: "Kệ hoa 2 tầng phối lay ơn, cát tường và đồng tiền, kèm dải băng chúc mừng theo yêu cầu.",
      image_url: "",
      retail_price: 1650000,
      wholesale_price: 1300000,
      ctv_price: 1400000,
      stock: 6,
      is_featured: 0,
      is_bestseller: 0,
    },
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(sample);
  console.log(`Seeded ${sample.length} sample products.`);
} else {
  console.log("Products already exist, skipping sample product seed.");
}

console.log("\nDone. Admin login:");
console.log(`  username: ${username}`);
console.log(`  password: ${password}`);
