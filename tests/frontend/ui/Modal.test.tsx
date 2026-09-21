import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Modal } from '../../../src/components/ui/Modal';

describe('UI Component - Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Titre caché">
        <p>Contenu secret</p>
      </Modal>
    );
    expect(screen.queryByText('Titre caché')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenu secret')).not.toBeInTheDocument();
  });

  it('renders title, subtitle, footer and children when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Titre Visible"
        subtitle="Sous-titre descriptif"
        footer={<button>Enregistrer</button>}
      >
        <p>Contenu Principal</p>
      </Modal>
    );
    expect(screen.getByText('Titre Visible')).toBeInTheDocument();
    expect(screen.getByText('Sous-titre descriptif')).toBeInTheDocument();
    expect(screen.getByText('Contenu Principal')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
  });

  it('calls onClose when close button (x) is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modale">
        <p>Corps</p>
      </Modal>
    );
    const closeBtn = screen.getByLabelText('Fermer');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modale Escape">
        <p>Contenu</p>
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
