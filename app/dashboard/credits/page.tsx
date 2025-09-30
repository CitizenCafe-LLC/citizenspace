'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { CreditBalanceCard } from '@/components/dashboard/CreditBalanceCard'
import { TransactionTable } from '@/components/dashboard/TransactionTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function CreditsPage() {
  const [credits, setCredits] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const pageSize = 10

  useEffect(() => {
    loadUserData()
    loadCredits()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [currentPage, filterType])

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const loadCredits = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/memberships/credits')
      if (!res.ok) {
        throw new Error('Failed to fetch credits')
      }

      const data = await res.json()
      setCredits(data.data || [])
    } catch (error) {
      console.error('Credits error:', error)
      toast.error('Failed to load credit balances')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })

      if (filterType !== 'all') {
        params.append('credit_type', filterType)
      }

      const res = await fetch(`/api/memberships/credits/transactions?${params}`)
      if (!res.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await res.json()
      setTransactions(data.data || [])
      setTotalTransactions(data.pagination?.total || 0)
    } catch (error) {
      console.error('Transactions error:', error)
      toast.error('Failed to load transaction history')
    }
  }

  const handleExport = () => {
    // Export transactions to CSV
    const csvContent = [
      ['Date', 'Type', 'Credit Type', 'Amount', 'Balance After', 'Description'],
      ...transactions.map((t) => [
        new Date(t.created_at).toLocaleDateString(),
        t.transaction_type,
        t.credit_type,
        t.amount,
        t.balance_after,
        t.description,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `credit-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('Transactions exported successfully')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Credits</h1>
          <p className="text-muted-foreground">
            View your credit balances and transaction history
          </p>
        </div>

        {/* Credit Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {credits.length === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">
                  No credits available. Subscribe to a membership to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            credits.map((credit) => (
              <CreditBalanceCard key={credit.type} credit={credit} />
            ))
          )}
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all credit allocations, usage, and expirations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              totalCount={totalTransactions}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onFilterChange={setFilterType}
              onExport={handleExport}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}