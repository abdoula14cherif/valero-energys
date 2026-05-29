import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  try {
    const { montant, reseau, numero, pays, user_id } = await req.json()

    if (!montant || montant < 3000) {
      return new Response(JSON.stringify({ success: false, error: "Minimum 3000 FCFA" }), {
        headers: { ...CORS, "Content-Type": "application/json" }
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const ref = "VE_" + user_id.substring(0,8) + "_" + Date.now()

    // Appel SoinaPay
    const SK = "sk_live_fe2094783a948285cec0f530e09982db35521aab0d3313f7"
    let soina_status = "en_attente"
    let soina_ref = ref

    try {
      const sp = await fetch("https://api.soinapay.com/v1/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SK },
        body: JSON.stringify({
          amount: montant,
          currency: "XAF",
          phone: numero,
          network: reseau,
          country: pays,
          reference: ref,
          description: "Recharge Velero Energy"
        })
      })
      const spd = await sp.json()
      if (spd.reference) soina_ref = spd.reference
      if (spd.status) soina_status = spd.status
    } catch(e) {
      // SoinaPay pas accessible → on enregistre quand même en attente
    }

    // Enregistrer transaction en attente
    await supabase.from("transactions").insert({
      user_id,
      type: "depot",
      montant,
      montant_net: montant,
      reseau,
      numero_mobile: numero,
      pays,
      statut: "en_attente",
      reference: soina_ref,
      note: "Dépôt Mobile Money " + reseau + " via SoinaPay"
    })

    return new Response(JSON.stringify({
      success: true,
      message: "Demande envoyée ! En attente de validation par l'administrateur.",
      reference: soina_ref
    }), { headers: { ...CORS, "Content-Type": "application/json" } })

  } catch(e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      headers: { ...CORS, "Content-Type": "application/json" }
    })
  }
})
