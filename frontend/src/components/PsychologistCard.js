import React from "react";
import { Link } from "react-router-dom";

function PsychologistCard({ psychologist }) {
  const defaultImage = "/placeholder.jpg";

  return (
    <Link
      to={`/psychologist/${psychologist._id}`}
      className="psychologist-card"
    >
      <div className="card">
        <img
          src={
            psychologist.profilePicture || defaultImage
          }
          alt={`${psychologist.firstName} ${psychologist.lastName}`}
          className="card-img-top"
        />
        <div className="card-body">
          <h3 className="card-title">
            {psychologist.firstName} {psychologist.lastName}
          </h3>
          <p className="card-text">
            {psychologist.expertiseAreas.join(", ")}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default PsychologistCard;