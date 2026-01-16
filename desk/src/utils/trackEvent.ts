/**
 * Event tracking utility
 * Sends analytics events to the API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface TrackEventOptions {
  eventType: string
  eventData?: string
}

/**
 * Track an event by sending it to the API.
 * This is fire-and-forget - errors are logged but not thrown.
 */
export function trackEvent({ eventType, eventData }: TrackEventOptions): void {
  fetch(`${API_BASE}/slurp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: eventType,
      event_data: eventData,
    }),
  }).catch((error) => {
    // Silently log errors - we don't want tracking to affect user experience
    console.debug('Event tracking failed:', error)
  })
}
