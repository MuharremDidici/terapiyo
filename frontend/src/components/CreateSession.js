import React, { useState } from 'react';
import axios from 'axios';

function CreateSession({ psychologistId, onSessionCreated }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [sessionType, setSessionType] = useState('online');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess(false);
        try {
            const response = await axios.post('http://localhost:5001/api/sessions', {
                psychologistId,
                startTime,
                endTime,
                sessionType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setSuccess(true);
            onSessionCreated(); // Seans oluşturulduktan sonra callback'i çağır
            // İsteğe bağlı: Kullanıcıyı başka bir sayfaya yönlendirebilirsiniz
            // window.location.href = '/profile';
        } catch (error) {
            console.error('Seans oluşturma hatası:', error);
            setError('Seans oluşturulurken bir hata oluştu.');
        }
    };

    return (
        <div className="create-session-form">
            <h3>Seans Oluştur</h3>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Seans talebiniz başarıyla oluşturuldu.</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="startTime">Başlangıç Tarihi ve Saati:</label>
                    <input
                        type="datetime-local"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endTime">Bitiş Tarihi ve Saati:</label>
                    <input
                        type="datetime-local"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="sessionType">Seans Türü:</label>
                    <select id="sessionType" value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="form-control">
                        <option value="online">Online</option>
                        <option value="yüz yüze">Yüz Yüze</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Seans Oluştur</button>
            </form>
        </div>
    );
}

export default CreateSession;