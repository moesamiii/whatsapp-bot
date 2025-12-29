export default async function handler(req, res) {
  // Verify webhook
  if (req.method === "GET") {
    const verifyToken = "MY_VERIFY_TOKEN";

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  // Receive messages
  if (req.method === "POST") {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages?.length) {
      const message = messages[0];
      const from = message.from;
      const text = message.text?.body?.toLowerCase();

      if (text === "hi") {
        await sendWhatsAppMessage(from, "Hello 👋 How can I help you?");
      }
    }

    return res.status(200).json({ status: "ok" });
  }

  res.status(405).send("Method Not Allowed");
}

async function sendWhatsAppMessage(to, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: message },
    }),
  });
}
