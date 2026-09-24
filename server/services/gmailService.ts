/**
 * Gmail service handling RFC 2822 formatting, Base64url encoding,
 * and direct calls to Google's Gmail API.
 */

export function encodeEmailMessage(to: string, subject: string, body: string): string {
  const utf8Subject = subject
    ? `=?utf-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`
    : "";

  const headers = [
    to ? `To: ${to}` : "",
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
  ].filter(Boolean);

  const normalizedBody = (body || "").replace(/\r?\n/g, "\r\n");
  const rawMessage = `${headers.join("\r\n")}\r\n\r\n${normalizedBody}`;

  return Buffer.from(rawMessage, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmailMessage(token: string, to: string, subject: string, body: string) {
  const encoded = encodeEmailMessage(to, subject, body);

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || "Échec de l'envoi via Gmail";
    const status = response.status;
    const error: any = new Error(message);
    error.status = status;
    error.isAuthError = status === 401;
    throw error;
  }

  return response.json();
}

export async function createGmailDraft(token: string, to: string, subject: string, body: string) {
  const encoded = encodeEmailMessage(to, subject, body);

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: { raw: encoded },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || "Échec de la création du brouillon Gmail";
    const status = response.status;
    const error: any = new Error(message);
    error.status = status;
    error.isAuthError = status === 401;
    throw error;
  }

  return response.json();
}
