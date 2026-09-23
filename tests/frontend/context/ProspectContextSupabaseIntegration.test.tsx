import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import React from "react";
import { ProspectProvider, useProspects } from "../../../src/context/ProspectContext";
import { supabaseProspectService } from "../../../src/services/supabaseProspectService";
import { Prospect, FreelanceProfile } from "../../../src/types";

const INITIAL_MOCK_PROSPECTS: Prospect[] = [
  {
    id: "p_sup_1",
    name: "Menuiserie du Rhône",
    activity: "Menuiserie",
    location: "Lyon 7",
    status: "to_contact",
    identified: false,
    phone: "0478000010",
  },
  {
    id: "p_sup_2",
    name: "Garage Moderne",
    activity: "Garagiste",
    location: "Lyon 3",
    status: "contacted",
    identified: true,
    phone: "0478000020",
  },
];

const INITIAL_MOCK_PROFILE: FreelanceProfile = {
  title: "Expert Webmarketing Local",
  services: "Refonte de site, Google My Business",
  targetSector: "Artisans",
  targetCity: "Lyon",
  valueProposition: "Décupler les prises de contact locales.",
  signature: "Bien cordialement,\nAlex",
};

const TestConsumer: React.FC = () => {
  const {
    prospects,
    freelanceProfile,
    setFreelanceProfile,
    userId,
    isDbLoading,
    handleToggleIdentified,
    handleUpdateStatus,
    handleDeleteProspect,
    handleUndoDelete,
    undoToast,
    handleTokenChange,
    handleSearch,
  } = useProspects();

  return (
    <div>
      <span data-testid="user-id">{userId}</span>
      <span data-testid="db-loading">{isDbLoading ? "loading" : "idle"}</span>
      <span data-testid="prospect-count">{prospects.length}</span>
      <span data-testid="profile-title">{freelanceProfile.title}</span>

      {undoToast && <span data-testid="undo-toast">{undoToast.message}</span>}

      {prospects.map((p) => (
        <div key={p.id} data-testid={`item-${p.id}`}>
          <span data-testid={`status-${p.id}`}>{p.status}</span>
          <span data-testid={`identified-${p.id}`}>{p.identified ? "yes" : "no"}</span>
          <button onClick={() => handleToggleIdentified(p.id)}>Toggle {p.id}</button>
          <button onClick={() => handleUpdateStatus(p.id, "interested")}>Mark Interested {p.id}</button>
          <button onClick={() => handleDeleteProspect(p.id)}>Delete {p.id}</button>
        </div>
      ))}

      <button onClick={handleUndoDelete}>Undo Delete</button>
      <button
        onClick={() =>
          setFreelanceProfile((prev) => ({
            ...prev,
            title: "Expert SEO Local & Conversion",
          }))
        }
      >
        Update Profile Title
      </button>
      <button onClick={() => handleTokenChange("mock_token_123", "user@test.fr", "uid_google_456")}>
        Login Google
      </button>
      <button onClick={() => handleSearch({ city: "Lyon", sector: "Plomberie" })}>
        Search Prospects
      </button>
    </div>
  );
};

