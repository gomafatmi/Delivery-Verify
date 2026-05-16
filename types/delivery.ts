export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "arrived"
  | "verified"
  | "completed"
  | "failed"
  | "disputed";

export interface Delivery {
  id: string;
  amazonOrderId: string;
  customerId: string;
  deliveryPersonId: string | null;
  productDescription: string;
  productValue: number;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  otpCode: string | null;
  status: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeliveryInput {
  amazonOrderId: string;
  customerId: string;
  productDescription: string;
  productValue: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
}
