//gerekli  modülleri
import express from "express";
import { createServer } from "http";
import http from "http";
import { config } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
// route modülleri
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import psychologistRoutes from "./routes/psychologistRoutes";
import sessionRoutes from "./routes/sessionRoutes";
//diğer
import initSocketServer from "./socket";

// .env dosyasındaki ortam değişkenlerini yükle
config();

// Express uygulamasını oluştur
const app = express();

// CORS ayarlarını etkinleştir
app.use(cors());

// JSON formatındaki istekleri işle
app.use(express.json());

// Auth rotalarını '/api/auth' ön ekiyle kullan
app.use("/api/auth", authRoutes);

// Admin rotalarını '/api/admin' ön ekiyle kullan
app.use("/api/admin", adminRoutes);

// Psikolog rotalarını '/api/psychologists' ön ekiyle kullan
app.use("/api/psychologists", psychologistRoutes);

// Seans rotalarını '/api/sessions' ön ekiyle kullan
app.use("/api/sessions", sessionRoutes);

// MongoDB'ye bağlan
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB veritabanına bağlandı.");

    // Express uygulamasını HTTP sunucusuna sarmala
    const server = http.createServer(app);

    // Socket.IO sunucusunu başlat ve HTTP sunucusuna bağla
    initSocketServer(server);

    // Sunucuyu başlat
    const port = process.env.PORT || 5001;
    server.listen(port, () => {
      console.log(`Sunucu ${port} portunda çalışıyor.`);
    });
  })
  .catch((error) => {
    console.error("MongoDB bağlantı hatası:", error);
  });