export default async function handler(req, res) {
  // =========================
  // 1️⃣ WEBHOOK VERIFICATION (GET)
  // =========================
  if (req.method === "GET") {
    const challenge = req.query["hub.challenge"];

    if (challenge) {
      console.log("Webhook verification challenge:", challenge);
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Forbidden");
  }

  // =========================
  // 2️⃣ RECEIVE MESSAGES (POST)
  // =========================
  if (req.method === "POST") {
    try {
      const entry = req.body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const text = message.text?.body?.trim().toLowerCase();

        console.log("Incoming message:", text);

        if (text === "hi") {
          await sendWhatsAppMessage(from, "Hello 👋 How can I help you?");
        }
      }

      return res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).send("Method Not Allowed");
}

// =========================
// 3️⃣ SEND MESSAGE FUNCTION
// =========================
async function sendWhatsAppMessage(to, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: {
        body: message,
      },
    }),
  });
}
