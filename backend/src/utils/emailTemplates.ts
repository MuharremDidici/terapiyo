interface EmailTemplateData {
    userName?: string;
    psychologistName?: string;
    startTime?: string;
    endTime?:string;
    sessionType?: string;
    sessionDate?: string;
}
export const sessionCreationTemplate = (data: EmailTemplateData) => {
  // Gelen datayı daha okunabilir hale getirmek için yeniden yapılandır
  const { userName = '', psychologistName = '', startTime = '', sessionType = '', sessionDate = '' } = data;

  return `
    <p>Sayın ${userName},</p>
    <p>${psychologistName} ile olan ${sessionType} seansınız ${sessionDate} tarihinde ${startTime} saatinde oluşturuldu.</p>
    <p>Detaylar için lütfen Terapiyo hesabınıza giriş yapın.</p>
    <p>Teşekkürler,<br>Terapiyo Ekibi</p>
  `;
};
export const sessionConfirmationTemplate = (data: EmailTemplateData) => {
    const { userName = '', psychologistName = '', startTime = '', sessionType = '', sessionDate = '' } = data;

    return `
      <p>Sayın ${userName},</p>
      <p>${psychologistName} ile olan ${sessionType} seansınız ${sessionDate} tarihinde ${startTime} saatinde onaylandı.</p>
      <p>Detaylar için lütfen Terapiyo hesabınıza giriş yapın.</p>
      <p>Teşekkürler,<br>Terapiyo Ekibi</p>
    `;
  };

  export const sessionCancellationTemplate = (data: EmailTemplateData) => {
    const { userName = '', psychologistName = '', startTime = '', sessionType = '', sessionDate = '' } = data;

    return `
      <p>Sayın ${userName},</p>
      <p>${psychologistName} ile olan ${sessionType} seansınız ${sessionDate} tarihinde ${startTime} saatinde iptal edildi.</p>
      <p>Detaylar için lütfen Terapiyo hesabınıza giriş yapın.</p>
      <p>Teşekkürler,<br>Terapiyo Ekibi</p>
    `;
  };

  export const sessionReminderTemplate = (data: EmailTemplateData) => {
    const { userName = '', psychologistName = '', startTime = '', sessionType = '', sessionDate = '' } = data;

    return `
      <p>Sayın ${userName},</p>
      <p>${psychologistName} ile olan ${sessionType} seansınıza ${sessionDate} tarihinde ${startTime} saatinde  kısa bir süre kaldı.</p>
      <p>Detaylar için lütfen Terapiyo hesabınıza giriş yapın.</p>
      <p>Teşekkürler,<br>Terapiyo Ekibi</p>
    `;
  };