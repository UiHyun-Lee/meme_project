import React from 'react';

const Impressum = () => {
  return (
    <div style={{
      padding: "40px",
      maxWidth: "800px",
      margin: "0 auto",
      color: "white",
      fontFamily: "Arial"
    }}>
      <h1>Impressum</h1>

      <p><strong>Prof. Dr. Florian Müller</strong><br />
      Assistenzprofessor</p>

      <p><strong>Arbeitsgebiet(e):</strong><br />
      Mobile Mensch-Computer Interaktion</p>

      <p><strong>Adresse:</strong><br />
      Hochschulstraße 10<br />
      64289 Darmstadt</p>

      <p>
        Vollständiges Impressum der TU Darmstadt:<br />
        <a
          href="https://www.informatik.tu-darmstadt.de/impressum.de.jsp"
          target="_blank"
          rel="noopener noreferrer"
          style={{color: "#ffd700"}}
        >
          https://www.informatik.tu-darmstadt.de/impressum.de.jsp
        </a>
      </p>
    </div>
  );
};

export default Impressum;