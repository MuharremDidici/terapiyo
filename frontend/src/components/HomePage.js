import React, { useState, useEffect } from "react";
import PsychologistCard from "./PsychologistCard";
import axios from "axios";

function HomePage() {
  const [psychologists, setPsychologists] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchPsychologists = async () => {
      setError("");
      try {
        const response = await axios.get(
          "http://localhost:5001/api/psychologists",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPsychologists(response.data);
      } catch (error) {
        console.error("Psikologlar alınırken hata:", error);
        setError("Psikologlar yüklenirken bir hata oluştu.");
      }
    };

    fetchPsychologists();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredPsychologists = psychologists.filter((psychologist) => {
    const nameMatch =
      psychologist.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      psychologist.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const expertiseMatch =
      filter === "" || psychologist.expertiseAreas.includes(filter);
    return nameMatch && expertiseMatch;
  });

  return (
    <div className="container">
      {" "}
      {/* Container sınıfını buraya da ekleyin */}
      <section className="hero">
        <div className="hero-content">
          <h1>Terapiyo'ya Hoş Geldiniz</h1>
          <p>Alanında uzman psikologlarımızla online terapiye hemen başlayın.</p>
          <a href="/search" className="hero-button">
            Psikolog Ara
          </a>
        </div>
      </section>
      <section className="search-filter-section">
        <input
          type="text"
          placeholder="Psikolog Ara"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select
          className="filter-select"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="">Uzmanlık Alanı</option>
          <option value="anxiety">Anksiyete</option>
          <option value="depression">Depresyon</option>
          {/* Diğer uzmanlık alanlarını buraya ekleyin */}
        </select>
      </section>
      <section className="featured-psychologists">
        <h2>Öne Çıkan Psikologlar</h2>
        <div className="psychologist-list">
          {filteredPsychologists.map((psychologist) => (
            <PsychologistCard
              key={psychologist._id}
              psychologist={psychologist}
            />
          ))}
        </div>
      </section>
      {/* Diğer bölümler (Uzmanlık Alanları, Nasıl Çalışır, Yorumlar) */}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default HomePage;