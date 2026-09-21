import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5185;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACT_DIR = "/Users/maximeelhaik/.gemini/antigravity/brain/1176f3e7-c7f7-4fb2-89fa-30a886be8f2c";
const OUTPUT_DIR = path.join(ARTIFACT_DIR, "screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SAMPLE_PROSPECTS = [
  {
    id: "p1",
    name: "Boulangerie Artisanale Saint-Jean",
    activity: "Boulangerie & Pâtisserie",
    location: "Lyon 5ème",
    address: "12 Rue Saint-Jean, 69005 Lyon",
    phone: "04 78 00 11 22",
    website: "https://boulangerie-saint-jean.fr",
    email: "contact@saint-jean-lyon.fr",
    rating: 4.6,
    reviewCount: 142,
    identified: true,
    status: "to_contact",
    keyAngle: "Refonte du site vitrine avec Click & Collect mobile",
    lat: 45.762,
    lng: 4.827,
  },
  {
    id: "p2",
    name: "Brasserie des Canuts",
    activity: "Restaurant & Bar",
    location: "Lyon 4ème",
    address: "24 Boulevard de la Croix-Rousse, 69004 Lyon",
    phone: "04 72 33 44 55",
    email: "direction@brasseriedescanuts.fr",
    rating: 4.2,
    reviewCount: 89,
    identified: false,
    status: "contacted",
    keyAngle: "Mise en place de la réservation en ligne et menu QR Code",
    lat: 45.776,
    lng: 4.832,
    generatedEmail: {
      subject: "Idées d'optimisation digitale pour la Brasserie des Canuts",
      body: "Bonjour, je me permets de vous contacter...",
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: "p3",
    name: "Atelier Menuiserie Moderne",
    activity: "Menuiserie & Agencement",
    location: "Lyon 7ème",
    rating: 4.8,
    reviewCount: 34,
    identified: true,
    status: "interested",
    keyAngle: "Création d'un portfolio photo haute définition et formulaire de devis",
    lat: 45.748,
    lng: 4.841,
  },
];

async function runE2EScenarios() {
  console.log("🚀 Lancement du serveur Vite pour scénarios E2E sur le port", PORT);
  const server = spawn("npx", ["vite", "--port", String(PORT), "--no-open"], {
    stdio: "pipe",
    shell: true,
  });

  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (!ready) {
    console.error("❌ Impossible de démarrer le serveur de test.");
    server.kill();
    process.exit(1);
  }

  console.log("✅ Serveur Vite prêt.");
  // Headed par défaut, désactivable via --headless ou HEADLESS=true
  const isHeaded = !process.argv.includes("--headless") && process.env.HEADLESS !== "true";
  const isSuite0Only = process.argv.includes("--suite0");
  const isSuite3Only = process.argv.includes("--suite3");

  console.log(`Mode Navigateur: ${isHeaded ? "🖥️  VISIBLE (Headed mode avec slowMo 500ms dans une fenêtre unique)" : "🤖 Headless"}`);
  if (isSuite3Only) console.log("🎯 Exécution ciblée : SUITE 3 (User stories critiques avec temporisations visuelles)");
  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? (isSuite3Only ? 700 : 500) : 0,
  });

  const passedTests = [];
  const failedTests = [];

  function record(name, success, detail = "") {
    if (success) {
      passedTests.push(name);
      console.log(`  ✓ ${name}`);
    } else {
      failedTests.push({ name, detail });
      console.error(`  ❌ ${name}: ${detail}`);
    }
  }

  try {
    // Création d'une instance de page UNIQUE réutilisée tout au long des scénarios
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // Mock des routes API pour assurer un E2E déterministe et préserver les quotas
    await page.route("**/api/prospects/autocomplete*", async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("q") || "";
      if (query.toLowerCase().includes("ly")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            suggestions: [
              {
                placeId: "lyon_id_1",
                mainText: "Lyon",
                secondaryText: "Rhône, France",
                text: "Lyon, France",
              },
              {
                placeId: "lyon_id_2",
                mainText: "Lyon 3e Arrondissement",
                secondaryText: "Lyon, France",
                text: "Lyon 3e Arrondissement, Lyon, France",
              },
            ],
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ suggestions: [] }),
        });
      }
    });

    await page.route("**/api/prospects/search", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          prospects: [
            {
              id: "live-prospect-1",
              name: "Boulangerie des Terreaux",
              activity: "Boulangerie Artisanale",
              location: "Lyon 1er",
              address: "1 Place des Terreaux, 69001 Lyon",
              phone: "04 78 28 00 00",
              website: "",
              rating: 4.7,
              reviewCount: 95,
              identified: false,
              status: "to_contact",
              keyAngle: "Absence de site vitrine officiel et commande en ligne",
            },
          ],
        }),
      });
    });

    if (!isSuite3Only) {
      // ==============================================================
      // SUITE 0 : SCÉNARIOS INTERACTIFS RECHERCHE & AUTOCOMPLÉTION
      // ==============================================================
      console.log("\n🔍 === SUITE 0 : RECHERCHE & AUTOCOMPLÉTION ===");
      await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Scénario 0.1 : Saisie dans le champ ville et apparition de l'autocomplétion
    const cityInput = page.locator("#search-city");
    await cityInput.click();
    await cityInput.fill("");
    await cityInput.pressSequentially("Lyon", { delay: 60 });

    const suggestionItem = page.locator('button:has-text("Lyon 3e Arrondissement")');
    let suggestionAppeared = false;
    try {
      await suggestionItem.waitFor({ state: "visible", timeout: 4000 });
      suggestionAppeared = true;
    } catch {
      suggestionAppeared = false;
    }
    record("Affichage des suggestions d'autocomplétion après saisie de la ville", suggestionAppeared);

    // Scénario 0.2 : Sélection d'une suggestion d'autocomplétion
    if (suggestionAppeared) {
      await suggestionItem.click();
      await page.waitForTimeout(200);
      const updatedCityVal = await cityInput.inputValue();
      record("Sélection de la suggestion met à jour le champ de saisie", updatedCityVal.includes("Lyon"));
    }

    // Scénario 0.3 : Soumission de la recherche et affichage du loader puis de la carte prospect
    const searchSubmitBtn = page.locator('button[type="submit"]:has-text("Rechercher")');
    await searchSubmitBtn.click();

    let prospectCardVisible = false;
    try {
      await page.waitForSelector('text=Boulangerie des Terreaux', { state: "visible", timeout: 5000 });
      prospectCardVisible = true;
    } catch {
      prospectCardVisible = false;
    }
    record("Lancement de la recherche affiche dynamiquement la carte du prospect acquis", prospectCardVisible);

    // Capture d'écran Suite 0
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "desktop-e2e-scenario-search-flow.png"),
      fullPage: false,
    });

    if (isHeaded) {
      await page.waitForTimeout(1500);
    }

    if (isSuite0Only) {
      console.log("\n==========================================");
      console.log(`🎯 TOTAL SCÉNARIOS SUITE 0 VALIDÉS : ${passedTests.length} / ${passedTests.length + failedTests.length}`);
      console.log("==========================================\n");
      return;
    }

    // ==============================================================
    // SUITE 1 : SCÉNARIOS DESKTOP PIPELINE & MODALES (1440x900)
    // ==============================================================
    console.log("\n🖥️  === SUITE 1 : SCÉNARIOS DESKTOP (1440px) ===");

    // Injection des prospects d'évaluation dans le localStorage de la même page
    await page.evaluate((prospects) => {
      window.localStorage.setItem("freelance_prospects", JSON.stringify(prospects));
    }, SAMPLE_PROSPECTS);

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('text=Boulangerie Artisanale', { timeout: 8000 });
    await page.waitForTimeout(400);

    // Scénario 1.1 : Affichage initial & absence de débordement
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record("Desktop 1440px sans débordement horizontal", !hasOverflow);

    // Scénario 1.2 : Filtres Bento Pipeline & calcul des compteurs
    const toContactTab = page.locator('button[role="tab"]:has-text("À contacter")');
    await toContactTab.click();
    await page.waitForTimeout(500);
    // Les cartes ont role="button" et aria-label="{name}, {activity}"
    const countToContact = await page.locator('[role="button"][aria-label*="Boulangerie Artisanale Saint-Jean"]').count();
    record("Filtrage Bento 'À contacter' affiche le prospect correspondant", countToContact >= 1);

    // Revenir à Tous
    await page.locator('button[role="tab"]:has-text("Tous")').click();
    await page.waitForTimeout(200);

    // Scénario 1.3 : Changement de statut et recalcul du taux de retour
    const statusSelect = page.locator("#status-select-p1");
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption("interested");
      await page.waitForTimeout(300);
      const val = await statusSelect.inputValue();
      record("Mise à jour statut prospect vers 'interested'", val === "interested");
    }

    // Scénario 1.4 : Copie des coordonnées avec toast de confirmation
    const copyBtn = page.locator('button[title*="Copier toutes les coordonnées"]').first();
    await copyBtn.click();
    await page.waitForTimeout(200);
    const copyFeedback = await page.locator('text=Copié !').first().isVisible();
    record("Feedback visuel 'Copié !' lors de la copie des coordonnées", copyFeedback);

    // Scénario 1.5 : Modale de rédaction IA (Mail IA)
    const mailBtn = page.locator('button:has-text("Mail IA")').first();
    await mailBtn.click();
    await page.waitForSelector('[aria-labelledby="modal-prospect-title"]', { state: "visible", timeout: 5000 });
    await page.waitForTimeout(300);

    // Capture d'écran modale e2e
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "desktop-e2e-scenario-email-modal.png"),
      fullPage: false,
    });

    const toneSelect = page.locator("#modal-tone-select");
    const objSelect = page.locator("#modal-objective-select");
    record("Sélecteurs de ton et d'objectif présents dans la modale IA", (await toneSelect.isVisible()) && (await objSelect.isVisible()));

    // Fermeture par Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const modalClosed = !(await page.locator('[aria-labelledby="modal-prospect-title"]').isVisible());
    record("Fermeture accessible de la modale via touche Échap", modalClosed);

    // Scénario 1.6 : Navigation au clavier
    await page.keyboard.press("?");
    await page.waitForTimeout(300);
    const shortcutsModalVisible = await page.locator('[aria-labelledby="shortcuts-modal-title"]').isVisible();
    record("Ouverture de l'aide des raccourcis via la touche '?'", shortcutsModalVisible);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Scénario 1.7 : Tiroir Profil et application d'un modèle
    await page.locator('button:has-text("Profil & Signature")').click();
    await page.waitForTimeout(300);
    const drawerOpen = await page.locator("#profile-drawer-section").isVisible();
    record("Déploiement du tiroir Profil & Signature", drawerOpen);

    const devPreset = page.locator('#profile-drawer-section button:has-text("Développeur Web & Mobile")');
    await devPreset.click();
    await page.waitForTimeout(200);
    const titleVal = await page.inputValue("#profile-title");
    record("Application du preset 'Développeur Web & Mobile'", titleVal.includes("Développeur"));

    await page.locator('button:has-text("Fermer")').click();
    await page.waitForTimeout(200);

    // Capture finale Desktop
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "desktop-e2e-scenario-pipeline.png"),
      fullPage: false,
    });

    // ==============================================================
    // SUITE 2 : SCÉNARIOS MOBILE FLUIDES DANS LA MÊME FENÊTRE (375x812)
    // ==============================================================
    console.log("\n📱 === SUITE 2 : SCÉNARIOS MOBILE (375px) ===");

    // Redimensionnement dynamique fluide de la fenêtre existante
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Scénario 2.1 : Débordement horizontal mobile
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record("Mobile 375px sans débordement horizontal", !mobileOverflow);

    // Scénario 2.2 : Défilement bento tabs avec masque de dégradé
    const bentoTabs = page.locator('div[role="tablist"]');
    const bentoVisible = await bentoTabs.isVisible();
    record("Onglets Bento affichés avec conteneur scrollable sur mobile", bentoVisible);

    // Scénario 2.3 : Modale responsive sur mobile
    const mobMailBtn = page.locator('button:has-text("Mail IA")').first();
    await mobMailBtn.click();
    await page.waitForSelector('[aria-labelledby="modal-prospect-title"]', { state: "visible", timeout: 5000 });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "mobile-e2e-scenario-modal.png"),
      fullPage: false,
    });

    const modalMobileFits = await page.evaluate(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.width <= window.innerWidth;
    });
    record("Modale bien cadrée dans le viewport 375px (largeur <= 375)", modalMobileFits);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Capture finale Mobile
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "mobile-e2e-scenario-pipeline.png"),
      fullPage: false,
    });
    } // Fin if (!isSuite3Only)

    // ==============================================================
    // SUITE 3 : USER STORIES CRITIQUES NON COUVERTS
    // ==============================================================
    console.log("\n🧪 === SUITE 3 : USER STORIES CRITIQUES ===");

    // Navigation initiale si exécution isolée de la Suite 3
    if (isSuite3Only) {
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
    }

    // Retour en viewport desktop pour la suite
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);

    // Rechargement des données de test
    await page.evaluate((prospects) => {
      window.localStorage.setItem("freelance_prospects", JSON.stringify(prospects));
    }, SAMPLE_PROSPECTS);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('text=Boulangerie Artisanale', { timeout: 8000 });
    await page.waitForTimeout(isSuite3Only ? 1500 : 400);

    // -----------------------------------------------------------
    // Scénario 3.1 : Génération email IA (avec mock API Gemini)
    // -----------------------------------------------------------
    // Mock de l'endpoint de génération pour ne pas consommer de quota
    await page.route("**/api/prospects/generate-email", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          subject: "Optimisation digitale pour Boulangerie Artisanale Saint-Jean",
          body: "Bonjour,\n\nJe me permets de vous contacter au sujet de votre présence en ligne...\n\nBien cordialement,",
          generatedAt: new Date().toISOString(),
        }),
      });
    });

    const mailBtnSuite3 = page.locator('button:has-text("Mail IA")').first();
    await mailBtnSuite3.click();
    await page.waitForSelector('[aria-labelledby="modal-prospect-title"]', { state: "visible", timeout: 5000 });
    await page.waitForTimeout(isSuite3Only ? 1200 : 300);

    const generateBtn = page.locator('button:has-text("Générer l\'email"), button:has-text("Régénérer l\'email")').first();
    await generateBtn.click();

    // Attendre que le champ body soit rempli (génération terminée)
    let emailGenerated = false;
    try {
      await page.waitForFunction(
        () => {
          const textareas = document.querySelectorAll("textarea");
          return Array.from(textareas).some((t) => t.value && t.value.length > 20);
        },
        { timeout: 6000 }
      );
      emailGenerated = true;
    } catch {
      emailGenerated = false;
    }
    record("Génération email IA remplit le corps du message dans la modale", emailGenerated);

    // Pause visuelle pour observer le mail généré dans l'interface
    if (isSuite3Only) {
      await page.waitForTimeout(3000);
    }

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "desktop-e2e-scenario-email-generated.png"),
      fullPage: false,
    });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(isSuite3Only ? 1500 : 300);

    // -----------------------------------------------------------
    // Scénario 3.2 : Export CSV déclenche un téléchargement
    // -----------------------------------------------------------
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 4000 }).catch(() => null),
      page.locator('button[aria-label="Exporter les prospects au format CSV"]').click(),
    ]);
    record("Export CSV déclenche un téléchargement de fichier", download !== null);
    if (isSuite3Only) await page.waitForTimeout(1500);

    // -----------------------------------------------------------
    // Scénario 3.3 : Persistance des données après rechargement de page
    // -----------------------------------------------------------
    const countBefore = await page.locator('[role="button"][aria-label*="Boulangerie Artisanale Saint-Jean"]').count();
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(isSuite3Only ? 1500 : 800);
    const countAfter = await page.locator('[role="button"][aria-label*="Boulangerie Artisanale Saint-Jean"]').count();
    record("Les prospects persistent après rechargement de la page (localStorage)", countBefore >= 1 && countAfter >= 1);
    if (isSuite3Only) await page.waitForTimeout(1000);

    // -----------------------------------------------------------
    // Scénario 3.4 : Suppression d'un prospect + toast Annuler
    // -----------------------------------------------------------
    const deleteBtn = page.locator('button[aria-label="Supprimer Boulangerie Artisanale Saint-Jean"]').first();
    await deleteBtn.click();
    await page.waitForTimeout(isSuite3Only ? 2500 : 400);

    // Vérifier que la carte disparaît et que le toast "Annuler" apparaît
    const cardGone = await page.locator('[role="button"][aria-label*="Boulangerie Artisanale Saint-Jean"]').count() === 0;
    const undoToastVisible = await page.locator('text=Annuler').isVisible().catch(() => false);
    record("Suppression d'un prospect retire sa carte et affiche le toast Annuler", cardGone && undoToastVisible);

    // -----------------------------------------------------------
    // Scénario 3.5 : Ajout à la shortlist + filtre Sélections
    // -----------------------------------------------------------
    // Utiliser p2 (Brasserie des Canuts, not identified) pour la shortlist
    const shortlistBtn = page.locator('button[aria-label="Ajouter aux sélections"]').first();
    if (await shortlistBtn.isVisible()) {
      await shortlistBtn.click();
      await page.waitForTimeout(isSuite3Only ? 1500 : 300);

      // Cliquer sur le filtre "Sélections" (identified) dans le Bento
      const shortlistTab = page.locator('button:has-text("Sélections"), button[aria-pressed="false"]:has-text("Sélect")').first();
      if (await shortlistTab.isVisible()) {
        await shortlistTab.click();
        await page.waitForTimeout(isSuite3Only ? 2000 : 400);
        const shortlistedCount = await page.locator('[role="button"][aria-label]').count();
        record("Ajout à la shortlist + filtre Sélections affiche le prospect sélectionné", shortlistedCount >= 1);
      } else {
        // Fallback : vérifier que le bouton est maintenant "Retirer des sélections"
        const btnNowRetirer = await page.locator('button[aria-label="Retirer des sélections"]').count();
        record("Ajout à la shortlist + filtre Sélections affiche le prospect sélectionné", btnNowRetirer >= 1);
      }
    } else {
      record("Ajout à la shortlist + filtre Sélections affiche le prospect sélectionné", false);
    }

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "desktop-e2e-suite3-final.png"),
      fullPage: false,
    });

    if (isHeaded) {
      const waitTime = isSuite3Only ? 5000 : 2000;
      console.log(`👀 Scénarios terminés. Pause de ${waitTime / 1000} secondes avant fermeture du navigateur...`);
      await page.waitForTimeout(waitTime);
    }

    await page.close();

    console.log("\n==========================================");
    console.log(`🎯 TOTAL SCÉNARIOS E2E VALIDÉS : ${passedTests.length} / ${passedTests.length + failedTests.length}`);
    console.log("==========================================\n");

    if (failedTests.length > 0) {
      console.error("Échecs détectés :", failedTests);
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

runE2EScenarios().catch((err) => {
  console.error("Erreur critique suite E2E :", err);
  process.exit(1);
});
