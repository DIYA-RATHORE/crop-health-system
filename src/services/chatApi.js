// Helper to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a chat message to the backend. Currently returns mock responses,
 * but is structured to easily connect to a FastAPI endpoint in the future.
 * 
 * @param {string} message - The user's input message.
 * @returns {Promise<{text: string}>} - The chatbot response wrapper object.
 */
export async function sendChatMessage(message) {
  // Simulate network latency (800ms)
  await delay(800);

  const cleanMessage = message.trim().toLowerCase();

  // Match predefined suggested questions
  if (cleanMessage.includes("what is wrong with my crop")) {
    return {
      text: "I can help check your crop. Upload a crop photo using 'Check My Crop' and our crop analysis system can identify possible diseases or pests."
    };
  }

  if (cleanMessage.includes("check my crop risk")) {
    return {
      text: "I can check the crop risk using your crop condition, location, weather and previous crop reports."
    };
  }

  if (cleanMessage.includes("show my latest crop report")) {
    // Check if there's any actual scan report in local storage to make it feel premium
    try {
      const historyStr = localStorage.getItem("crop_health_system_history");
      if (historyStr) {
        const history = JSON.parse(historyStr);
        if (history && history.length > 0) {
          const latest = history[0];
          return {
            text: `Your latest report shows: Crop: ${latest.crop}, Disease detected: ${latest.disease} (${latest.confidence}% confidence), Severity: ${latest.severity}, Risk: ${latest.risk}. Advice: ${latest.advice.join(" ")}`
          };
        }
      }
    } catch (e) {
      console.error("Error reading crop history", e);
    }
    
    // Default mock response as per requirements
    return {
      text: "Your latest report will appear here once you complete a crop check."
    };
  }

  if (cleanMessage.includes("give me crop advice")) {
    return {
      text: "Tell me which crop you are growing, or check your crop first so I can give more useful advice."
    };
  }

  // Fallback for custom user questions
  return {
    text: `Thanks for asking about "${message}"! I am currently running in mock mode. Once connected to our FastAPI AI backend, I will analyze your crop database, location sensors, and local weather patterns to provide customized agricultural guidance.`
  };
}
