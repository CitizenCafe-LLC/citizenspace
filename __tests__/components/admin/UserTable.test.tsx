/**
 * Tests for UserTable component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserTable } from '@/components/admin/UserTable'

const mockUsers = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'user' as const,
    nftHolder: true,
    avatarUrl: undefined,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    role: 'staff' as const,
    nftHolder: false,
    avatarUrl: undefined,
    createdAt: new Date('2025-02-20'),
  },
  {
    id: '3',
    fullName: 'Mike Admin',
    email: 'mike@example.com',
    role: 'admin' as const,
    nftHolder: true,
    avatarUrl: undefined,
    createdAt: new Date('2025-01-05'),
  },
]

describe('UserTable', () => {
  const mockHandlers = {
    onView: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onExport: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders users table with data', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
  })

  it('displays all role badges correctly', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    expect(screen.getAllByText('user')).toHaveLength(1)
    expect(screen.getAllByText('staff')).toHaveLength(1)
    expect(screen.getAllByText('admin')).toHaveLength(1)
  })

  it('shows NFT holder status badges', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const yesBadges = screen.getAllByText('Yes')
    const noBadges = screen.getAllByText('No')

    expect(yesBadges).toHaveLength(2) // John and Mike are NFT holders
    expect(noBadges).toHaveLength(1) // Jane is not
  })

  it('filters users by search query', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const searchInput = screen.getByPlaceholderText(/Search by name or email/i)
    fireEvent.change(searchInput, { target: { value: 'John' } })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('filters users by role', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const roleFilter = screen.getAllByRole('combobox')[0]
    fireEvent.click(roleFilter)

    const adminOption = screen.getByText('Admin')
    fireEvent.click(adminOption)

    expect(screen.getByText('Mike Admin')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('filters users by NFT holder status', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const nftFilter = screen.getAllByRole('combobox')[1]
    fireEvent.click(nftFilter)

    const holderOption = screen.getByText('NFT Holders')
    fireEvent.click(holderOption)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Mike Admin')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('calls onView when view button clicked', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const moreButton = screen.getAllByRole('button', { name: '' })[0]
    fireEvent.click(moreButton)

    const viewButton = screen.getByText('View Details')
    fireEvent.click(viewButton)

    expect(mockHandlers.onView).toHaveBeenCalledWith('1')
  })

  it('calls onEdit when edit button clicked', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const moreButton = screen.getAllByRole('button', { name: '' })[0]
    fireEvent.click(moreButton)

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith('1')
  })

  it('calls onDelete when delete button clicked', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const moreButton = screen.getAllByRole('button', { name: '' })[0]
    fireEvent.click(moreButton)

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1')
  })

  it('calls onExport when export button clicked', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const exportButton = screen.getByRole('button', { name: /Export CSV/i })
    fireEvent.click(exportButton)

    expect(mockHandlers.onExport).toHaveBeenCalled()
  })

  it('displays user avatars correctly', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    // Should render fallback initials for users without avatars
    expect(screen.getByText('JD')).toBeInTheDocument() // John Doe
    expect(screen.getByText('JS')).toBeInTheDocument() // Jane Smith
    expect(screen.getByText('MA')).toBeInTheDocument() // Mike Admin
  })

  it('shows pagination when more than 10 users', () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      ...mockUsers[0],
      id: `${i}`,
      fullName: `User ${i}`,
      email: `user${i}@example.com`,
    }))

    render(<UserTable users={manyUsers} {...mockHandlers} />)

    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument()
  })

  it('shows empty state when no users match filters', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />)

    const searchInput = screen.getByPlaceholderText(/Search by name or email/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No users found')).toBeInTheDocument()
  })
})