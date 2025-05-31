import config from "@/config";

/**
 * Click Logger Utility
 * 
 * Sends user interaction logs to the server for analytics purposes.
 * The session ID is generated at runtime and is reused across all logged events.
 */

const sessionId = Date.now().toString();
const API_URL = `${config.API_BASE_URL}/data/log-click`;

/**
 * Logs a user interaction event to the backend.
 *
 * @param {string} eventType - Type of event (e.g., "click").
 * @param {string} component - Name or description of the component interacted with.
 */

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
