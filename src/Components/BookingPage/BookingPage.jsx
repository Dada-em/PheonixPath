/**
 * BookingPage.jsx
 * 
 * SETUP INSTRUCTIONS:
 * 1. npm install resend  (for email - use in your backend/API route)
 * 2. Create a .env file with:
 *    VITE_RESEND_API_KEY=your_resend_api_key   ← get free at resend.com
 *    VITE_NURSE_EMAIL=nurse@example.com
 * 
 * EMAIL NOTE:
 * Resend cannot be called directly from React (browser) — you need a tiny backend.
 * Options:
 *   A) Add an API route if using Next.js  → /pages/api/send-email.js
 *   B) Use a free serverless function     → Vercel, Netlify, or Render (all free)
 *   C) Use EmailJS (browser-safe, no backend needed) → emailjs.com (free 200/month)
 * 
 * This file uses EmailJS approach by default (no backend needed).
 * Swap sendConfirmationEmails() if you add a backend later.
 * 
 * AVAILABILITY TRACKING:
 * The nurse's weekly schedule is defined in PROVIDER_SCHEDULE below.
 * She can update it herself, or you can add a simple admin panel later.
 * Already-booked slots are tracked in localStorage (swap for a DB later).
 */

import { useState, useEffect } from "react";

const BRAND = "#006D77";
const BRAND_LIGHT = "rgba(0,109,119,0.08)";
const BRAND_MID = "rgba(0,109,119,0.15)";

// ─── PROVIDER CONFIG ──────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: "okunlola",
    name: "Oluwakemi Okunlola",
    credentials: "NP, PMHNP-BC",
    role: "Mental Health Nurse Practitioner",
    rating: 4.9,
    reviews: 33,
    initials: "OO",
    // Weekly schedule: which days and hours she's available
    // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    schedule: {
      1: { start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
      2: { start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
      3: { start: "10:00", end: "16:00", breakStart: null, breakEnd: null },
      4: { start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
      5: { start: "09:00", end: "13:00", breakStart: null, breakEnd: null },
    },
    appointmentDuration: 60, // minutes per slot
    bufferBetween: 15,       // minutes buffer between appointments
  },
  {
    id: "adeyemi",
    name: "Samuel Adeyemi",
    credentials: "RN",
    role: "Registered Nurse",
    rating: 4.8,
    reviews: 18,
    initials: "SA",
    schedule: {
      1: { start: "08:00", end: "16:00", breakStart: "12:00", breakEnd: "13:00" },
      3: { start: "08:00", end: "16:00", breakStart: "12:00", breakEnd: "13:00" },
      5: { start: "08:00", end: "14:00", breakStart: null, breakEnd: null },
    },
    appointmentDuration: 45,
    bufferBetween: 10,
  },
];

const SPECIALTIES = [
  "All specialties",
  "Adult Psychiatric & Mental Health Nursing",
  "Family Psychiatric & Mental Health Nursing",
  "Mental Health Nurse Practitioner",
  "Nurse Practitioner (Psychiatry)",
  "Registered Nurse",
];

// ─── AVAILABILITY HELPERS ─────────────────────────────────────────────────────

