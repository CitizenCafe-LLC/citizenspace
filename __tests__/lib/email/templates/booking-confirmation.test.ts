/**
 * Booking Confirmation Email Template Tests
 * Tests booking confirmation email generation
 */

import {
  generateBookingConfirmationHTML,
  generateBookingConfirmationText,
} from '@/lib/email/templates/booking-confirmation'
import type { BookingConfirmationData } from '@/lib/email/templates/booking-confirmation'

describe('Booking Confirmation Email Template', () => {
  const mockData: BookingConfirmationData = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    bookingId: 'booking-123',
    confirmationCode: 'CONF-ABC123',
    workspaceName: 'Hot Desk A1',
    workspaceType: 'desk',
    date: '2025-10-15',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    duration: '8 hours',
    totalPrice: 120.0,
    amenities: ['WiFi', 'Power Outlet', 'Monitor'],
  }

  describe('generateBookingConfirmationHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Booking Confirmed')
    })

    it('should include customer name', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('John Doe')
      expect(html).toContain('Hi John Doe')
    })

    it('should include confirmation code prominently', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('CONF-ABC123')
      expect(html).toContain('Confirmation Code')
    })

    it('should include workspace details', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('Hot Desk A1')
      expect(html).toContain('desk')
    })

    it('should include booking date and time', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('2025-10-15')
      expect(html).toContain('09:00 AM')
      expect(html).toContain('05:00 PM')
      expect(html).toContain('8 hours')
    })

    it('should include total price formatted', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('$120.00')
    })

    it('should include amenities list', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('WiFi')
      expect(html).toContain('Power Outlet')
      expect(html).toContain('Monitor')
      expect(html).toContain('Included Amenities')
    })

    it('should not show amenities section when empty', () => {
      const dataWithoutAmenities = {
        ...mockData,
        amenities: undefined,
      }

      const html = generateBookingConfirmationHTML(dataWithoutAmenities)

      expect(html).not.toContain('Included Amenities')
    })

    it('should include special requests when provided', () => {
      const dataWithRequests = {
        ...mockData,
        specialRequests: 'Need standing desk and extra monitor',
      }

      const html = generateBookingConfirmationHTML(dataWithRequests)

      expect(html).toContain('Special Requests')
      expect(html).toContain('Need standing desk and extra monitor')
    })

    it('should not show special requests section when not provided', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).not.toContain('Special Requests')
    })

    it('should include QR code when provided', () => {
      const dataWithQR = {
        ...mockData,
        qrCodeUrl: 'https://example.com/qr/booking-123.png',
      }

      const html = generateBookingConfirmationHTML(dataWithQR)

      expect(html).toContain('qr/booking-123.png')
      expect(html).toContain('Quick Check-In QR Code')
      expect(html).toContain('Show this QR code')
    })

    it('should not show QR code section when not provided', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).not.toContain('Quick Check-In QR Code')
    })

    it('should include check-in instructions', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('Check-In Instructions')
      expect(html).toContain('Arrive 5-10 minutes')
      expect(html).toContain('confirmation code')
    })

    it('should include custom check-in instructions when provided', () => {
      const dataWithInstructions = {
        ...mockData,
        checkInInstructions: 'Custom instructions here',
      }

      const html = generateBookingConfirmationHTML(dataWithInstructions)

      expect(html).toContain('Custom instructions here')
      expect(html).not.toContain('Arrive 5-10 minutes')
    })

    it('should include CTA to view booking details', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('View Booking Details')
      expect(html).toContain('/bookings/booking-123')
    })

    it('should include support contact info', () => {
      const html = generateBookingConfirmationHTML(mockData)

      expect(html).toContain('support@citizenspace.com')
      expect(html).toContain('(555) 123-4567')
    })

    it('should handle different workspace types', () => {
      const roomBooking: BookingConfirmationData = {
        ...mockData,
        workspaceType: 'room',
        workspaceName: 'Conference Room B',
      }

      const html = generateBookingConfirmationHTML(roomBooking)

      expect(html).toContain('Conference Room B')
      expect(html).toContain('room')
    })

    it('should handle pod workspace type', () => {
      const podBooking: BookingConfirmationData = {
        ...mockData,
        workspaceType: 'pod',
        workspaceName: 'Privacy Pod 5',
      }

      const html = generateBookingConfirmationHTML(podBooking)

      expect(html).toContain('Privacy Pod 5')
      expect(html).toContain('pod')
    })
  })

  describe('generateBookingConfirmationText', () => {
    it('should generate plain text email', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('Booking Confirmed')
      expect(text).toContain('John Doe')
    })

    it('should include all booking details', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('CONF-ABC123')
      expect(text).toContain('Hot Desk A1')
      expect(text).toContain('desk')
      expect(text).toContain('2025-10-15')
      expect(text).toContain('09:00 AM')
      expect(text).toContain('05:00 PM')
      expect(text).toContain('$120.00')
    })

    it('should include amenities list in text format', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('INCLUDED AMENITIES')
      expect(text).toContain('- WiFi')
      expect(text).toContain('- Power Outlet')
      expect(text).toContain('- Monitor')
    })

    it('should not include amenities section when empty', () => {
      const dataWithoutAmenities = {
        ...mockData,
        amenities: undefined,
      }

      const text = generateBookingConfirmationText(dataWithoutAmenities)

      expect(text).not.toContain('INCLUDED AMENITIES')
    })

    it('should include special requests in text format', () => {
      const dataWithRequests = {
        ...mockData,
        specialRequests: 'Need standing desk',
      }

      const text = generateBookingConfirmationText(dataWithRequests)

      expect(text).toContain('SPECIAL REQUESTS')
      expect(text).toContain('Need standing desk')
    })

    it('should include QR code URL when provided', () => {
      const dataWithQR = {
        ...mockData,
        qrCodeUrl: 'https://example.com/qr/booking-123.png',
      }

      const text = generateBookingConfirmationText(dataWithQR)

      expect(text).toContain('QR CODE FOR CHECK-IN')
      expect(text).toContain('https://example.com/qr/booking-123.png')
    })

    it('should include check-in instructions', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('CHECK-IN INSTRUCTIONS')
      expect(text).toContain('Arrive 5-10 minutes')
    })

    it('should include custom check-in instructions when provided', () => {
      const dataWithInstructions = {
        ...mockData,
        checkInInstructions: 'Custom text instructions',
      }

      const text = generateBookingConfirmationText(dataWithInstructions)

      expect(text).toContain('Custom text instructions')
    })

    it('should include booking details URL', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('View Booking Details')
      expect(text).toContain('/bookings/booking-123')
    })

    it('should include support contact info', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('support@citizenspace.com')
      expect(text).toContain('(555) 123-4567')
    })

    it('should format text with proper sections', () => {
      const text = generateBookingConfirmationText(mockData)

      expect(text).toContain('BOOKING DETAILS')
      expect(text).toContain('---------------')
    })
  })
})