chrome.runtime.onInstalled.addListener(() => {
  console.log("Rozszerzenie gotowe do boju 💪");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "login") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Nie działa 😭", chrome.runtime.lastError);
        sendResponse({ success: false });
      } else {
        console.log("Mamy tokenik 🔑", token);
        sendResponse({ success: true, token });
      }
    });
    return true; // bo async
  }
});
