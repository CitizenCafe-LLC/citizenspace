'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowUpDown, Download, Filter } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Transaction {
  id: string
  transaction_type: 'allocation' | 'usage' | 'expiration'
  credit_type: 'meeting_room_hours' | 'printing_credits' | 'guest_passes'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

interface TransactionTableProps {
  transactions: Transaction[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onFilterChange?: (creditType: string) => void
  onExport?: () => void
}

const transactionTypeConfig = {
  allocation: { label: 'Allocation', variant: 'default' as const, color: 'text-green-600' },
  usage: { label: 'Usage', variant: 'secondary' as const, color: 'text-orange-600' },
  expiration: { label: 'Expiration', variant: 'destructive' as const, color: 'text-red-600' },
}

const creditTypeLabels = {
  meeting_room_hours: 'Meeting Room',
  printing_credits: 'Printing',
  guest_passes: 'Guest Pass',
}

export function TransactionTable({
  transactions,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onFilterChange,
  onExport,
}: TransactionTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<string>('all')

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleFilterChange = (value: string) => {
    setFilterType(value)
    onFilterChange?.(value)
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="meeting_room_hours">Meeting Room</SelectItem>
              <SelectItem value="printing_credits">Printing</SelectItem>
              <SelectItem value="guest_passes">Guest Pass</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSort}
                  className="-ml-3 h-8"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Credit Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction) => {
                const typeConfig = transactionTypeConfig[transaction.transaction_type]
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {creditTypeLabels[transaction.credit_type]}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${typeConfig.color}`}>
                      {transaction.transaction_type === 'allocation' ? '+' : '-'}
                      {Math.abs(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.balance_after}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {transaction.description}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}