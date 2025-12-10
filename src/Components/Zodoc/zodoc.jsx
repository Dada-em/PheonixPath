import React from "react";

export default function CustomFloatingZocdocButton() {
  return (
    <a
      href="https://www.zocdoc.com/practice/phoenixpath-mental-health-services-153861?lock=true&isNewPatient=false&referrerType=widget"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "12px 26px",           // same as your main-text button
        backgroundColor: "#006D77",      // same color
        color: "#ffffff",                // text color
        border: "none",
        borderRadius: "8px",             // same radius
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "22px",
        textDecoration: "none",
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        transition: "all 0.3s ease",
        display: "inline-block",
        textAlign: "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00535B")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#006D77")}
    >
      Book Appointment
    </a>
  );
}
