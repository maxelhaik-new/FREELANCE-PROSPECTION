import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../src/lib/supabase";

async function runLiveSupabaseSmokeTest() {
  console.log("🚀 Lancement du test de fumée (Smoke Test) Supabase Live...");

  const testUserId = `smoke_test_${Date.now()}`;
  const testProspectId = `p_smoke_${Date.now()}`;

  try {
    // 1. Test insertion prospect avec statut initial 'searched'
    console.log("1. Insertion d'un prospect de test avec statut initial 'searched'...");
    const { error: insertErr } = await supabase.from("prospects").insert({
      id: testProspectId,
      user_id: testUserId,
      name: "Boulangerie Test Live",
      activity: "Boulangerie",
      location: "Lyon 1er",
      status: "searched",
      identified: false,
      rating: 4.6,
      review_count: 28,
      key_angle: "Site vitrine inexistant",
    });

    if (insertErr) {
      throw new Error(`Échec insertion prospect: ${insertErr.message}`);
    }
    console.log("   ✅ Prospect inséré avec succès en statut 'searched'.");

    // 2. Test lecture prospect
    console.log("2. Vérification de la lecture du prospect...");
    const { data: fetchProspects, error: fetchErr } = await supabase
      .from("prospects")
      .select("*")
      .eq("user_id", testUserId);

    if (fetchErr || !fetchProspects || fetchProspects.length === 0) {
      throw new Error(`Échec lecture prospect: ${fetchErr?.message || "Aucun résultat"}`);
    }
    if (fetchProspects[0].status !== "searched") {
      throw new Error(`Statut inattendu: attendu 'searched', reçu '${fetchProspects[0].status}'`);
    }
    console.log(`   ✅ Prospect lu avec succès: "${fetchProspects[0].name}" (status: ${fetchProspects[0].status}).`);

    // 3. Test transition Like: 'searched' -> 'to_contact'
    console.log("3. Transition Like vers 'to_contact'...");
    const { error: likeErr } = await supabase
      .from("prospects")
      .update({ status: "to_contact", identified: true, updated_at: new Date().toISOString() })
      .eq("id", testProspectId);

    if (likeErr) {
      throw new Error(`Échec transition vers to_contact: ${likeErr.message}`);
    }
    console.log("   ✅ Transition vers 'to_contact' réussie.");

    // 4. Test mise à jour du statut vers 'contacted'
    console.log("4. Mise à jour du statut du prospect vers 'contacted'...");
    const { error: updateErr } = await supabase
      .from("prospects")
      .update({ status: "contacted", updated_at: new Date().toISOString() })
      .eq("id", testProspectId);

    if (updateErr) {
      throw new Error(`Échec mise à jour statut: ${updateErr.message}`);
    }
    console.log("   ✅ Statut mis à jour vers 'contacted'.");

    // 4. Test insertion profil freelance
    console.log("4. Enregistrement d'un profil freelance de test...");
    const { error: profileErr } = await supabase.from("freelance_profiles").upsert({
      user_id: testUserId,
      title: "Consultant Digital Smoke Test",
      services: "Audit SEO, Sites Web",
      target_sector: "Commerces de bouche",
      target_city: "Lyon",
      value_proposition: "Booster le trafic local",
      signature: "Alexandre - Consultant",
      updated_at: new Date().toISOString(),
    });

    if (profileErr) {
      throw new Error(`Échec sauvegarde profil: ${profileErr.message}`);
    }
    console.log("   ✅ Profil freelance enregistré.");

    // 5. Nettoyage des données de test
    console.log("5. Nettoyage des données de test...");
    await supabase.from("prospects").delete().eq("user_id", testUserId);
    await supabase.from("freelance_profiles").delete().eq("user_id", testUserId);
    console.log("   ✅ Données de test purgées.");

    console.log("\n🎉 TOUS LES TESTS SUPABASE LIVE ONT RÉUSSI (100%).");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ ERREUR LORS DU TEST SUPABASE LIVE:", error.message || error);
    process.exit(1);
  }
}

runLiveSupabaseSmokeTest();