describe("Context - ProspectContext Supabase Persistence Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("hydrates prospects and profile from Supabase on mount", async () => {
    const fetchProspectsSpy = vi
      .spyOn(supabaseProspectService, "fetchProspects")
      .mockResolvedValueOnce(INITIAL_MOCK_PROSPECTS);

    const fetchProfileSpy = vi
      .spyOn(supabaseProspectService, "fetchProfile")
      .mockResolvedValueOnce(INITIAL_MOCK_PROFILE);

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("prospect-count")).toHaveTextContent("2");
    });

    expect(fetchProspectsSpy).toHaveBeenCalled();
    expect(fetchProfileSpy).toHaveBeenCalled();
    expect(screen.getByTestId("profile-title")).toHaveTextContent("Expert Webmarketing Local");
    expect(screen.getByTestId("item-p_sup_1")).toBeInTheDocument();
    expect(screen.getByTestId("item-p_sup_2")).toBeInTheDocument();
  });

  it("persists toggleIdentified calls to Supabase", async () => {
    vi.spyOn(supabaseProspectService, "fetchProspects").mockResolvedValueOnce(INITIAL_MOCK_PROSPECTS);
    const toggleSpy = vi.spyOn(supabaseProspectService, "toggleIdentified").mockResolvedValueOnce();

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("prospect-count")).toHaveTextContent("2");
    });

    // Toggle p_sup_1 from identified: false to true
    fireEvent.click(screen.getByText("Toggle p_sup_1"));

    expect(screen.getByTestId("identified-p_sup_1")).toHaveTextContent("yes");
    expect(toggleSpy).toHaveBeenCalledWith(expect.any(String), "p_sup_1", true);
  });

  it("persists updateStatus calls to Supabase", async () => {
    vi.spyOn(supabaseProspectService, "fetchProspects").mockResolvedValueOnce(INITIAL_MOCK_PROSPECTS);
    const statusSpy = vi.spyOn(supabaseProspectService, "updateStatus").mockResolvedValueOnce();

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("prospect-count")).toHaveTextContent("2");
    });

    fireEvent.click(screen.getByText("Mark Interested p_sup_1"));

    expect(screen.getByTestId("status-p_sup_1")).toHaveTextContent("interested");
    expect(statusSpy).toHaveBeenCalledWith(expect.any(String), "p_sup_1", "interested");
  });

  it("persists delete and undo delete to Supabase", async () => {
    vi.spyOn(supabaseProspectService, "fetchProspects").mockResolvedValueOnce(INITIAL_MOCK_PROSPECTS);
    const deleteSpy = vi.spyOn(supabaseProspectService, "deleteProspect").mockResolvedValueOnce();
    const upsertSpy = vi.spyOn(supabaseProspectService, "upsertProspects").mockResolvedValueOnce();

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("prospect-count")).toHaveTextContent("2");
    });

    // Delete p_sup_1
    fireEvent.click(screen.getByText("Delete p_sup_1"));

    expect(screen.getByTestId("prospect-count")).toHaveTextContent("1");
    expect(screen.queryByTestId("item-p_sup_1")).not.toBeInTheDocument();
    expect(deleteSpy).toHaveBeenCalledWith(expect.any(String), "p_sup_1");

    // Undo delete
    fireEvent.click(screen.getByText("Undo Delete"));

    expect(screen.getByTestId("prospect-count")).toHaveTextContent("2");
    expect(screen.getByTestId("item-p_sup_1")).toBeInTheDocument();
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ id: "p_sup_1" })])
    );
  });

  it("synchronizes profile modifications to Supabase", async () => {
    vi.spyOn(supabaseProspectService, "fetchProspects").mockResolvedValueOnce([]);
    const saveProfileSpy = vi.spyOn(supabaseProspectService, "saveProfile").mockResolvedValue();

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("db-loading")).toHaveTextContent("idle");
    });

    act(() => {
      fireEvent.click(screen.getByText("Update Profile Title"));
    });

    expect(screen.getByTestId("profile-title")).toHaveTextContent("Expert SEO Local & Conversion");
    expect(saveProfileSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ title: "Expert SEO Local & Conversion" })
    );
  });

  it.skip("switches userId and re-hydrates when user logs in with Google", async () => {
    const fetchSpy = vi.spyOn(supabaseProspectService, "fetchProspects")
      .mockResolvedValueOnce([]) // 1st mount: guest user
      .mockResolvedValueOnce(INITIAL_MOCK_PROSPECTS); // 2nd: google user

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("db-loading")).toHaveTextContent("idle");
    });

    act(() => {
      fireEvent.click(screen.getByText("Login Google"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("user-id")).toHaveTextContent("uid_google_456");
      expect(screen.getByTestId("prospect-count")).toHaveTextContent("2");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("persists newly found prospects to Supabase on handleSearch", async () => {
    vi.spyOn(supabaseProspectService, "fetchProspects").mockResolvedValueOnce([]);
    const upsertSpy = vi.spyOn(supabaseProspectService, "upsertProspects").mockResolvedValueOnce();

    const searchResults = [
      {
        id: "p_search_1",
        name: "Plomberie du Rhône",
        activity: "Plombier",
        location: "Lyon",
        status: "to_contact" as const,
        identified: false,
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ prospects: searchResults }),
    } as any);

    render(
      <ProspectProvider userId="test-user-id">
        <TestConsumer />
      </ProspectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("db-loading")).toHaveTextContent("idle");
    });

    fireEvent.click(screen.getByText("Search Prospects"));

    await waitFor(() => {
      expect(screen.getByTestId("prospect-count")).toHaveTextContent("1");
    });

    expect(upsertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ id: "p_search_1" })])
    );
  });
});
