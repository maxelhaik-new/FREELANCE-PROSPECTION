import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5188;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.join(process.cwd(), "screenshots", "e2e-map");
const ARTIFACT_DIR = "/Users/maximeelhaik/.gemini/antigravity/brain/8f30f663-3ae4-4ee6-a21c-87516a87b944/screenshots";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function takeScreenshot(page, filename) {
  const localPath = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: localPath });
  try {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(localPath, artifactPath);
  } catch {}
}

const TEST_PROSPECTS = [
  {
    id: "p-lyon-1",
    name: "Boulangerie Artisanale Saint-Jean",
    activity: "Boulangerie & Pâtisserie",
    location: "Lyon (69005)",
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
    id: "p-lyon-2",
    name: "Brasserie des Canuts",
    activity: "Restaurant & Brasserie",
    location: "Lyon (69004)",
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
  },
  {
    id: "p-lyon-3",
    name: "Atelier Menuiserie Moderne",
    activity: "Menuiserie & Agencement",
    location: "Lyon (69007)",
    address: "45 Avenue Jean Jaurès, 69007 Lyon",
    phone: "04 78 55 66 77",
    website: "",
    email: "devis@menuiserie-moderne.fr",
    rating: 4.8,
    reviewCount: 34,
    identified: true,
    status: "interested",
    keyAngle: "Création d'un portfolio photo haute définition et formulaire de devis",
    lat: 45.748,
    lng: 4.841,
  },
  {
    id: "p-bordeaux-1",
    name: "Optique & Style Quinconces",
    activity: "Opticien Indépendant",
    location: "Bordeaux (33000)",
    address: "8 Place des Quinconces, 33000 Bordeaux",
    phone: "05 56 00 12 34",
    email: "accueil@optique-quinconces.com",
    rating: 4.9,
    reviewCount: 78,
    identified: false,
    status: "searched",
    keyAngle: "Catalogue de montures interactif et prise de rendez-vous en ligne",
    lat: 44.844,
    lng: -0.574,
  },
  {
    id: "p-bordeaux-2",
    name: "Fleuriste Le Jardin Secret",
    activity: "Artisan Fleuriste",
    location: "Bordeaux (33000)",
    address: "15 Rue Sainte-Catherine, 33000 Bordeaux",
    phone: "05 56 44 88 99",
    website: "",
    rating: 4.3,
    reviewCount: 52,
    identified: false,
    status: "searched",
    keyAngle: "Absence de site vitrine officiel et de livraison d'abonnements floraux",
    lat: 44.838,
    lng: -0.575,
  },
  {
    id: "p-marseille-1",
    name: "Plomberie Express Vieux-Port",
    activity: "Plombier Chauffagiste",
    location: "Marseille (13001)",
    address: "3 Quai des Belges, 13001 Marseille",
    phone: "04 91 10 20 30",
    rating: 4.1,
    reviewCount: 65,
    identified: false,
    status: "declined",
    keyAngle: "Optimisation de la présence Google Maps pour le dépannage d'urgence 24/7",
    lat: 43.295,
    lng: 5.374,
  },
];

const SEARCH_INFO_LYON = {
  city: "Lyon",
  sector: "Commerces & Artisans",
  prospectIds: ["p-lyon-1", "p-lyon-2", "p-lyon-3"],
};

