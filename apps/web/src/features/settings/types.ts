/**
 * Restaurant settings types — safe for client + server.
 */

export type RestaurantSettings = {
  displayName: string;
  kitchenPhone: string;
  kitchenWhatsappE164: string;
  hoursText: string;
  deliveryFeeIqd: number;
};
