import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardInput from '../CardInput';

// Mock the Card component to simplify testing
jest.mock('../Card', () => {
  return function MockCard({ rank, suit }) {
    return <div data-testid="card">{rank}{suit}</div>;
  };
});

describe('CardInput', () => {
  const mockOnAddCard = jest.fn();
  const mockOnRemoveLastCard = jest.fn();
  const mockOnClearAll = jest.fn();
  
  const defaultProps = {
    onAddCard: mockOnAddCard,
    onRemoveLastCard: mockOnRemoveLastCard,
    onClearAll: mockOnClearAll,
    countingSystem: 'HILO'
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  it('renders the input field and buttons', () => {
    render(<CardInput {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/enter card/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove last card/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });
  
  it('allows entering card values', () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    userEvent.type(input, 'ah');
    
    expect(input).toHaveValue('ah');
  });
  
  it('adds a card when clicking the add button', async () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    // Enter a valid card
    userEvent.type(input, 'ah');
    
    // Click the add button
    fireEvent.click(addButton);
    
    // Verify the callback was called with the correct card
    await waitFor(() => {
      expect(mockOnAddCard).toHaveBeenCalledWith({ rank: 'A', suit: 'H' });
    });
    
    // Input should be cleared after adding
    expect(input).toHaveValue('');
  });
  
  it('adds a card when pressing enter', async () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    
    // Enter a valid card and press enter
    userEvent.type(input, 'kd{enter}');
    
    // Verify the callback was called with the correct card
    await waitFor(() => {
      expect(mockOnAddCard).toHaveBeenCalledWith({ rank: 'K', suit: 'D' });
    });
  });
  
  it('removes the last card when the remove button is clicked', () => {
    render(<CardInput {...defaultProps} />);
    
    const removeButton = screen.getByRole('button', { name: /remove last card/i });
    
    // Click the remove button
    fireEvent.click(removeButton);
    
    // Verify the callback was called
    expect(mockOnRemoveLastCard).toHaveBeenCalled();
  });
  
  it('clears all cards when the clear all button is clicked', () => {
    render(<CardInput {...defaultProps} />);
    
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    
    // Click the clear button
    fireEvent.click(clearButton);
    
    // Verify the callback was called
    expect(mockOnClearAll).toHaveBeenCalled();
  });
  
  it('shows an error for invalid card input', async () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    // Enter an invalid card
    userEvent.type(input, 'xx');
    
    // The add button should be disabled
    expect(addButton).toBeDisabled();
    
    // Try to add the invalid card
    fireEvent.click(addButton);
    
    // The callback should not be called
    expect(mockOnAddCard).not.toHaveBeenCalled();
    
    // Error message should be shown
    expect(screen.getByText(/invalid card/i)).toBeInTheDocument();
  });
  
  it('shows a preview of the current card', () => {
    render(<CardInput {...defaultProps} />);
    
    // Initially, the preview should show a placeholder
    expect(screen.getByText(/card preview/i)).toBeInTheDocument();
    
    // Enter a valid card
    const input = screen.getByPlaceholderText(/enter card/i);
    userEvent.type(input, 'qs');
    
    // The preview should now show the card
    expect(screen.getByTestId('card')).toHaveTextContent('QS');
  });
  
  it('shows help when the help button is clicked', () => {
    render(<CardInput {...defaultProps} />);
    
    // Help section should be hidden by default
    expect(screen.queryByText(/how to enter cards/i)).not.toBeInTheDocument();
    
    // Click the help button
    const helpButton = screen.getByRole('button', { name: /help/i });
    fireEvent.click(helpButton);
    
    // Help section should now be visible
    expect(screen.getByText(/how to enter cards/i)).toBeInTheDocument();
    
    // Click the help button again to hide
    fireEvent.click(helpButton);
    
    // Help section should be hidden again
    expect(screen.queryByText(/how to enter cards/i)).not.toBeInTheDocument();
  });
  
  it('shows the current counting system', () => {
    render(<CardInput {...defaultProps} countingSystem="KO" />);
    
    expect(screen.getByText(/count system: ko/i)).toBeInTheDocument();
  });
  
  it('handles case-insensitive input', async () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    
    // Enter a card with mixed case
    userEvent.type(input, 'Tc{enter}');
    
    // Verify the callback was called with the correct card (uppercased)
    await waitFor(() => {
      expect(mockOnAddCard).toHaveBeenCalledWith({ rank: 'T', suit: 'C' });
    });
  });
  
  it('handles numeric input for face cards', async () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    
    // Enter a card with a numeric value for a face card
    userEvent.type(input, '11s{enter}');
    
    // The input should be converted to the correct rank
    await waitFor(() => {
      expect(mockOnAddCard).toHaveBeenCalledWith({ rank: 'J', suit: 'S' });
    });
  });
  
  it('shows the current count values for the selected system', () => {
    render(<CardInput {...defaultProps} countingSystem="HILO" />);
    
    // Show help to see the count values
    const helpButton = screen.getByRole('button', { name: /help/i });
    fireEvent.click(helpButton);
    
    // Check that the correct count values are shown for Hi-Lo
    expect(screen.getByText(/2-6: \+1/)).toBeInTheDocument();
    expect(screen.getByText(/7-9: 0/)).toBeInTheDocument();
    expect(screen.getByText(/10-A: -1/)).toBeInTheDocument();
  });
  
  it('disables the add button when input is empty', () => {
    render(<CardInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/enter card/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    // Button should be disabled when input is empty
    expect(addButton).toBeDisabled();
    
    // Enter some text
    userEvent.type(input, 'a');
    
    // Button should be enabled
    expect(addButton).not.toBeDisabled();
    
    // Clear the input
    userEvent.clear(input);
    
    // Button should be disabled again
    expect(addButton).toBeDisabled();
  });
});