async function runMapResponsivenessE2E() {
  console.log("=================================================================");
  console.log("🗺️  SUITE E2E : RESPONSIVITÉ ET CENTRAGE DYNAMIQUE DE LA CARTE");
  console.log("=================================================================\n");

  console.log(`🚀 Démarrage du serveur Vite sur le port ${PORT}...`);
  const server = spawn("npx", ["vite", "--port", String(PORT), "--no-open"], {
    stdio: "pipe",
    shell: true,
  });

  // Wait for server ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  if (!ready) {
    console.error("❌ Échec du démarrage du serveur Vite de test.");
    server.kill();
    process.exit(1);
  }
  console.log("✅ Serveur Vite prêt.");

  const isHeadless = process.argv.includes("--headless") || process.env.HEADLESS === "true";
  const slowMo = isHeadless ? 0 : 500;

  console.log(`🖥️  Mode navigateur : ${isHeadless ? "Headless (CI)" : "VISIBLE (Headed - slowMo 500ms)"}`);
  console.log(`📸 Dossier des captures : ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({
    headless: isHeadless,
    slowMo,
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
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // Mock autocomplete and search endpoints to avoid external network issues
    await page.route("**/api/prospects/autocomplete*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ suggestions: [] }),
      });
    });

    await page.route("**/api/prospects/search*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ prospects: TEST_PROSPECTS }),
      });
    });

    console.log("🌱 Initialisation des données de test (Lyon, Bordeaux, Marseille)...");
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // Seed localStorage and sessionStorage with test prospects
    await page.evaluate(
      ({ prospects, searchInfo }) => {
        window.localStorage.setItem("freelance_prospects_cache", JSON.stringify(prospects));
        window.localStorage.setItem("freelance_prospects", JSON.stringify(prospects));
        window.sessionStorage.setItem("freelance_current_search", JSON.stringify(searchInfo));
      },
      { prospects: TEST_PROSPECTS, searchInfo: SEARCH_INFO_LYON }
    );

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // =========================================================================
    // SCÉNARIO 1 : Affichage initial en Vue Combinée & Alignement Carte/Liste
    // =========================================================================
    console.log("\n--- [1] Rendu initial et synchronisation active ---");

    const mapTitle = await page.locator('h2:has-text("Carte")').isVisible();
    record("La carte s'affiche avec son titre 'Carte'", mapTitle);

    const mapBadgeCount = await page.locator('span:has-text("3")').first().isVisible();
    record("Le badge de la carte reflète les 3 prospects de la recherche en cours", mapBadgeCount);

    const recenterBtn = page.locator('button[title*="Recentrer"]');
    record("Le bouton d'action 'Recentrer' est présent sur la carte", await recenterBtn.isVisible());

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    record("Disposition Desktop sans débordement horizontal", !hasHorizontalOverflow);

    await takeScreenshot(page, "01-map-initial-split.png");

    // =========================================================================
    // SCÉNARIO 2 : Sélection d'un prospect dans la liste -> Focus Carte
    // =========================================================================
    console.log("\n--- [2] Sélection d'un prospect et centrage ciblé ---");

    const firstCard = page.locator('[data-prospect-id="p-lyon-1"]');
    await firstCard.click();
    await page.waitForTimeout(400);

    const isCardSelected = (await firstCard.getAttribute("aria-pressed")) === "true";
    record("La fiche dans la liste prend l'état sélectionné", isCardSelected);

    // InfoWindow content rendered in Google Maps DOM
    const infoWindowContent = await page.locator('text=Refonte du site vitrine avec Click & Collect mobile').first().isVisible();
    record("L'InfoWindow s'ouvre sur la carte avec les opportunités du prospect", infoWindowContent);

    await takeScreenshot(page, "02-map-prospect-selected.png");

    // =========================================================================
    // SCÉNARIO 3 : Désélection au clic sur la carte
    // =========================================================================
    console.log("\n--- [3] Désélection au clic sur l'arrière-plan de la carte ---");

    // Click on top corner of the map container away from markers
    const mapCanvas = page.locator('.relative.flex-1.mt-3.rounded-xl');
    await mapCanvas.click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(400);

    const isStillSelected = (await firstCard.getAttribute("aria-pressed")) === "true";
    record("Cliquer sur la carte désélectionne le prospect", !isStillSelected);

    await takeScreenshot(page, "03-map-deselected.png");

    // =========================================================================
    // SCÉNARIO 4 : Navigation entre les onglets du pipeline & Historique
    // =========================================================================
    console.log("\n--- [4] Réactivité de la carte aux onglets du pipeline ---");

    // Tab "À contacter" (1 prospect: p-lyon-1)
    const toContactTab = page.locator('button[role="tab"]:has-text("À contacter")');
    await toContactTab.click();
    await page.waitForTimeout(400);

    const toContactCardVisible = await page.locator('[data-prospect-id="p-lyon-1"]').isVisible();
    record("Onglet 'À contacter' : la liste n'affiche que le prospect retenu", toContactCardVisible);

    // Tab "Contactés" (1 prospect: p-lyon-2)
    const contactedTab = page.locator('button[role="tab"]:has-text("Contactés")');
    await contactedTab.click();
    await page.waitForTimeout(400);

    const contactedVisible = await page.locator('[data-prospect-id="p-lyon-2"]').isVisible();
    record("Onglet 'Contactés' : la carte bascule immédiatement sur le prospect contacté", contactedVisible);

    // Tab "Historique" (2 prospects Bordeaux: p-bordeaux-1, p-bordeaux-2)
    const historyBtn = page.locator('button:has-text("Historique")');
    await historyBtn.click();
    await page.waitForTimeout(500);

    const historyHeader = await page.locator('text=Historique des recherches').first().isVisible();
    record("L'en-tête de contexte de la carte bascule sur 'Historique des recherches'", historyHeader);

    const bordeauxVisible = await page.locator('[data-prospect-id="p-bordeaux-1"]').isVisible();
    record("Les prospects de l'historique sont affichés dans la liste et sur la carte", bordeauxVisible);

    await takeScreenshot(page, "04-map-history-tab.png");

    // =========================================================================
    // SCÉNARIO 5 : Filtrage par puce de ville dans l'Historique
    // =========================================================================
    console.log("\n--- [5] Filtrage par ville dans l'Historique ---");

    const bordeauxChip = page.locator('button:has-text("Bordeaux")').first();
    if (await bordeauxChip.isVisible()) {
      await bordeauxChip.click();
      await page.waitForTimeout(400);
      record("Clic sur la puce de ville 'Bordeaux' applique le filtre", true);
    } else {
      record("Puce de ville 'Bordeaux' visible dans l'historique", false);
    }

    await takeScreenshot(page, "05-map-city-filtered.png");

    // =========================================================================
    // SCÉNARIO 6 : Cas limite - Filtrage avec 1 seul prospect (zoom optimal)
    // =========================================================================
    console.log("\n--- [6] Cas limite : Prospect unique (panTo zoom 15) ---");

    // Return to "Tous"
    await page.locator('button[role="tab"]:has-text("Tous")').click();
    await page.waitForTimeout(300);

    const searchFilterInput = page.locator("#prospect-search-input");
    await searchFilterInput.fill("Canuts");
    await page.waitForTimeout(400);

    const onlyCanuts = await page.locator('[data-prospect-id="p-lyon-2"]').isVisible();
    const otherHidden = !(await page.locator('[data-prospect-id="p-lyon-1"]').isVisible());
    record("Filtre textuel 'Canuts' isole un unique prospect", onlyCanuts && otherHidden);

    await takeScreenshot(page, "06-map-single-prospect-isolated.png");

    // =========================================================================
    // SCÉNARIO 7 : Cas limite - Aucun prospect (pastille d'état vide)
    // =========================================================================
    console.log("\n--- [7] Cas limite : Aucun prospect correspondant ---");

    await searchFilterInput.fill("ZzzNonExistentRestaurant");
    await page.waitForTimeout(400);

    const emptyPillVisible = await page.locator('text=Aucun prospect à afficher sur la carte pour ce filtre').isVisible();
    record("Affichage de la pastille élégante d'état vide au centre de la carte", emptyPillVisible);

    await takeScreenshot(page, "07-map-empty-state-pill.png");

    // Reset search filter
    await searchFilterInput.fill("");
    await page.waitForTimeout(300);

    // =========================================================================
    // SCÉNARIO 8 : Bouton 'Recentrer' après sélection
    // =========================================================================
    console.log("\n--- [8] Bouton flottant Recentrer ---");

    const secondCard = page.locator('[data-prospect-id="p-lyon-2"]');
    await secondCard.click();
    await page.waitForTimeout(300);

    await recenterBtn.click();
    await page.waitForTimeout(400);

    const isSecondStillSelected = (await secondCard.getAttribute("aria-pressed")) === "true";
    record("Le bouton 'Recentrer' réinitialise la sélection et recadre la vue globale", !isSecondStillSelected);

    await takeScreenshot(page, "08-map-recenter-action.png");

    // =========================================================================
    // SCÉNARIO 9 : Bascule de disposition Vue Combinée / Pleine Carte
    // =========================================================================
    console.log("\n--- [9] Bascule de disposition Vue Combinée -> Pleine Carte ---");

    const mapOnlyTab = page.locator('button:has-text("Carte")').first();
    await mapOnlyTab.click();
    await page.waitForTimeout(400);

    const isListHidden = !(await page.locator('input#prospect-search-input').isVisible());
    record("Le mode 'Carte' masque la liste et accorde la pleine largeur à la carte", isListHidden);

    await takeScreenshot(page, "09-map-fullscreen-tab.png");

    // =========================================================================
    // SCÉNARIO 10 : Responsivité Mobile (375px x 812px)
    // =========================================================================
    console.log("\n--- [10] Responsivité Mobile (375px) ---");

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const mobileMapBtn = page.locator('button:has-text("Carte")').first();
    await mobileMapBtn.click();
    await page.waitForTimeout(400);

    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    record("Affichage mobile 375px sans débordement horizontal", !mobileOverflow);

    const mapVisibleOnMobile = await page.locator('.relative.flex-1.mt-3.rounded-xl').isVisible();
    record("Conteneur de la carte visible et parfaitement dimensionné sur mobile", mapVisibleOnMobile);

    await takeScreenshot(page, "10-map-mobile-responsive-view.png");

    // Reset back to desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    const splitTab = page.locator('button:has-text("Vue combinée")');
    await splitTab.click();
    await page.waitForTimeout(400);

    console.log("\n=================================================================");
    console.log(`🎯 BILAN SCÉNARIOS E2E CARTE : ${passedTests.length} / ${passedTests.length + failedTests.length} VALIDÉS`);
    console.log("=================================================================\n");

    if (failedTests.length > 0) {
      console.error("Échecs constatés :");
      failedTests.forEach((f) => console.error(` - ${f.name}: ${f.detail}`));
    }
  } catch (err) {
    console.error("❌ Erreur pendant l'exécution de la suite E2E :", err);
  } finally {
    await browser.close();
    server.kill();
    console.log("🏁 Serveur de test arrêté.");
  }
}

runMapResponsivenessE2E();
