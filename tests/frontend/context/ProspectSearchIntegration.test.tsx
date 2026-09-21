import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ProspectProvider, useProspects } from '../../../src/context/ProspectContext';
import { Prospect } from '../../../src/types';

const NEW_MOCK_PROSPECTS: Prospect[] = [
  {
    id: 'p-new-1',
    name: 'Boulangerie Nouvelle',
    activity: 'Boulangerie',
    location: 'Lyon 3',
    status: 'to_contact',
    identified: false,
    phone: '0478112233',
    email: 'contact@boulangerienouvelle.fr',
  },
  {
    id: 'p-new-2',
    name: 'Boulangerie Moderne',
    activity: 'Boulangerie',
    location: 'Lyon 6',
    status: 'to_contact',
    identified: false,
    phone: '0478445566',
  },
];

// Test consumer focusing exclusively on Search interactions
const SearchConsumer: React.FC = () => {
  const {
    prospects,
    filteredProspects,
    searchLoading,
    searchError,
    currentSearchInfo,
    handleSearch,
    retryLastSearch,
    clearSearchError,
  } = useProspects();

  return (
    <div>
      <span data-testid="total-count">{prospects.length}</span>
      <span data-testid="filtered-count">{filteredProspects.length}</span>
      <span data-testid="loading-state">{searchLoading ? 'loading' : 'idle'}</span>
      <span data-testid="error-message">{searchError || 'none'}</span>
      <span data-testid="search-info">
        {currentSearchInfo ? `${currentSearchInfo.city}-${currentSearchInfo.sector}` : 'empty'}
      </span>

      <button
        onClick={() =>
          handleSearch({ city: 'Lyon', sector: 'Boulangerie', specialty: '' }, false)
        }
      >
        Lancer Recherche
      </button>

      <button onClick={() => retryLastSearch()}>Relancer Dernière Recherche</button>

      <button onClick={() => clearSearchError()}>Effacer Erreur</button>

      <div data-testid="prospect-names">
        {prospects.map((p) => (
          <span key={p.id} data-testid={`prospect-${p.id}`}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
};

describe('Context - ProspectSearch Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully acquires and injects new prospects into state on 200 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ prospects: NEW_MOCK_PROSPECTS }),
    } as any);

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    // Initial state is empty
    expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');

    // Trigger search
    fireEvent.click(screen.getByText('Lancer Recherche'));

    // Verify loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

    // Wait for resolution
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    expect(screen.getByTestId('total-count')).toHaveTextContent('2');
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
    expect(screen.getByTestId('prospect-p-new-1')).toHaveTextContent('Boulangerie Nouvelle');
    expect(screen.getByTestId('prospect-p-new-2')).toHaveTextContent('Boulangerie Moderne');
    expect(screen.getByTestId('search-info')).toHaveTextContent('Lyon-Boulangerie');
    expect(screen.getByTestId('error-message')).toHaveTextContent('none');
  });

  it('deduplicates newly returned prospects against existing state by name', async () => {
    const existingProspect: Prospect = {
      id: 'existing-1',
      name: 'Boulangerie Nouvelle', // Same name as one in NEW_MOCK_PROSPECTS
      activity: 'Boulangerie',
      location: 'Lyon 3',
      status: 'interested', // custom status that shouldn't create duplicate
      identified: true,
    };
    localStorage.setItem('freelance_prospects', JSON.stringify([existingProspect]));

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ prospects: NEW_MOCK_PROSPECTS }),
    } as any);

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Lancer Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    // 1 existing + 1 new unique (since Boulangerie Nouvelle already exists) = 2 total
    expect(screen.getByTestId('total-count')).toHaveTextContent('2');
  });

  it('handles HTTP 400 Bad Request with descriptive error and does not mutate prospects', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Critères invalides : la ville est requise.' }),
    } as any);

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Lancer Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    expect(screen.getByTestId('error-message')).toHaveTextContent('Critères invalides : la ville est requise.');
  });

  it('handles HTTP 500 Server Error with fallback message when server returns no body', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as any);

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Lancer Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Le service Google Maps / Gemini rencontre une indisponibilité momentanée (Erreur 500). Veuillez réessayer.'
    );
  });

  it('handles network failure (TypeError fetch failed)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Lancer Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Impossible de contacter le serveur. Vérifiez votre connexion réseau.'
    );
  });

  it('handles timeout AbortError gracefully', async () => {
    const abortError = new Error('The user aborted a request.');
    abortError.name = 'AbortError';
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(abortError);

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Lancer Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      "Délai d'attente dépassé (timeout). Le serveur de recherche met trop de temps à répondre, veuillez réessayer."
    );
  });

  it('allows retrying last search via retryLastSearch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Erreur temporaire 500' }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ prospects: NEW_MOCK_PROSPECTS }),
      } as any);

    render(
      <ProspectProvider>
        <SearchConsumer />
      </ProspectProvider>
    );

    // 1st search fails
    fireEvent.click(screen.getByText('Lancer Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Erreur temporaire 500');
    });

    // Retry succeeds
    fireEvent.click(screen.getByText('Relancer Dernière Recherche'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    });

    expect(screen.getByTestId('total-count')).toHaveTextContent('2');
    expect(screen.getByTestId('error-message')).toHaveTextContent('none');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
