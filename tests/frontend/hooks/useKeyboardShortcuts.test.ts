import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../../src/hooks/useKeyboardShortcuts';
import { Prospect } from '../../../src/types';

const MOCK_PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Prospect 1', activity: 'Activité 1', location: 'Ville 1', status: 'to_contact', identified: false },
  { id: 'p2', name: 'Prospect 2', activity: 'Activité 2', location: 'Ville 2', status: 'to_contact', identified: false },
  { id: 'p3', name: 'Prospect 3', activity: 'Activité 3', location: 'Ville 3', status: 'to_contact', identified: true },
];

describe('Hook - useKeyboardShortcuts', () => {
  let onSelectProspect: any;
  let onOpenEmailModal: any;
  let onToggleIdentified: any;
  let onToggleShortcuts: any;
  let onCloseShortcuts: any;
  let onDeselect: any;

  beforeEach(() => {
    onSelectProspect = vi.fn();
    onOpenEmailModal = vi.fn();
    onToggleIdentified = vi.fn();
    onToggleShortcuts = vi.fn();
    onCloseShortcuts = vi.fn();
    onDeselect = vi.fn();
  });

  it('selects first prospect on "j" or "ArrowDown" when none selected', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: null,
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    expect(onSelectProspect).toHaveBeenCalledWith(MOCK_PROSPECTS[0]);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(onSelectProspect).toHaveBeenCalledWith(MOCK_PROSPECTS[0]);
  });

  it('navigates to next prospect on "j" when current selected', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: 'p1',
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    expect(onSelectProspect).toHaveBeenCalledWith(MOCK_PROSPECTS[1]);
  });

  it('navigates to previous prospect on "k" or "ArrowUp"', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: 'p2',
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    expect(onSelectProspect).toHaveBeenCalledWith(MOCK_PROSPECTS[0]);
  });

  it('opens email modal on "m" or "Enter" for selected prospect', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: 'p2',
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    expect(onOpenEmailModal).toHaveBeenCalledWith(MOCK_PROSPECTS[1]);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onOpenEmailModal).toHaveBeenCalledWith(MOCK_PROSPECTS[1]);
  });

  it('toggles identified on "f" or "x" for selected prospect', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: 'p3',
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    expect(onToggleIdentified).toHaveBeenCalledWith('p3');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(onToggleIdentified).toHaveBeenCalledWith('p3');
  });

  it('toggles shortcuts help modal on "?" key', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: null,
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    expect(onToggleShortcuts).toHaveBeenCalledTimes(1);
  });

  it('closes shortcuts modal on Escape when shortcuts modal is open', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: 'p1',
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: true,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onCloseShortcuts).toHaveBeenCalledTimes(1);
    expect(onDeselect).not.toHaveBeenCalled();
  });

  it('ignores shortcuts when user is typing inside an INPUT or TEXTAREA', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        filteredProspects: MOCK_PROSPECTS,
        selectedId: 'p1',
        onSelectProspect,
        onOpenEmailModal,
        onToggleIdentified,
        isShortcutsOpen: false,
        onToggleShortcuts,
        onCloseShortcuts,
        onDeselect,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: 'j', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    window.dispatchEvent(event);

    expect(onSelectProspect).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
