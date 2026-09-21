import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SearchPanel } from '../../../src/components/SearchPanel';
import { FreelanceProfile } from '../../../src/types';

const DEFAULT_PROFILE: FreelanceProfile = {
  title: 'Développeur Web Full-Stack',
  services: 'Création de sites internet et SEO',
  targetSector: 'Restaurants & Brasseries',
  targetCity: 'Lyon',
  valueProposition: 'Moderniser votre présence en ligne',
  signature: 'Bien cordialement,\nAlex',
};

const MOCK_SUGGESTIONS = [
  { text: 'Lyon, France', mainText: 'Lyon', secondaryText: 'France', placeId: 'place_lyon' },
  { text: 'Lyon 3e Arrondissement', mainText: 'Lyon 3e Arrondissement', secondaryText: 'Rhône', placeId: 'place_lyon3' },
];

describe('Component - SearchPanel Integration', () => {
  let onSearch: any;
  let onUpdateProfile: any;
  let onClearError: any;

  beforeEach(() => {
    onSearch = vi.fn();
    onUpdateProfile = vi.fn();
    onClearError = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search panel with pre-filled profile values', () => {
    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={DEFAULT_PROFILE}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const cityInput = screen.getByLabelText('Ville ou zone') as HTMLInputElement;
    const sectorInput = screen.getByLabelText("Secteur d'activité") as HTMLInputElement;

    expect(cityInput.value).toBe('Lyon');
    expect(sectorInput.value).toBe('Restaurants & Brasseries');
    expect(screen.getByRole('button', { name: /rechercher/i })).toBeInTheDocument();
  });

  it('does not trigger autocomplete fetch when city input has less than 2 characters', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={{ ...DEFAULT_PROFILE, targetCity: '' }}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const cityInput = screen.getByLabelText('Ville ou zone');
    fireEvent.change(cityInput, { target: { value: 'P' } });

    // Wait past debounce threshold
    await new Promise((r) => setTimeout(r, 350));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByText('Paris, France')).not.toBeInTheDocument();
  });

  it('triggers debounced autocomplete and displays suggestions dropdown', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (header: string) => (header.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ suggestions: MOCK_SUGGESTIONS }),
    } as any);

    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={{ ...DEFAULT_PROFILE, targetCity: '' }}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const cityInput = screen.getByLabelText('Ville ou zone');
    fireEvent.change(cityInput, { target: { value: 'Lyon' } });

    // Wait for the 250ms debounce and fetch resolution
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/prospects/autocomplete?q=Lyon',
        expect.objectContaining({ signal: expect.anything() })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Lyon 3e Arrondissement')).toBeInTheDocument();
    });

    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('updates city value and closes dropdown when suggestion is clicked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (header: string) => (header.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ suggestions: MOCK_SUGGESTIONS }),
    } as any);

    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={{ ...DEFAULT_PROFILE, targetCity: '' }}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const cityInput = screen.getByLabelText('Ville ou zone') as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'Lyo' } });

    await waitFor(() => {
      expect(screen.getByText('Lyon 3e Arrondissement')).toBeInTheDocument();
    });

    // Click on suggestion
    fireEvent.click(screen.getByText('Lyon 3e Arrondissement'));

    expect(cityInput.value).toBe('Lyon 3e Arrondissement');
    // Dropdown should be dismissed
    expect(screen.queryByText('France')).not.toBeInTheDocument();
  });

  it('closes suggestions dropdown when clicking outside', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (header: string) => (header.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ suggestions: MOCK_SUGGESTIONS }),
    } as any);

    render(
      <div>
        <div data-testid="outside-element">Extérieur</div>
        <SearchPanel
          onSearch={onSearch}
          loading={false}
          freelanceProfile={{ ...DEFAULT_PROFILE, targetCity: '' }}
          onUpdateProfile={onUpdateProfile}
        />
      </div>
    );

    const cityInput = screen.getByLabelText('Ville ou zone');
    fireEvent.change(cityInput, { target: { value: 'Lyon' } });

    await waitFor(() => {
      expect(screen.getByText('Lyon 3e Arrondissement')).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));

    await waitFor(() => {
      expect(screen.queryByText('Lyon 3e Arrondissement')).not.toBeInTheDocument();
    });
  });

  it('submits search query on form submission', () => {
    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={DEFAULT_PROFILE}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /rechercher/i });
    fireEvent.click(submitBtn);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(
      {
        city: 'Lyon',
        sector: 'Restaurants & Brasseries',
        specialty: '',
      },
      false
    );
  });

  it('triggers forced refresh when clicking refresh button', () => {
    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={DEFAULT_PROFILE}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const refreshBtn = screen.getByRole('button', { name: /actualiser la recherche/i });
    fireEvent.click(refreshBtn);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(
      {
        city: 'Lyon',
        sector: 'Restaurants & Brasseries',
        specialty: '',
      },
      true
    );
  });

  it('updates city input when quick city suggestion button is clicked', () => {
    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={DEFAULT_PROFILE}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const parisBtn = screen.getByRole('button', { name: 'Paris' });
    fireEvent.click(parisBtn);

    const cityInput = screen.getByLabelText('Ville ou zone') as HTMLInputElement;
    expect(cityInput.value).toBe('Paris');
  });

  it('displays search error alert and allows closing it', () => {
    render(
      <SearchPanel
        onSearch={onSearch}
        loading={false}
        freelanceProfile={DEFAULT_PROFILE}
        onUpdateProfile={onUpdateProfile}
        searchError="Erreur de connexion au service Google Places"
        onClearError={onClearError}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Erreur de connexion au service Google Places');

    const closeBtn = screen.getByRole('button', { name: 'Fermer le message' });
    fireEvent.click(closeBtn);

    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('disables submit button and shows loading text while search is in progress', () => {
    render(
      <SearchPanel
        onSearch={onSearch}
        loading={true}
        freelanceProfile={DEFAULT_PROFILE}
        onUpdateProfile={onUpdateProfile}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /recherche\.\.\./i });
    expect(submitBtn).toBeDisabled();
  });
});
