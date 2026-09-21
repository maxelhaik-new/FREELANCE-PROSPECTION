import { describe, it, expect, beforeEach } from "vitest";
import {
  supabaseProspectService,
  rowToProspect,
  prospectToRow,
  rowToProfile,
  profileToRow,
  resetMemoryStore,
} from "../../../src/services/supabaseProspectService";
import { resolveUserId, getPersistentUserId } from "../../../src/lib/supabase";
import { Prospect, FreelanceProfile } from "../../../src/types";

describe("Service - supabaseProspectService", () => {
  const TEST_USER_ID = "test_user_abc123";

  const sampleProspect: Prospect = {
    id: "p_101",
    name: "Agence Digitale Lyon",
    activity: "Développement Web",
    location: "Lyon 6",
    address: "12 rue de la République",
    phone: "0472000000",
    website: "https://agence.fr",
    email: "contact@agence.fr",
    rating: 4.8,
    reviewCount: 42,
    notes: "Client potentiel chaud",
    identified: true,
    status: "to_contact",
    relevanceScore: 9,
    keyAngle: "Pas de système de prise de rendez-vous en ligne",
    lat: 45.764,
    lng: 4.835,
    generatedEmail: {
      subject: "Opportunité de digitalisation pour Agence Digitale Lyon",
      body: "Bonjour...",
      generatedAt: "2026-09-20T10:00:00Z",
    },
    emailSentAt: undefined,
  };

  const sampleProfile: FreelanceProfile = {
    title: "Développeur Fullstack & SEO",
    services: "Création de sites, audit Google Maps, optimisation de conversion",
    targetSector: "Artisans & Commerces",
    targetCity: "Lyon",
    portfolioUrl: "https://maxime-portfolio.fr",
    valueProposition: "Moderniser votre visibilité locale pour convertir vos visiteurs en clients.",
    signature: "Maxime - Consultant Digital\n06 00 00 00 00",
  };

  beforeEach(() => {
    resetMemoryStore();
    localStorage.clear();
  });

  describe("Mapping Utilities", () => {
    it("converts Prospect to database row format correctly", () => {
      const row = prospectToRow(sampleProspect, TEST_USER_ID);
      expect(row.id).toBe("p_101");
      expect(row.user_id).toBe(TEST_USER_ID);
      expect(row.name).toBe("Agence Digitale Lyon");
      expect(row.review_count).toBe(42);
      expect(row.relevance_score).toBe(9);
      expect(row.key_angle).toBe("Pas de système de prise de rendez-vous en ligne");
      expect(row.generated_email).toEqual(sampleProspect.generatedEmail);
    });

    it("converts database row format to Prospect correctly", () => {
      const dbRow = {
        id: "p_102",
        name: "Plomberie Express",
        activity: "Plombier",
        location: "Villeurbanne",
        address: null,
        phone: "0600000000",
        website: null,
        email: null,
        rating: "4.5",
        review_count: 15,
        notes: null,
        identified: false,
        status: "contacted",
        relevance_score: 8,
        key_angle: "Sans site internet",
        lat: 45.77,
        lng: 4.88,
        generated_email: null,
        email_sent_at: "2026-09-20T12:00:00Z",
      };

      const prospect = rowToProspect(dbRow);
      expect(prospect.id).toBe("p_102");
      expect(prospect.name).toBe("Plomberie Express");
      expect(prospect.rating).toBe(4.5);
      expect(prospect.reviewCount).toBe(15);
      expect(prospect.status).toBe("contacted");
      expect(prospect.emailSentAt).toBe("2026-09-20T12:00:00Z");
      expect(prospect.address).toBeUndefined();
    });

    it("converts FreelanceProfile to and from row format correctly", () => {
      const row = profileToRow(sampleProfile, TEST_USER_ID);
      expect(row.user_id).toBe(TEST_USER_ID);
      expect(row.target_city).toBe("Lyon");
      expect(row.target_sector).toBe("Artisans & Commerces");
      expect(row.value_proposition).toBe(sampleProfile.valueProposition);

      const profile = rowToProfile(row);
      expect(profile.title).toBe(sampleProfile.title);
      expect(profile.portfolioUrl).toBe(sampleProfile.portfolioUrl);
      expect(profile.signature).toBe(sampleProfile.signature);
    });
  });

  describe("CRUD Operations", () => {
    it("upserts and fetches prospects scoped by user_id", async () => {
      await supabaseProspectService.upsertProspects(TEST_USER_ID, [sampleProspect]);
      const results = await supabaseProspectService.fetchProspects(TEST_USER_ID);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("p_101");
      expect(results[0].name).toBe("Agence Digitale Lyon");

      // Verify user isolation
      const otherUserResults = await supabaseProspectService.fetchProspects("other_user_999");
      expect(otherUserResults).toHaveLength(0);
    });

    it("updates prospect status", async () => {
      await supabaseProspectService.upsertProspects(TEST_USER_ID, [sampleProspect]);
      await supabaseProspectService.updateStatus(TEST_USER_ID, "p_101", "interested");

      const results = await supabaseProspectService.fetchProspects(TEST_USER_ID);
      expect(results[0].status).toBe("interested");
    });

    it("toggles identified status and transitions pipeline status", async () => {
      await supabaseProspectService.upsertProspects(TEST_USER_ID, [sampleProspect]);
      
      // Unlike -> identified: false, status: 'searched'
      await supabaseProspectService.toggleIdentified(TEST_USER_ID, "p_101", false);
      let results = await supabaseProspectService.fetchProspects(TEST_USER_ID);
      expect(results[0].identified).toBe(false);
      expect(results[0].status).toBe("searched");

      // Like -> identified: true, status: 'to_contact'
      await supabaseProspectService.toggleIdentified(TEST_USER_ID, "p_101", true);
      results = await supabaseProspectService.fetchProspects(TEST_USER_ID);
      expect(results[0].identified).toBe(true);
      expect(results[0].status).toBe("to_contact");
    });

    it("updates individual prospect details", async () => {
      await supabaseProspectService.upsertProspects(TEST_USER_ID, [sampleProspect]);
      const updated: Prospect = { ...sampleProspect, notes: "Nouvelle note après appel téléphonique" };
      await supabaseProspectService.updateProspect(TEST_USER_ID, updated);

      const results = await supabaseProspectService.fetchProspects(TEST_USER_ID);
      expect(results[0].notes).toBe("Nouvelle note après appel téléphonique");
    });

    it("deletes a prospect by id", async () => {
      await supabaseProspectService.upsertProspects(TEST_USER_ID, [sampleProspect]);
      await supabaseProspectService.deleteProspect(TEST_USER_ID, "p_101");

      const results = await supabaseProspectService.fetchProspects(TEST_USER_ID);
      expect(results).toHaveLength(0);
    });

    it("saves and retrieves freelance profile", async () => {
      await supabaseProspectService.saveProfile(TEST_USER_ID, sampleProfile);
      const profile = await supabaseProspectService.fetchProfile(TEST_USER_ID);

      expect(profile).not.toBeNull();
      expect(profile?.title).toBe(sampleProfile.title);
      expect(profile?.targetCity).toBe("Lyon");

      // Other user profile is null
      const otherProfile = await supabaseProspectService.fetchProfile("user_unknown");
      expect(otherProfile).toBeNull();
    });
  });

  describe("User ID Resolution", () => {
    it("generates a persistent user id if none stored", () => {
      const id1 = getPersistentUserId();
      expect(id1).toMatch(/^user_/);

      const id2 = getPersistentUserId();
      expect(id1).toBe(id2);
    });

    it("prioritizes authenticated UID when provided", () => {
      const authUid = "firebase_auth_user_987";
      const resolved = resolveUserId(authUid);
      expect(resolved).toBe(authUid);
      expect(localStorage.getItem("app_user_id")).toBe(authUid);
    });
  });
});
