import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // jwtDecode'u süslü parantezler içinde import edin

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setError('');
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token); // jwtDecode'u doğrudan kullanın
        const userId = decodedToken.userId;

        const response = await axios.get(`http://localhost:5001/api/sessions/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSessions(response.data);
      } catch (error) {
        console.error('Seanslar alınırken hata:', error);
        setError('Seanslar yüklenirken bir hata oluştu.');
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="container">
      <h1>Seanslarım</h1>
      {error && <p className="error">{error}</p>}
      {sessions.length === 0 ? (
        <p>Henüz seansınız bulunmamaktadır.</p>
      ) : (
        <table className="session-table">
          <thead>
            <tr>
              <th>Başlangıç Zamanı</th>
              <th>Bitiş Zamanı</th>
              <th>Tür</th>
              <th>Durum</th>
              {/* Gerekirse diğer sütunlar eklenebilir */}
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session._id}>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td>{new Date(session.endTime).toLocaleString()}</td>
                <td>{session.sessionType}</td>
                <td>{session.status}</td>
                {/* Gerekirse diğer sütunlar eklenebilir */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SessionList;