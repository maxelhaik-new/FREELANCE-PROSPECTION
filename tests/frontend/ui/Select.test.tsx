import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Select } from '../../../src/components/ui/Select';

describe('UI Component - Select', () => {
  it('renders select with options and handles value selection', () => {
    const handleChange = vi.fn();
    render(
      <Select value="opt2" onChange={handleChange}>
        <option value="opt1">Option 1</option>
        <option value="opt2">Option 2</option>
        <option value="opt3">Option 3</option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('opt2');

    fireEvent.change(select, { target: { value: 'opt3' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies pipeline status styling variants', () => {
    const { rerender } = render(
      <Select statusVariant="to_contact" value="to_contact" onChange={() => {}}>
        <option value="to_contact">À contacter</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('bg-amber-50');

    rerender(
      <Select statusVariant="contacted" value="contacted" onChange={() => {}}>
        <option value="contacted">Contacté</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('bg-blue-50');

    rerender(
      <Select statusVariant="interested" value="interested" onChange={() => {}}>
        <option value="interested">Intéressé</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('bg-emerald-50');

    rerender(
      <Select statusVariant="declined" value="declined" onChange={() => {}}>
        <option value="declined">Sans suite</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('bg-secondary');
  });
});
