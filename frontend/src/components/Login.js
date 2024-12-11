import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate ekleyin

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // useNavigate hook'unu kullanın

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);

      navigate('/'); // Yönlendirme işlemini navigate ile yapın
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılamadı.');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Giriş Yap</button>
        </form>
        <div className="links">
          <a href="#">Şifremi Unuttum</a>
          <a href="/register">Kayıt Ol</a>
        </div>
      </div>
    </div>
  );
}

export default Login;