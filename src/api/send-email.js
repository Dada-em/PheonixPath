// api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    patient_name, patient_email, patient_phone,
    provider_name, appointment_date, appointment_time,
    visit_type, specialty, reason, nurse_email
  } = req.body;

  try {
    // Email to patient
    await resend.emails.send({
      from: 'Phoenixpath <bookings@yourdomain.com>',
      to: patient_email,
      subject: 'Your appointment is confirmed',
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Hi ${patient_name}, your appointment has been booked.</p>
        <table>
          <tr><td><b>Provider</b></td><td>${provider_name}</td></tr>
          <tr><td><b>Date</b></td><td>${appointment_date}</td></tr>
          <tr><td><b>Time</b></td><td>${appointment_time}</td></tr>
          <tr><td><b>Visit type</b></td><td>${visit_type}</td></tr>
        </table>
        <p>If you need to cancel or reschedule, please contact us.</p>
      `,
    });

    // Email to nurse
    await resend.emails.send({
      from: 'Phoenixpath Bookings <bookings@yourdomain.com>',
      to: nurse_email,
      subject: `New appointment — ${patient_name}`,
      html: `
        <h2>New Appointment Booked</h2>
        <table>
          <tr><td><b>Patient</b></td><td>${patient_name}</td></tr>
          <tr><td><b>Email</b></td><td>${patient_email}</td></tr>
          <tr><td><b>Phone</b></td><td>${patient_phone || 'Not provided'}</td></tr>
          <tr><td><b>Date</b></td><td>${appointment_date}</td></tr>
          <tr><td><b>Time</b></td><td>${appointment_time}</td></tr>
          <tr><td><b>Visit type</b></td><td>${visit_type}</td></tr>
          <tr><td><b>Specialty</b></td><td>${specialty}</td></tr>
          <tr><td><b>Reason</b></td><td>${reason || 'Not specified'}</td></tr>
        </table>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}