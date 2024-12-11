import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

// ...

export const sendSessionCreationEmail = async (to: string, psychologistName: string, sessionDate: string, sessionTime: string) => {
  // E-posta ayarlarını yapılandır (ortam değişkenlerinden al)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // E-posta içeriğini oluştur (HTML şablonu kullanabilirsiniz)
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Terapiyo'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: to,
    subject: 'Yeni Seans Oluşturuldu',
    html: `
      <p>Sayın Kullanıcı,</p>
      <p>Dr. ${psychologistName} ile ${sessionDate} tarihinde, saat ${sessionTime}'da bir seansınız oluşturuldu.</p>
      <p>Detaylar için lütfen Terapiyo hesabınıza giriş yapın.</p>
      <p>Teşekkürler,<br>Terapiyo Ekibi</p>
    `,
  };

  // E-postayı gönder
  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.messageId);
    return info;
  } catch (error) {
    console.error('E-posta gönderilirken hata oluştu:', error);
    throw error;
  }
};

// Diğer e-posta gönderme fonksiyonları (onay, iptal, hatırlatma)
// ...