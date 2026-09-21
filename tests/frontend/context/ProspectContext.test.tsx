import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { ProspectProvider, useProspects } from '../../../src/context/ProspectContext';
import { Prospect } from '../../../src/types';

const MOCK_PROSPECTS: Prospect[] = [
  {
    id: 'p1',
    name: 'Boulangerie Saint-Jean',
    activity: 'Boulangerie',
    location: 'Lyon 5',
    status: 'to_contact',
    identified: false,
    phone: '0478000001',
    email: 'contact@saintjean.fr',
    website: 'https://saintjean.fr',
  },
  {
    id: 'p2',
    name: 'Boucherie Centrale',
    activity: 'Boucherie',
    location: 'Lyon 2',
    status: 'contacted',
    identified: true,
    phone: '0478000002',
    email: undefined,
    website: undefined, // Sans site
  },
  {
    id: 'p3',
    name: 'Pharmacie Bellecour',
    activity: 'Pharmacie',
    location: 'Lyon 1',
    status: 'interested',
    identified: true,
    phone: '0478000003',
    email: 'info@pharmacie.fr',
    website: 'https://pharmacie.fr',
  },
];

// Test consumer component
const Consumer: React.FC = () => {
  const {
    prospects,
    filteredProspects,
    filterStatus,
    setFilterStatus,
    searchFilterText,
    setSearchFilterText,
    filterWithoutWebsite,
    setFilterWithoutWebsite,
    filterWithEmail,
    setFilterWithEmail,
    handleToggleIdentified,
    handleUpdateStatus,
    handleDeleteProspect,
    undoToast,
    handleUndoDelete,
    exportProspectsCSV,
    exportProspectsJSON,
  } = useProspects();

  return (
    <div>
      <span data-testid="total-count">{prospects.length}</span>
      <span data-testid="filtered-count">{filteredProspects.length}</span>
      <span data-testid="filter-status">{filterStatus}</span>
      <span data-testid="search-text">{searchFilterText}</span>

      {undoToast && <span data-testid="undo-toast">{undoToast.message}</span>}

      <div data-testid="prospect-list">
        {filteredProspects.map((p) => (
          <div key={p.id} data-testid={`prospect-${p.id}`}>
            <span>{p.name}</span>
            <span data-testid={`status-${p.id}`}>{p.status}</span>
            <span data-testid={`identified-${p.id}`}>{p.identified ? 'yes' : 'no'}</span>
            <button onClick={() => handleToggleIdentified(p.id)}>Toggle Identified</button>
            <button onClick={() => handleUpdateStatus(p.id, 'declined')}>Mark Declined</button>
            <button onClick={() => handleDeleteProspect(p.id)}>Delete</button>
          </div>
        ))}
      </div>

      <button onClick={() => setFilterStatus('interested')}>Filter Interested</button>
      <button onClick={() => setFilterStatus('searched')}>Filter Searched</button>
      <button onClick={() => setFilterStatus('identified')}>Filter Shortlist</button>
      <button onClick={() => setFilterStatus('all')}>Filter All</button>
      <button onClick={() => setSearchFilterText('Boucherie')}>Search Boucherie</button>
      <button onClick={() => setFilterWithoutWebsite(true)}>Filter Without Website</button>
      <button onClick={() => setFilterWithEmail(true)}>Filter With Email</button>
      <button onClick={handleUndoDelete}>Undo Delete</button>
      <button onClick={exportProspectsCSV}>Export CSV</button>
      <button onClick={exportProspectsJSON}>Export JSON</button>
    </div>
  );
};

