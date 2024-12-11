import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role
      });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/'; // Ana sayfaya yönlendir
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu.');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Kayıt Ol</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="firstName">Ad</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">Soyad</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="role">Rol</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Kullanıcı</option>
              <option value="psychologist">Psikolog</option>
            </select>
          </div>
          <button type="submit">Kayıt Ol</button>
        </form>
        <div className="links">
          <a href="/login">Giriş Yap</a>
        </div>
      </div>
    </div>
  );
}

export default Register;