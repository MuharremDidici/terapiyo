import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CreateSession from "./CreateSession";

function PsychologistProfile() {
  const { id } = useParams();
  console.log("ID from useParams:", id);
  const [psychologist, setPsychologist] = useState(null);
  const [error, setError] = useState("");
  const [showCreateSession, setShowCreateSession] = useState(false);

  useEffect(() => {
    const fetchPsychologist = async () => {
      setError("");
      try {
        const response = await axios.get(
          `http://localhost:5001/api/psychologists/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPsychologist(response.data);
      } catch (error) {
        console.error("Psikolog profili alınırken hata:", error);
        setError("Psikolog profili yüklenirken bir hata oluştu.");
      }
    };

    fetchPsychologist();
  }, [id]);

  const handleSessionCreate = () => {
    setShowCreateSession(false);
  };

  if (error) {
    return (
      <div className="container">
        <h1>Hata</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!psychologist) {
    return <div className="container"><h1>Yükleniyor...</h1></div>;
  }

  return (
    <div className="container">
      <div className="profile-header">
        <img
          src={
            psychologist.profilePicture ||
            "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
          }
          alt={`${psychologist.firstName} ${psychologist.lastName}`}
          className="profile-picture"
        />
        <div className="profile-info">
          <h1>
            {psychologist.firstName} {psychologist.lastName}
          </h1>
          <p className="expertise-areas">
            Uzmanlık Alanları: {psychologist.expertiseAreas.join(", ")}
          </p>
        </div>
      </div>

      <div className="profile-section">
        <h2>Hakkında</h2>
        <p>{psychologist.bio}</p>
      </div>

      <div className="profile-section">
        <h2>Eğitim</h2>
        <p>{psychologist.education}</p>
      </div>

      <div className="profile-section">
        <h2>Deneyim</h2>
        <p>{psychologist.experience}</p>
      </div>

      <div className="profile-section">
        <h2>Yorumlar</h2>
        {/* Yorumları burada listeleyeceğiz */}
      </div>

      <button
        className="session-button"
        onClick={() => setShowCreateSession(!showCreateSession)}
      >
        Seans Oluştur
      </button>
      {showCreateSession && (
        <CreateSession
          psychologistId={id}
          onSessionCreated={handleSessionCreate}
        />
      )}
    </div>
  );
}

export default PsychologistProfile;