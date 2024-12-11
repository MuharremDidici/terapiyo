// ... (diğer import'lar)
const http = require('http'); // HTTP modülünü import et
const initSocketServer = require('./src/socket'); // Socket sunucusunu başlatacak fonksiyonu import et

// ... (diğer kodlar)

// Express uygulamasını oluştur
const app = express();

// Express uygulamasını HTTP sunucusuna sarmala
const server = http.createServer(app);

// Socket.IO sunucusunu başlat ve HTTP sunucusuna bağla
const io = initSocketServer(server);

// ... (diğer kodlar)

// Sunucuyu başlat (HTTP sunucusunu kullan)
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor.`);
});