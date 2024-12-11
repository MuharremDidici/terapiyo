import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import CameraMicTest from "./components/CameraMicTest";
import PsychologistProfile from "./components/PsychologistProfile";
import SessionList from "./components/SessionList";
import VideoCall from "./components/VideoCall";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5001", { autoConnect: false });

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socket.auth = { token };
      socket.connect();
      setLoggedIn(true);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    socket.disconnect();
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">
            <span className="logo-text">Terapiyo</span>
          </div>
          <ul className="nav-list">
            <li>
              <NavLink to="/" activeclassname="active">
                Ana Sayfa
              </NavLink>
            </li>
            {loggedIn ? (
              <>
                <li>
                  <NavLink to="/test" activeclassname="active">
                    Test
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/sessions" activeclassname="active">
                    Seanslar
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-button">
                    Çıkış Yap
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" activeclassname="active">
                    Giriş
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" activeclassname="active">
                    Kayıt Ol
                  </NavLink>
                </li>
              </>
            )}
            <li>
              <NavLink to="/video-call" activeclassname="active">
                Görüntülü Görüşme
              </NavLink>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/test" element={<CameraMicTest />} />
            <Route path="/psychologist/:id" element={<PsychologistProfile />} />
            <Route path="/sessions" element={<SessionList />} />
            <Route path="/video-call" element={<VideoCall socket={socket} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;