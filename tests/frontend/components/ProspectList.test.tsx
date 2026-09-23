import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProspectList } from '../../../src/components/ProspectList';
import { ProspectProvider } from '../../../src/context/ProspectContext';
import { Prospect } from '../../../src/types';

const MOCK_PROSPECTS: Prospect[] = [
  {
    id: 'p1',
    name: 'Point Artisans De Lyon',
    activity: 'Services',
    location: 'Lyon',
    status: 'searched',
    identified: false,
    phone: '04 72 72 91 02',
    website: 'https://artisans-lyon.fr',
    rating: 5,
    reviewCount: 1,
    keyAngle: "Avec un seul avis au compteur, l'enjeu prioritaire est de stimuler la collecte d'avis clients.",
  },
  {
    id: 'p2',
    name: 'Menuiserie Artisanale Lyonnaise',
    activity: 'Menuiserie',
    location: 'Lyon 3e Arrondissement',
    status: 'to_contact',
    identified: true,
    phone: '04 78 12 34 56',
    email: 'contact@menuiserie-lyon.com',
    website: undefined,
    rating: 4.8,
    reviewCount: 12,
  },
];

describe('Component - ProspectList Layout & Polish', () => {
  beforeEach(() => {
    sessionStorage.setItem(
      'freelance_current_search',
      JSON.stringify({
        city: 'Lyon',
        sector: 'Services',
        prospectIds: ['p1', 'p2'],
      })
    );
  });
  const defaultProps = {
    prospects: MOCK_PROSPECTS,
    filteredProspects: MOCK_PROSPECTS,
    onSelectProspect: vi.fn(),
    onOpenEmailModal: vi.fn(),
    onUpdateStatus: vi.fn(),
    onToggleIdentified: vi.fn(),
    onDeleteProspect: vi.fn(),
    selectedId: null,
    filterStatus: 'all',
    onFilterChange: vi.fn(),
    searchFilterText: '',
    onSearchFilterChange: vi.fn(),
    filterWithoutWebsite: false,
    onFilterWithoutWebsiteChange: vi.fn(),
    filterWithEmail: false,
    onFilterWithEmailChange: vi.fn(),
  };

  it('renders correctly in split view mode with nowrap counter and proper layout classes', () => {
    render(
      <ProspectProvider userId="test-user-id">
        <ProspectList {...defaultProps} layoutMode="split" />
      </ProspectProvider>
    );

    // Check title and counter have whitespace-nowrap
    const title = screen.getByRole('heading', { level: 2, name: /prospects/i });
    expect(title).toHaveClass('whitespace-nowrap');

    const counter = screen.getByText('2 sur 2');
    expect(counter).toHaveClass('whitespace-nowrap');

    // Check Export CSV button has whitespace-nowrap
    const exportBtn = screen.getByRole('button', { name: /exporter les prospects au format csv/i });
    expect(exportBtn).toHaveClass('whitespace-nowrap');

    // Check search input exists
    const searchInput = screen.getByPlaceholderText(/rechercher par nom ou activité/i);
    expect(searchInput).toBeInTheDocument();

    // Check filter checkboxes
    expect(screen.getByLabelText(/sans site/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/avec email/i)).toBeInTheDocument();
  });

  it('renders clear button when search filter text is non-empty and handles clearing', () => {
    const onSearchFilterChange = vi.fn();
    render(
      <ProspectProvider userId="test-user-id">
        <ProspectList
          {...defaultProps}
          searchFilterText="Plomberie"
          onSearchFilterChange={onSearchFilterChange}
          layoutMode="split"
        />
      </ProspectProvider>
    );

    const clearBtn = screen.getByRole('button', { name: /effacer la recherche/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onSearchFilterChange).toHaveBeenCalledWith('');
  });

  it('renders prospect cards with whitespace-nowrap on badges, ratings, and action buttons', () => {
    render(
      <ProspectProvider userId="test-user-id">
        <ProspectList {...defaultProps} layoutMode="split" />
      </ProspectProvider>
    );

    // Verify card rendered
    expect(screen.getByText('Point Artisans De Lyon')).toBeInTheDocument();

    // Rating wrapper element has whitespace-nowrap
    const ratingEl = screen.getByText('5').parentElement;
    expect(ratingEl).toHaveClass('whitespace-nowrap');

    // Mail IA button has whitespace-nowrap
    const mailBtn = screen.getByRole('button', { name: /rédiger l'email personnalisé pour Point Artisans De Lyon/i });
    expect(mailBtn).toHaveClass('whitespace-nowrap');

    // Phone copy button has whitespace-nowrap
    const phoneBtn = screen.getByLabelText(/copier le téléphone : 04 72 72 91 02/i);
    expect(phoneBtn).toHaveClass('whitespace-nowrap');
  });

  it('renders status select in Kanban stage without footer overflow', () => {
    const onUpdateStatus = vi.fn();
    render(
      <ProspectProvider userId="test-user-id">
        <ProspectList
          {...defaultProps}
          filterStatus="to_contact"
          onUpdateStatus={onUpdateStatus}
          layoutMode="split"
        />
      </ProspectProvider>
    );

    const select = screen.getByLabelText(/statut de point artisans de lyon/i);
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass('h-8'); // Aligned with h-8 buttons
  });
});
