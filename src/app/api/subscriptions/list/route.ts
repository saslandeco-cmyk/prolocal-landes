import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripeServer";

/**
 * GET /api/subscriptions/list?customerId=cus_...
 *
 * Liste les abonnements Stripe d'un client, pour affichage dans le
 * tableau de bord du professionnel (gestion 100% custom, sans passer
 * par le Portail client Stripe).
 */
export async function GET(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 500 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId manquant." }, { status: 400 });
  }

  try {
    // ⚠️ Stripe limite les chemins "expand" à 4 niveaux de profondeur.
    // "data.items.data.price.product" en compte 5 et provoquait une erreur
    // silencieuse (requête rejetée), d'où l'absence totale d'affichage.
    // On se limite donc à "data.items.data.price" (4 niveaux, valide),
    // puis on résout le nom des produits séparément ci-dessous.
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method", "data.items.data.price"],
    });

    // Récupère les noms de produits en une seule passe (déduplication des IDs)
    const productIds = new Set<string>();
    for (const sub of subscriptions.data) {
      for (const li of sub.items.data) {
        const productRef = li.price.product;
        if (typeof productRef === "string") productIds.add(productRef);
      }
    }
    const productNames = new Map<string, string>();
    await Promise.all(
      Array.from(productIds).map(async id => {
        try {
          const product = await stripe.products.retrieve(id);
          if (!product.deleted) productNames.set(id, product.name);
        } catch {
          // Produit introuvable/supprimé : on gardera un nom de repli
        }
      })
    );

    const items = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: (sub as any).current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      items: sub.items.data.map(li => {
        const productRef = li.price.product;
        const productId = typeof productRef === "string" ? productRef : (productRef as any)?.id;
        const productName = typeof productRef === "string"
          ? productNames.get(productRef)
          : (productRef && typeof productRef === "object" && !("deleted" in productRef && productRef.deleted)
              ? (productRef as any).name
              : null);
        return {
          itemId: li.id, // ID de la ligne d'abonnement — nécessaire pour résilier ce produit seul
          productId, // ID de produit Stripe — permet de savoir quelles options sont déjà actives
          name: productName || li.price.nickname || "Produit",
          amount: li.price.unit_amount,
          interval: li.price.recurring?.interval,
        };
      }),
      defaultPaymentMethod: sub.default_payment_method && typeof sub.default_payment_method === "object"
        ? {
            brand: (sub.default_payment_method as any).card?.brand,
            last4: (sub.default_payment_method as any).card?.last4,
          }
        : null,
    }));

    return NextResponse.json({ subscriptions: items });
  } catch (err: any) {
    console.error("[api/subscriptions/list] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de la récupération des abonnements." }, { status: 500 });
  }
}
