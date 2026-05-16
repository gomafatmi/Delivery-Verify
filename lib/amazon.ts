export interface AmazonOrder {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  productDescription: string;
  productValue: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  otpCode: string;
}

export interface AmazonWebhookPayload {
  event: "delivery_assigned" | "delivery_status" | "dispute_opened";
  orderId: string;
  data: Record<string, unknown>;
}

export async function fetchOrderFromAmazon(
  amazonOrderId: string
): Promise<AmazonOrder> {
  const baseUrl = process.env.AMAZON_API_BASE_URL ?? "https://api.amazon.com";
  const response = await fetch(
    `${baseUrl}/delivery-orders/${amazonOrderId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AMAZON_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Amazon API error: ${response.status}`);
  }
  return response.json() as Promise<AmazonOrder>;
}

export async function notifyAmazonDeliveryComplete(
  amazonOrderId: string,
  verificationId: string
): Promise<void> {
  const baseUrl = process.env.AMAZON_API_BASE_URL ?? "https://api.amazon.com";
  await fetch(`${baseUrl}/delivery-orders/${amazonOrderId}/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AMAZON_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verificationId, status: "completed" }),
  });
}
