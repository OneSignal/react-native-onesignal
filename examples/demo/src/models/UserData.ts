export interface UserData {
  aliases: Record<string, string>;
  tags: Record<string, string>;
  emails: string[];
  smsNumbers: string[];
  externalId?: string;
}

export function userDataFromJson(json: Record<string, unknown>): UserData {
  const identity = (json.identity as Record<string, string>) ?? {};
  const properties = (json.properties as Record<string, unknown>) ?? {};
  const subscriptions = (json.subscriptions as Array<Record<string, unknown>>) ?? [];

  const aliases: Record<string, string> = {};
  for (const [key, value] of Object.entries(identity)) {
    if (key !== "external_id" && key !== "onesignal_id") {
      aliases[key] = String(value);
    }
  }

  const tags = (properties.tags as Record<string, string>) ?? {};

  const emails: string[] = [];
  const smsNumbers: string[] = [];
  for (const sub of subscriptions) {
    const token = sub.token;
    if (typeof token !== "string") continue;
    if (sub.type === "Email") {
      emails.push(token);
    } else if (sub.type === "SMS") {
      smsNumbers.push(token);
    }
  }

  return {
    aliases,
    tags,
    emails,
    smsNumbers,
    externalId: identity.external_id,
  };
}
