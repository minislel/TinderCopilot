document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("apiKeyInput");
  const status = document.getElementById("status");
  const saveBtn = document.getElementById("saveBtn");

  chrome.storage.sync.get("geminiKey", ({ geminiKey }) => {
    if (geminiKey) input.value = geminiKey;
  });

  saveBtn.addEventListener("click", () => {
    const key = input.value.trim();
    if (!key) {
      status.textContent = "❌ Podaj klucz!";
      return;
    }

    chrome.storage.sync.set({ geminiKey: key }, (key) => {
      status.textContent = "✅ Klucz zapisany!!!!";
      status.textContent = key;
    });
  });
});
