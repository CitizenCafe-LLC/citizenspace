/**
 * Tests for WorkspaceForm component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WorkspaceForm } from '@/components/admin/WorkspaceForm'
import userEvent from '@testing-library/user-event'

describe('WorkspaceForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/Workspace Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Capacity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Hourly Rate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Day Rate/i)).toBeInTheDocument()
  })

  it('renders all amenity checkboxes', () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('WiFi')).toBeInTheDocument()
    expect(screen.getByLabelText('Monitor')).toBeInTheDocument()
    expect(screen.getByLabelText('Whiteboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Coffee')).toBeInTheDocument()
  })

  it('populates form with default values', () => {
    const defaultValues = {
      name: 'Test Workspace',
      type: 'hot-desk' as const,
      description: 'Test description',
      capacity: 2,
      hourlyRate: 15,
      dayRate: 60,
      amenities: ['WiFi', 'Coffee'],
      available: true,
    }

    render(<WorkspaceForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />)

    expect(screen.getByDisplayValue('Test Workspace')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /Create Workspace/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
    })
  })

  it('validates minimum description length', async () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    const descriptionInput = screen.getByLabelText(/Description/i)
    fireEvent.change(descriptionInput, { target: { value: 'Short' } })

    const submitButton = screen.getByRole('button', { name: /Create Workspace/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Description must be at least 10 characters/i)).toBeInTheDocument()
    })
  })

  it('validates capacity minimum', async () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    const capacityInput = screen.getByLabelText(/Capacity/i)
    fireEvent.change(capacityInput, { target: { value: '0' } })

    const submitButton = screen.getByRole('button', { name: /Create Workspace/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Capacity must be at least 1/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined)

    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Workspace Name/i), {
      target: { value: 'New Workspace' },
    })

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a test workspace description' },
    })

    fireEvent.change(screen.getByLabelText(/Capacity/i), {
      target: { value: '4' },
    })

    fireEvent.change(screen.getByLabelText(/Hourly Rate/i), {
      target: { value: '20' },
    })

    fireEvent.change(screen.getByLabelText(/Day Rate/i), {
      target: { value: '80' },
    })

    const submitButton = screen.getByRole('button', { name: /Create Workspace/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('toggles amenities selection', () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    const wifiCheckbox = screen.getByLabelText('WiFi')
    expect(wifiCheckbox).not.toBeChecked()

    fireEvent.click(wifiCheckbox)
    expect(wifiCheckbox).toBeChecked()

    fireEvent.click(wifiCheckbox)
    expect(wifiCheckbox).not.toBeChecked()
  })

  it('handles image upload', () => {
    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Upload image/i)

    Object.defineProperty(input, 'files', {
      value: [file],
    })

    fireEvent.change(input)

    // Image preview should appear
    waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

    render(<WorkspaceForm onSubmit={mockOnSubmit} />)

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Workspace Name/i), {
      target: { value: 'New Workspace' },
    })
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a test workspace description' },
    })

    const submitButton = screen.getByRole('button', { name: /Create Workspace/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('displays correct button text for edit mode', () => {
    const defaultValues = {
      name: 'Test',
      type: 'hot-desk' as const,
      description: 'Test description',
      capacity: 1,
      hourlyRate: 10,
      dayRate: 40,
      amenities: [],
      available: true,
    }

    render(<WorkspaceForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />)

    expect(screen.getByRole('button', { name: /Update Workspace/i })).toBeInTheDocument()
  })
})