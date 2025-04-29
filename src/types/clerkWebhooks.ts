// types/clerkWebhooks.ts
export interface ClerkWebhookEventData {
  id: string;
  email_addresses: { email_address: string }[];
  first_name?: string;
  last_name?: string;
  image_url?: string;
  object: string; // Can be "user"
}

export interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkWebhookEventData;
  event_attributes?: {
    http_request?: {
      client_ip: string;
      user_agent: string;
    };
  };
}