function generateTimeSlots(provider, date) {
  const dayOfWeek = date.getDay();
  const daySchedule = provider.schedule[dayOfWeek];
  if (!daySchedule) return []; // provider not working this day

  const slots = [];
  const [startH, startM] = daySchedule.start.split(":").map(Number);
  const [endH, endM] = daySchedule.end.split(":").map(Number);
  const totalStep = provider.appointmentDuration + provider.bufferBetween;

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + provider.appointmentDuration <= end) {
    // Skip break time
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const [bsH, bsM] = daySchedule.breakStart.split(":").map(Number);
      const [beH, beM] = daySchedule.breakEnd.split(":").map(Number);
      const breakStart = bsH * 60 + bsM;
      const breakEnd = beH * 60 + beM;
      if (current >= breakStart && current < breakEnd) {
        current = breakEnd;
        continue;
      }
      if (current < breakStart && current + provider.appointmentDuration > breakStart) {
        current = breakEnd;
        continue;
      }
    }
    if (current + provider.appointmentDuration <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
      slots.push({ time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`, label });
    }
    current += totalStep;
  }
  return slots;
}

function getBookedSlots() {
  // In production: fetch from your database
  // For now: localStorage keeps track between sessions
  try {
    return JSON.parse(localStorage.getItem("bookedSlots") || "{}");
  } catch {
    return {};
  }
}

function saveBookedSlot(providerId, dateStr, time) {
  const booked = getBookedSlots();
  const key = `${providerId}-${dateStr}`;
  booked[key] = [...(booked[key] || []), time];
  localStorage.setItem("bookedSlots", JSON.stringify(booked));
}

function getAvailableSlots(provider, date) {
  const allSlots = generateTimeSlots(provider, date);
  const dateStr = date.toISOString().split("T")[0];
  const booked = getBookedSlots();
  const bookedForDay = booked[`${provider.id}-${dateStr}`] || [];
  return allSlots.filter((s) => !bookedForDay.includes(s.time));
}

function getNextAvailableDays(provider, count = 7) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let d = new Date(today);
  let checked = 0;
  while (days.length < count && checked < 60) {
    const slots = getAvailableSlots(provider, d);
    if (slots.length > 0) {
      days.push({ date: new Date(d), slots });
    }
    d.setDate(d.getDate() + 1);
    checked++;
  }
  return days;
}

function formatDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Replace sendConfirmationEmails() with this:
async function sendConfirmationEmails(booking) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_name:     booking.name,
      patient_email:    booking.email,
      patient_phone:    booking.phone || 'Not provided',
      provider_name:    `${booking.provider.name}, ${booking.provider.credentials}`,
      appointment_date: formatDateFull(booking.date),
      appointment_time: booking.timeLabel,
      visit_type:       booking.visitType,
      specialty:        booking.specialty,
      reason:           booking.reason || 'Not specified',
      nurse_email:      'nurse@yourdomain.com',
    }),
  });
  if (!res.ok) throw new Error('Email failed');
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f7f7f5",
    minHeight: "100vh",
    paddingBottom: "3rem",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e8e8e5",
    padding: "1.5rem 1.25rem 1.25rem",
  },
  practiceName: { fontSize: 20, fontWeight: 600, color: "#111", margin: 0 },
  practiceSub: { fontSize: 13, color: "#888", marginTop: 3 },
  rating: { display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 },
  starRow: { color: BRAND, letterSpacing: 1 },
  card: {
    background: "#fff",
    borderRadius: 16,
    margin: "1rem",
    padding: "1.5rem 1.25rem",
    border: "1px solid #ebebeb",
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 4 },
  sectionSub: { fontSize: 13, color: "#999", marginBottom: "1.25rem" },
  label: { fontSize: 13, color: "#666", marginBottom: 5, display: "block", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    fontSize: 14,
    background: "#fff",
    color: "#111",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    fontSize: 14,
    background: "#fff",
    color: "#111",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "1rem",
    outline: "none",
    appearance: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    fontSize: 14,
    background: "#fff",
    color: "#111",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "1rem",
    outline: "none",
    resize: "none",
    height: 90,
    boxSizing: "border-box",
  },
  btnPrimary: {
    width: "100%",
    padding: "14px",
    background: BRAND,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 4,
  },
  btnSecondary: {
    width: "100%",
    padding: "13px",
    background: "transparent",
    color: BRAND,
    border: `1.5px solid ${BRAND}`,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 10,
  },
  steps: { display: "flex", alignItems: "center", gap: 6, marginBottom: "1.5rem" },
  stepDot: (active, done) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    background: done || active ? BRAND : "#f0f0f0",
    color: done || active ? "#fff" : "#aaa",
  }),
  stepLine: (done) => ({
    flex: 1,
    height: 2,
    borderRadius: 2,
    background: done ? BRAND : "#e8e8e8",
  }),
  providerCard: (selected) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px",
    borderRadius: 12,
    border: `1.5px solid ${selected ? BRAND : "#e8e8e8"}`,
    background: selected ? BRAND_LIGHT : "#fff",
    cursor: "pointer",
    marginBottom: 10,
    transition: "all 0.15s ease",
  }),
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: BRAND_MID,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: BRAND,
    flexShrink: 0,
  },
  dayBtn: (selected) => ({
    padding: "10px 8px",
    borderRadius: 10,
    border: `1.5px solid ${selected ? BRAND : "#e8e8e8"}`,
    background: selected ? BRAND : "#f7f7f5",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s ease",
  }),
  timeBtn: (selected) => ({
    padding: "10px 8px",
    borderRadius: 10,
    border: `1.5px solid ${selected ? BRAND : "#e8e8e8"}`,
    background: selected ? BRAND : "#f7f7f5",
    cursor: "pointer",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    color: selected ? "#fff" : "#333",
    transition: "all 0.15s ease",
  }),
  notice: {
    background: BRAND_LIGHT,
    borderLeft: `3px solid ${BRAND}`,
    borderRadius: "0 10px 10px 0",
    padding: "10px 14px",
    fontSize: 13,
    color: "#444",
    marginBottom: "1.25rem",
    lineHeight: 1.5,
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "9px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 14,
    gap: 12,
  },
  badge: {
    display: "inline-block",
    background: BRAND_LIGHT,
    color: BRAND,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 4,
  },
  noSlots: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    padding: "1.5rem 0",
  },
};

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div style={s.steps}>
      {[1, 2, 3].map((n, i) => (
        <>
          <div key={n} style={s.stepDot(current === n, current > n)}>
            {current > n ? "✓" : n}
          </div>
          {i < 2 && <div style={s.stepLine(current > n + 1 || (current === n + 1 && n < 2))} />}
        </>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [visitType, setVisitType] = useState("Telehealth (Video)");
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Recalculate available days whenever provider changes
  useEffect(() => {
    const days = getNextAvailableDays(selectedProvider, 7);
    setAvailableDays(days);
    setSelectedDayIdx(0);
    setSelectedTime(null);
  }, [selectedProvider]);

  const currentDay = availableDays[selectedDayIdx];
  const currentSlots = currentDay ? currentDay.slots : [];

  function handleProviderSelect(provider) {
    setSelectedProvider(provider);
    setSelectedTime(null);
  }

  function handleDaySelect(idx) {
    setSelectedDayIdx(idx);
    setSelectedTime(null);
  }

  function canProceedStep1() {
    return selectedTime !== null;
  }

  function canProceedStep2() {
    return form.name.trim() && form.email.trim() && form.email.includes("@");
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      const booking = {
        provider: selectedProvider,
        specialty,
        visitType,
        date: currentDay.date,
        time: selectedTime.time,
        timeLabel: selectedTime.label,
        ...form,
      };

      // Save slot as booked
      const dateStr = currentDay.date.toISOString().split("T")[0];
      saveBookedSlot(selectedProvider.id, dateStr, selectedTime.time);

      // Send emails
      await sendConfirmationEmails(booking);

      setDone(true);
    } catch (err) {
      console.error(err);
      setError(
        "Appointment saved but email failed to send. Please note your booking details above."
      );
      setDone(true); // Still show success, email is not critical
    } finally {
      setSubmitting(false);
    }
  }

  // ── SUCCESS SCREEN ──
  if (done) {
    return (
      <div style={s.page}>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div style={s.header}>
          <p style={s.practiceName}>Phoenixpath Mental Health</p>
          <p style={s.practiceSub}>5 specialties · Telehealth & In-person</p>
        </div>
        <div style={{ ...s.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: BRAND_MID,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: 32,
            }}
          >
            ✓
          </div>
          <p style={{ ...s.sectionTitle, fontSize: 20, marginBottom: 8 }}>
            You're booked!
          </p>
          <p style={{ fontSize: 14, color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            A confirmation has been sent to{" "}
            <strong style={{ color: "#111" }}>{form.email}</strong>. Your provider
            has also been notified.
          </p>
          <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            {[
              ["Provider", `${selectedProvider.name}, ${selectedProvider.credentials}`],
              ["Date", formatDateFull(currentDay.date)],
              ["Time", selectedTime.label],
              ["Visit type", visitType],
            ].map(([l, v]) => (
              <div key={l} style={s.confirmRow}>
                <span style={{ color: "#999" }}>{l}</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>
          {error && (
            <p style={{ fontSize: 13, color: "#c0392b", marginBottom: "1rem" }}>{error}</p>
          )}
          <button
            style={s.btnPrimary}
            onClick={() => {
              setDone(false);
              setStep(1);
              setSelectedTime(null);
              setForm({ name: "", email: "", phone: "", reason: "" });
              setAvailableDays(getNextAvailableDays(selectedProvider, 7));
            }}
          >
            Book another appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* HEADER */}
      <div style={s.header}>
        <p style={s.practiceName}>Phoenixpath Mental Health</p>
        <p style={s.practiceSub}>5 specialties · Telehealth & In-person</p>
        <div style={s.rating}>
          <span style={s.starRow}>★★★★★</span>
          <span style={{ color: "#111", fontWeight: 600 }}>4.91</span>
          <span style={{ color: "#aaa" }}>(33 reviews)</span>
        </div>
      </div>

      {/* STEP 1 — Schedule */}
      {step === 1 && (
        <div style={s.card}>
          <StepIndicator current={1} />
          <p style={s.sectionTitle}>Book an appointment</p>
          <p style={s.sectionSub}>Free to schedule · No account needed</p>

          {/* Specialty */}
          <label style={s.label}>Specialty</label>
          <div style={{ position: "relative", marginBottom: 0 }}>
            <select
              style={s.select}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {SPECIALTIES.map((sp) => (
                <option key={sp}>{sp}</option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-60%)",
                pointerEvents: "none",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              ▾
            </span>
          </div>

          {/* Visit type */}
          <label style={s.label}>Visit type</label>
          <div style={{ position: "relative" }}>
            <select
              style={s.select}
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
            >
              <option>Telehealth (Video)</option>
              <option>In-person</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-60%)",
                pointerEvents: "none",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              ▾
            </span>
          </div>

          {/* Provider */}
          <label style={s.label}>Select provider</label>
          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              style={s.providerCard(selectedProvider.id === p.id)}
              onClick={() => handleProviderSelect(p)}
            >
              <div style={s.avatar}>{p.initials}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>
                  {p.name}, {p.credentials}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                  {p.role} · {p.rating} ★
                </p>
              </div>
              {selectedProvider.id === p.id && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: BRAND,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          ))}

          {/* Available days */}
          <label style={{ ...s.label, marginTop: 8 }}>Select a date</label>
          {availableDays.length === 0 ? (
            <p style={s.noSlots}>No availability in the next 60 days.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                marginBottom: "1rem",
              }}
            >
              {availableDays.slice(0, 6).map((day, idx) => (
                <div
                  key={idx}
                  style={s.dayBtn(selectedDayIdx === idx)}
                  onClick={() => handleDaySelect(idx)}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: selectedDayIdx === idx ? "#fff" : "#111",
                    }}
                  >
                    {formatDate(day.date)}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: selectedDayIdx === idx ? "rgba(255,255,255,0.75)" : "#aaa",
                      marginTop: 2,
                    }}
                  >
                    {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Time slots */}
          {currentSlots.length > 0 && (
            <>
              <label style={s.label}>Select a time</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  marginBottom: "1rem",
                }}
              >
                {currentSlots.map((slot) => (
                  <div
                    key={slot.time}
                    style={s.timeBtn(selectedTime?.time === slot.time)}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot.label}
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            style={{
              ...s.btnPrimary,
              opacity: canProceedStep1() ? 1 : 0.4,
              cursor: canProceedStep1() ? "pointer" : "not-allowed",
            }}
            onClick={() => canProceedStep1() && setStep(2)}
          >
            Continue to your details →
          </button>
        </div>
      )}

      {/* STEP 2 — Patient details */}
      {step === 2 && (
        <div style={s.card}>
          <StepIndicator current={2} />
          <p style={s.sectionTitle}>Your details</p>
          <p style={s.sectionSub}>We'll send your confirmation here</p>

          <label style={s.label}>Full name *</label>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Amara Okafor"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label style={s.label}>Email address *</label>
          <input
            style={s.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label style={s.label}>
            Phone number{" "}
            <span style={{ color: "#bbb", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            style={s.input}
            type="tel"
            placeholder="+234 800 000 0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <label style={s.label}>
            Reason for visit{" "}
            <span style={{ color: "#bbb", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            style={s.textarea}
            placeholder="Briefly describe what you'd like help with..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <div style={s.notice}>
            🔒 Your information is private and only shared with your provider.
          </div>

          <button
            style={{
              ...s.btnPrimary,
              opacity: canProceedStep2() ? 1 : 0.4,
              cursor: canProceedStep2() ? "pointer" : "not-allowed",
            }}
            onClick={() => canProceedStep2() && setStep(3)}
          >
            Review appointment →
          </button>
          <button style={s.btnSecondary} onClick={() => setStep(1)}>
            ← Back
          </button>
        </div>
      )}

      {/* STEP 3 — Confirm */}
      {step === 3 && (
        <div style={s.card}>
          <StepIndicator current={3} />
          <p style={s.sectionTitle}>Review & confirm</p>
          <p style={s.sectionSub}>Check everything looks correct</p>

          <div style={{ marginBottom: "1.25rem" }}>
            {[
              ["Provider", `${selectedProvider.name}, ${selectedProvider.credentials}`],
              ["Specialty", specialty],
              ["Date", formatDateFull(currentDay.date)],
              ["Time", selectedTime?.label],
              ["Visit type", visitType],
              ["Your name", form.name],
              ["Your email", form.email],
              ...(form.phone ? [["Phone", form.phone]] : []),
              ...(form.reason ? [["Reason", form.reason]] : []),
            ].map(([l, v]) => (
              <div key={l} style={s.confirmRow}>
                <span style={{ color: "#999", flexShrink: 0 }}>{l}</span>
                <span style={{ fontWeight: 600, textAlign: "right", color: "#111" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={s.notice}>
            ✉️ A confirmation email will be sent to you and to your provider after booking.
          </div>

          <button
            style={{ ...s.btnPrimary, opacity: submitting ? 0.6 : 1 }}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Confirming..." : "Confirm appointment"}
          </button>
          <button style={s.btnSecondary} onClick={() => setStep(2)}>
            ← Edit details
          </button>
        </div>
      )}
    </div>
  );
}