import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "../utils/auth";
import axios from "axios";

interface User {
  id: string;
  role: string;
}

interface CustomSocket extends Socket {
  user?: User;
}

async function getIceServers() {
  try {
    const response = await axios.put(
      `https://${process.env.XIRSYS_DOMAIN}/_turn/${process.env.XIRSYS_CHANNEL}`,
      {},
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.XIRSYS_IDENT}:${process.env.XIRSYS_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    console.log("API Response:", response.data); // API yanıtını kontrol et

        const iceServersData = response.data.v.iceServers; // iceServers dizisini al

        // iceServersData'nın bir dizi olup olmadığını kontrol et
        if (!Array.isArray(iceServersData)) {
            throw new TypeError("response.data.v.iceServers bir dizi değil.");
        }

        const iceServers = iceServersData.map((server: any) => {
          if (server.url && server.username && server.credential) {
              return {
                  urls: server.url,
                  username: server.username,
                  credential: server.credential
              };
          }
          return null; // Geçersiz sunucu verisi
      }).filter(Boolean);

    console.log("ICE Servers:", iceServers);
    return iceServers;
  } catch (error) {
    console.error("Xirsys'ten ICE sunucuları alınırken hata oluştu:", error);
    return [];
  }
}

function initSocketServer(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Kullanıcıları ve eşleştirmelerini saklamak için bir Map kullanalım
  const users = new Map<string, string>();

  // Kimlik doğrulama için middleware ekle
  io.use(async (socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        socket.data.user = { id: decoded.userId, role: decoded.role };
        // Kullanıcıyı kaydet
        users.set(decoded.userId, socket.id);
        console.log(
          `Kullanıcı kaydedildi: ${decoded.userId} - ${socket.id}`
        );
        return next();
      }
    }
    return next(new Error("Kimlik doğrulama başarısız."));
  });

  io.on("connection", async (socket: CustomSocket) => {
    console.log(
      "Yeni bir kullanıcı bağlandı:",
      socket.id,
      "Kullanıcı:",
      socket.data.user
    );

    // Xirsys'ten alınan ICE sunucularını istemciye gönder
    const iceServers = await getIceServers();
    socket.emit("iceServers", iceServers);

    // Kullanıcıları belirli bir odaya katılmaya zorla
    socket.on("joinRoom", (roomId: string) => {
      if (socket.data.user) {
        console.log(
          `Kullanıcı ${socket.data.user.id} ${roomId} odasına katıldı.`
        );
        socket.join(roomId);
        const clients = io.sockets.adapter.rooms.get(roomId);
        const clientIds = clients ? Array.from(clients) : [];
        io.to(roomId).emit("userList", clientIds); // userList'i tüm odaya yayınlayın
      }
    });

    // Kullanıcı odadan ayrıldığında yayını yap
    socket.on("leaveRoom", (roomId: string) => {
      if (socket.data.user) {
        console.log(
          `Kullanıcı ${socket.data.user.id} ${roomId} odasından ayrıldı.`
        );
        socket.leave(roomId);
        // Diğer kullanıcılara bilgi ver
        socket.to(roomId).emit("userLeft", socket.id);
      }
    });

 // WebRTC sinyalleşme olaylarını işle
    socket.on("offer", (data: any) => {
      const receiverSocketId = users.get(data.receiverId);
      if (receiverSocketId) {
        console.log(
          `Teklif (offer) iletiliyor: ${data.from} -> ${data.receiverId}`
        );
        socket.to(receiverSocketId).emit("offer", data);
      } else {
        console.log(`Alıcı soket ID'si bulunamadı: ${data.receiverId}`);
      }
    });

    socket.on("answer", (data: any) => {
      const receiverSocketId = users.get(data.receiverId);
      if (receiverSocketId) {
        console.log(
          `Cevap (answer) iletiliyor: ${data.from} -> ${data.receiverId}`
        );
        socket.to(receiverSocketId).emit("answer", data);
      } else {
        console.log(`Alıcı soket ID'si bulunamadı: ${data.receiverId}`);
      }
    });

    socket.on("candidate", (data: any) => {
      const receiverSocketId = users.get(data.receiverId);
      if (receiverSocketId) {
        console.log(
          `Aday (candidate) iletiliyor: ${data.from} -> ${data.receiverId}`
        );
        socket.to(receiverSocketId).emit("candidate", data);
      } else {
        console.log(`Alıcı soket ID'si bulunamadı: ${data.receiverId}`);
      }
    });

    // Bağlantı kesilme olayını yönet
    socket.on("disconnecting", () => {
      if (socket.data.user) {
        console.log(
          "Kullanıcı bağlantısı kesiliyor, odalardan çıkarılıyor:",
          socket.id
        );
        const rooms = Object.keys(socket.rooms);
        rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.to(room).emit("userLeft", socket.id);
          }
        });
      }
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı bağlantısı kesildi:', socket.id);
        if (socket.data.user) {
            // Kullanıcıyı, ayrıldığında kullanıcılar listesinden kaldır
            users.delete(socket.data.user.id);
            console.log(`Kullanıcı kaldırıldı: ${socket.data.user.id}`);
            console.log("Kayıtlı kullanıcılar:", users);
        }
    });
  });

  return io;
}

export default initSocketServer;