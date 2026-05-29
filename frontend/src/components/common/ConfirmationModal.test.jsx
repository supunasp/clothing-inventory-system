import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ConfirmationModal isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders default copy when open with no overrides', () => {
    render(<ConfirmationModal isOpen />);

    expect(screen.getByText('Confirm Update')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to continue?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('uses custom title, message, and button labels when provided', () => {
    render(
      <ConfirmationModal
        isOpen
        title="Delete brand"
        message="This cannot be undone."
        confirmText="Yes, delete"
        cancelText="Keep"
      />,
    );

    expect(screen.getByText('Delete brand')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('fires onConfirm and onCancel callbacks', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(<ConfirmationModal isOpen onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: /close confirmation modal/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('disables buttons and shows loading text while isLoading', () => {
    render(<ConfirmationModal isOpen isLoading />);

    const confirm = screen.getByRole('button', { name: /updating/i });
    const cancel = screen.getByRole('button', { name: 'Cancel' });

    expect(confirm).toBeDisabled();
    expect(cancel).toBeDisabled();
    expect(screen.getByRole('button', { name: /close confirmation modal/i })).toBeDisabled();
  });
});
