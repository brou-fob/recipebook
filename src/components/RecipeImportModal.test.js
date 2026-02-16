import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeImportModal from './RecipeImportModal';

describe('RecipeImportModal', () => {
  const mockOnImport = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders action buttons', () => {
    render(
      <RecipeImportModal 
        onImport={mockOnImport} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    expect(screen.getByText('Importieren')).toBeInTheDocument();
  });

  test('cancel button calls onCancel', () => {
    render(
      <RecipeImportModal 
        onImport={mockOnImport} 
        onCancel={mockOnCancel} 
      />
    );

    const cancelButton = screen.getByText('Abbrechen');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