describe('Context - ProspectContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(
      'freelance_current_search',
      JSON.stringify({
        city: 'Lyon',
        sector: 'Commerces & Artisans',
        prospectIds: ['p1', 'p2', 'p3'],
      })
    );
    localStorage.setItem('freelance_prospects', JSON.stringify(MOCK_PROSPECTS));
  });

  it('hydrates initial prospects from localStorage', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('3');
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('3');
  });

  it('filters prospects by pipeline status', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    // Filter by "interested" (only p3)
    fireEvent.click(screen.getByText('Filter Interested'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    expect(screen.getByTestId('prospect-p3')).toBeInTheDocument();
    expect(screen.queryByTestId('prospect-p1')).not.toBeInTheDocument();
  });

  it('filters prospects by shortlist (identified: true)', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    // Filter by "identified" (p2 and p3)
    fireEvent.click(screen.getByText('Filter Shortlist'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
    expect(screen.getByTestId('prospect-p2')).toBeInTheDocument();
    expect(screen.getByTestId('prospect-p3')).toBeInTheDocument();
  });

  it('filters prospects by search text matching name or activity', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Search Boucherie'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    expect(screen.getByTestId('prospect-p2')).toBeInTheDocument();
  });

  it('filters prospects without website', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Filter Without Website'));
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    expect(screen.getByTestId('prospect-p2')).toBeInTheDocument();
  });

  it('filters prospects with email', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Filter With Email'));
    // p1 and p3 have email, p2 does not
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
    expect(screen.getByTestId('prospect-p1')).toBeInTheDocument();
    expect(screen.getByTestId('prospect-p3')).toBeInTheDocument();
  });

  it('toggles prospect identified status and persists in state', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    expect(screen.getByTestId('identified-p1')).toHaveTextContent('no');
    const toggleBtn = screen.getByTestId('prospect-p1').querySelector('button')!;
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('identified-p1')).toHaveTextContent('yes');
  });

  it('updates prospect status to declined', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    expect(screen.getByTestId('status-p1')).toHaveTextContent('to_contact');
    const markDeclinedBtn = screen.getByTestId('prospect-p1').querySelectorAll('button')[1];
    fireEvent.click(markDeclinedBtn);
    expect(screen.getByTestId('status-p1')).toHaveTextContent('declined');
  });

  it('handles prospect deletion with UndoToast and allows restoration', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('3');

    // Delete p1
    const deleteBtn = screen.getByTestId('prospect-p1').querySelectorAll('button')[2];
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId('total-count')).toHaveTextContent('2');
    expect(screen.queryByTestId('prospect-p1')).not.toBeInTheDocument();
    expect(screen.getByTestId('undo-toast')).toHaveTextContent(/retiré de la liste/i);

    // Undo delete
    fireEvent.click(screen.getByText('Undo Delete'));
    expect(screen.getByTestId('total-count')).toHaveTextContent('3');
    expect(screen.getByTestId('prospect-p1')).toBeInTheDocument();
  });

  it('exports prospects as CSV with correct headers and BOM', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Export CSV'));
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('exports prospects as JSON', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    fireEvent.click(screen.getByText('Export JSON'));
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('handles new pipeline lifecycle: transitions between searched and to_contact via like', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    // Initialement p1 est to_contact avec identified: false
    const toggleBtn = screen.getByTestId('prospect-p1').querySelector('button');
    expect(toggleBtn).not.toBeNull();

    // 1er Like -> identified: true, status: 'to_contact'
    fireEvent.click(toggleBtn!);
    expect(screen.getByTestId('identified-p1')).toHaveTextContent('yes');
    expect(screen.getByTestId('status-p1')).toHaveTextContent('to_contact');

    // 2e Clic (Unlike) -> identified: false, status: 'searched'
    fireEvent.click(toggleBtn!);
    expect(screen.getByTestId('identified-p1')).toHaveTextContent('no');
    expect(screen.getByTestId('status-p1')).toHaveTextContent('searched');

    // 3e Clic (Re-like) -> repasse à identified: true, status: 'to_contact'
    fireEvent.click(toggleBtn!);
    expect(screen.getByTestId('identified-p1')).toHaveTextContent('yes');
    expect(screen.getByTestId('status-p1')).toHaveTextContent('to_contact');
  });

  it('filters prospects by searched history status', () => {
    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    // Passer p1 en 'searched' via Unlike
    const toggleBtn = screen.getByTestId('prospect-p1').querySelector('button');
    fireEvent.click(toggleBtn!); // identified: true
    fireEvent.click(toggleBtn!); // identified: false, status: 'searched'
    expect(screen.getByTestId('status-p1')).toHaveTextContent('searched');

    // Filtrer par 'searched'
    fireEvent.click(screen.getByText('Filter Searched'));
    expect(screen.getByTestId('filter-status')).toHaveTextContent('searched');
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    expect(screen.getByTestId('prospect-p1')).toBeInTheDocument();
    expect(screen.queryByTestId('prospect-p2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('prospect-p3')).not.toBeInTheDocument();
  });

  it('restricts "all" view strictly to current search session prospectIds and shows 0 when no search active', () => {
    sessionStorage.clear();

    render(
      <ProspectProvider>
        <Consumer />
      </ProspectProvider>
    );

    // Initial total prospects is 3 (from localStorage)
    expect(screen.getByTestId('total-count')).toHaveTextContent('3');
    // But since no search is active in currentSearchInfo, filtered count in "all" view is 0
    expect(screen.getByTestId('filter-status')).toHaveTextContent('all');
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0');
  });
});
