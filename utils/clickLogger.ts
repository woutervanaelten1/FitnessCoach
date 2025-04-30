import config from "@/config";

const sessionId = Date.now().toString();
const API_URL = `${config.API_BASE_URL}/data/log-click`;

export async function logClick(eventType: string, component: string) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: eventType,
        component,
      }),
    });
  } catch (error) {
    console.error("Failed to send click log:", error);
  }
}
