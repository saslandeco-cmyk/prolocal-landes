import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/send-registration-confirmation
 *
 * Envoie au professionnel un email confirmant que son inscription a bien
 * été prise en compte, qu'elle sera validée sous 24/48h, et lui rappelant
 * ses identifiants de connexion au tableau de bord (email + mot de passe).
 *
 * ⚠️ Nécessite la variable d'environnement RESEND_API_KEY pour un envoi
 * réel. Sans cette clé, la route répond en "mode démonstration" (aucun
 * envoi réel) — cohérent avec le reste du site (voir /api/invoices/send-xml
 * et /api/auth/send-reset-code). L'inscription n'est jamais bloquée par
 * l'absence de ce service.
 *
 * Body attendu : { email: string, password: string, companyName: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, companyName } = await req.json();
    if (!email || !password || !companyName) {
      return NextResponse.json({ error: "email, password et companyName sont requis." }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      // Mode démonstration : aucun service d'envoi d'email configuré.
      // On ne bloque jamais l'inscription pour autant.
      return NextResponse.json({ sent: false, demo: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: process.env.INVOICE_SENDER_EMAIL || "contact@prolocal-landes.fr",
      to: [email],
      subject: "Votre inscription a bien été prise en compte — Prolocal-Landes",
      text:
`Bonjour,

Nous vous confirmons que l'inscription de "${companyName}" sur Prolocal-Landes a bien été enregistrée.

Votre fiche sera vérifiée et validée par notre équipe sous 24 à 48h. Vous recevrez un email dès qu'elle sera active et visible sur l'annuaire.

Pour rappel, voici vos identifiants de connexion à votre tableau de bord :
- Email de connexion : ${email}
- Mot de passe : ${password}

Vous pouvez dès à présent vous connecter et compléter votre fiche depuis votre tableau de bord.

À bientôt sur Prolocal-Landes !`,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Erreur lors de l'envoi de l'email." }, { status: 500 });
    }

    return NextResponse.json({ sent: true, demo: false });
  } catch (err: any) {
    console.error("[api/auth/send-registration-confirmation] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'envoi de la confirmation." }, { status: 500 });
  }
}
