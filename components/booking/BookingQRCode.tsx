/**
 * BookingQRCode Component
 * Generates and displays QR code for booking check-in
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, QrCode as QrCodeIcon } from 'lucide-react'
import QRCode from 'qrcode'

interface BookingQRCodeProps {
  confirmationCode: string
  bookingId: string
  size?: number
}

export function BookingQRCode({
  confirmationCode,
  bookingId,
  size = 256,
}: BookingQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrError, setQrError] = useState<string | null>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return

      try {
        // Generate QR code with booking data
        const qrData = JSON.stringify({
          type: 'citizenspace-booking',
          bookingId,
          confirmationCode,
          timestamp: Date.now(),
        })

        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2,
          color: {
            dark: '#1a1a1a',
            light: '#ffffff',
          },
        })
      } catch (error) {
        console.error('Error generating QR code:', error)
        setQrError('Failed to generate QR code')
      }
    }

    generateQRCode()
  }, [confirmationCode, bookingId, size])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `booking-${confirmationCode}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="h-5 w-5" />
          Check-in QR Code
        </CardTitle>
        <CardDescription>
          Scan this QR code when you arrive at the space
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          {qrError ? (
            <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{qrError}</p>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="rounded-lg border-2 border-muted"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <div className="text-center">
                <p className="font-mono text-lg font-bold">{confirmationCode}</p>
                <p className="text-sm text-muted-foreground">Confirmation Code</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDownload}
            disabled={!!qrError}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Show this QR code to staff upon arrival or enter the confirmation code manually
          </p>
        </div>
      </CardContent>
    </Card>
  )
}