/**
 * Format Helpers
 * Helper functions for formatting data
 */

export const formatHelper = {
  formatCurrency: (value: number, currency: string = "USD", symbol?: string): string => {
    if (symbol) {
      return `${symbol}${value.toLocaleString()}`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  },

  formatTsh: (value: number): string => {
    return `Tsh${value.toLocaleString()}`;
  },

  formatDate: (date: Date | string, format: string = "short"): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: format as any,
    }).format(d);
  },

  formatDateTime: (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  },

  truncate: (text: string, length: number = 50): string => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },
};
