// Booking Status Constants
export const BOOKING_STATUS = {
  PENDING_CONFIRMATION: 'pending_confirmation',
  RESERVATION_PAID: 'reservation_paid',
  HANDYMAN_ASSIGNED: 'handyman_assigned',
  VISIT_SCHEDULED: 'visit_scheduled',
  VISIT_COMPLETED_PENDING_QUOTE: 'visit_completed_pending_quote',
  QUOTE_PROVIDED_PENDING_ACCEPTANCE: 'quote_provided_pending_acceptance',
  QUOTE_ACCEPTED_PAYMENT_PENDING: 'quote_accepted_payment_pending',
  FULL_PAYMENT_RECEIVED: 'full_payment_received',
  SERVICE_COMPLETED: 'service_completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  ON_HOLD: 'on_hold'
} as const;

// Booking Status Labels (Spanish)
export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING_CONFIRMATION]: 'Pendiente de Confirmación',
  [BOOKING_STATUS.RESERVATION_PAID]: 'Reserva Pagada',
  [BOOKING_STATUS.HANDYMAN_ASSIGNED]: 'Técnico Asignado',
  [BOOKING_STATUS.VISIT_SCHEDULED]: 'Visita Programada',
  [BOOKING_STATUS.VISIT_COMPLETED_PENDING_QUOTE]: 'Visita Completada - Presupuesto Pendiente',
  [BOOKING_STATUS.QUOTE_PROVIDED_PENDING_ACCEPTANCE]: 'Presupuesto Enviado - Esperando Aprobación',
  [BOOKING_STATUS.QUOTE_ACCEPTED_PAYMENT_PENDING]: 'Presupuesto Aceptado - Pago Pendiente',
  [BOOKING_STATUS.FULL_PAYMENT_RECEIVED]: 'Pago Completo Recibido',
  [BOOKING_STATUS.SERVICE_COMPLETED]: 'Servicio Completado',
  [BOOKING_STATUS.CANCELLED]: 'Cancelado',
  [BOOKING_STATUS.REFUNDED]: 'Reembolsado',
  [BOOKING_STATUS.ON_HOLD]: 'En Espera'
} as const;

// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIAL: 'partial'
} as const;

// Payment Status Labels
export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pendiente',
  [PAYMENT_STATUS.COMPLETED]: 'Completado',
  [PAYMENT_STATUS.FAILED]: 'Fallido',
  [PAYMENT_STATUS.REFUNDED]: 'Reembolsado',
  [PAYMENT_STATUS.PARTIAL]: 'Parcial'
} as const;

// Payment Gateway Constants
export const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
} as const;

// Payment Gateway Labels
export const PAYMENT_GATEWAY_LABELS = {
  [PAYMENT_GATEWAYS.STRIPE]: 'Stripe',
  [PAYMENT_GATEWAYS.PAYPAL]: 'PayPal',
  [PAYMENT_GATEWAYS.BANK_TRANSFER]: 'Transferencia Bancaria',
  [PAYMENT_GATEWAYS.CASH]: 'Efectivo'
} as const;

// Payment Type Constants
export const PAYMENT_TYPES = {
  RESERVATION: 'reservation',
  FULL: 'full',
  BALANCE: 'balance'
} as const;

// Zone Type Constants
export const ZONE_TYPES = {
  POLYGON: 'polygon',
  CIRCLE: 'circle'
} as const;

// Pricing Type Constants
export const PRICING_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
} as const;

// Email Template Names
export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  PAYMENT_RECEIVED: 'payment_received',
  VISIT_SCHEDULED: 'visit_scheduled',
  QUOTE_PROVIDED: 'quote_provided',
  SERVICE_COMPLETED: 'service_completed',
  BOOKING_CANCELLED: 'booking_cancelled'
} as const;

// User Roles
export const USER_ROLES = {
  ROOT_ADMIN: 'root_admin',
  COMPANY_ADMIN: 'company_admin',
  MANAGER: 'manager',
  CLIENT: 'client',
  ASSISTANT: 'assistant'
} as const;