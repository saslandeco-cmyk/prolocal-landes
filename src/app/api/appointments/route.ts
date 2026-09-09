import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/appointments
 * Body: { type: "new" | "reminder", appointment: Appointment }
 *
 * En production, remplacez les console.log par un vrai envoi email
 * via Resend (https://resend.com) ou Nodemailer :
 *
 * import { Resend } from "resend";
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * await resend.emails.send({ from, to, subject, html });
 */

interface AppointmentPayload {
  type: "new" | "reminder" | "cancelled";
  appointment: {
    id: string;
    professionalId: string;
    professionalName: string;
    professionalEmail: string;
    visitorName: string;
    visitorEmail: string;
    visitorPhone?: string;
    visitorMessage?: string;
    date: string;
    time: string;
    duration: number;
    status: string;
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: AppointmentPayload = await req.json();
    const { type, appointment: appt } = body;

    if (!appt || !type) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const dateLabel = formatDate(appt.date);

    if (type === "new") {
      // ── Email au professionnel ──
      const proSubject = `📅 Nouveau rendez-vous — ${appt.visitorName} le ${dateLabel} à ${appt.time}`;
      const proBody = `
        <h2>Nouveau rendez-vous sur Prolocal-Landes</h2>
        <p>Bonjour ${appt.professionalName},</p>
        <p>Un visiteur vient de prendre rendez-vous sur votre fiche Prolocal-Landes.</p>
        <table>
          <tr><td><strong>Date</strong></td><td>${dateLabel}</td></tr>
          <tr><td><strong>Heure</strong></td><td>${appt.time}</td></tr>
          <tr><td><strong>Durée</strong></td><td>${appt.duration} minutes</td></tr>
          <tr><td><strong>Nom</strong></td><td>${appt.visitorName}</td></tr>
          <tr><td><strong>Email</strong></td><td>${appt.visitorEmail}</td></tr>
          ${appt.visitorPhone ? `<tr><td><strong>Téléphone</strong></td><td>${appt.visitorPhone}</td></tr>` : ""}
          ${appt.visitorMessage ? `<tr><td><strong>Message</strong></td><td>${appt.visitorMessage}</td></tr>` : ""}
        </table>
        <p>Connectez-vous à votre <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard">tableau de bord</a> pour gérer vos rendez-vous.</p>
        <p>— L'équipe Prolocal-Landes</p>
      `;

      // ── Email au visiteur ──
      const visitorSubject = `✅ Confirmation de votre rendez-vous chez ${appt.professionalName}`;
      const visitorBody = `
        <h2>Votre rendez-vous est confirmé !</h2>
        <p>Bonjour ${appt.visitorName},</p>
        <p>Votre demande de rendez-vous a bien été enregistrée.</p>
        <table>
          <tr><td><strong>Professionnel</strong></td><td>${appt.professionalName}</td></tr>
          <tr><td><strong>Date</strong></td><td>${dateLabel}</td></tr>
          <tr><td><strong>Heure</strong></td><td>${appt.time}</td></tr>
          <tr><td><strong>Durée</strong></td><td>${appt.duration} minutes</td></tr>
        </table>
        <p>Vous recevrez un rappel par email 24h avant votre rendez-vous.</p>
        <p>— L'équipe Prolocal-Landes</p>
      `;

      // TODO en production : envoyer les emails via Resend / Nodemailer
      console.log("📧 [EMAIL PRO]", appt.professionalEmail, proSubject);
      console.log("📧 [EMAIL VISITEUR]", appt.visitorEmail, visitorSubject);
      // Simulation de l'email body pour les logs dev
      console.log(proBody);
      console.log(visitorBody);

    } else if (type === "reminder") {
      // ── Rappel 24h avant au visiteur ──
      const subject = `⏰ Rappel — Votre rendez-vous demain chez ${appt.professionalName} à ${appt.time}`;
      const body = `
        <h2>Rappel de rendez-vous</h2>
        <p>Bonjour ${appt.visitorName},</p>
        <p>Nous vous rappelons votre rendez-vous de demain :</p>
        <table>
          <tr><td><strong>Professionnel</strong></td><td>${appt.professionalName}</td></tr>
          <tr><td><strong>Date</strong></td><td>${dateLabel}</td></tr>
          <tr><td><strong>Heure</strong></td><td>${appt.time}</td></tr>
          <tr><td><strong>Durée</strong></td><td>${appt.duration} minutes</td></tr>
        </table>
        <p>— L'équipe Prolocal-Landes</p>
      `;
      console.log("📧 [RAPPEL VISITEUR]", appt.visitorEmail, subject);
      console.log(body);

    } else if (type === "cancelled") {
      // ── Annulation ──
      const subject = `❌ Rendez-vous annulé — ${appt.professionalName} le ${dateLabel}`;
      console.log("📧 [ANNULATION]", appt.visitorEmail, subject);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Appointments API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
