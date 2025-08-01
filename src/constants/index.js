// Export tất cả constants
export * from './api';

// App constants
export const APP_CONFIG = {
  APP_NAME: 'S7M Drive',
  VERSION: '1.0.0',
  DEVELOPER: 'S7M Team',

  // Colors
  COLORS: {
    PRIMARY: '#FF6B35',
    SECONDARY: '#FF8E53',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    INFO: '#2196F3',

    // Grayscale
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_LIGHT: '#F5F5F5',
    GRAY: '#999999',
    GRAY_DARK: '#333333',

    // Background
    BACKGROUND: '#F5F5F5',
    CARD_BACKGROUND: '#FFFFFF',

    // Text
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    TEXT_PLACEHOLDER: '#999999',
  },

  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },

  // Font sizes
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
  },

  // Border radius
  BORDER_RADIUS: {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
  },
};

// Order status mapping
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SHIPPER: 'shipper',
};

// Payment methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
};

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_UPDATED: 'order_updated',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
};

export default APP_CONFIG;
