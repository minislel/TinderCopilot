// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login");
  const keyInput = document.getElementById("key");
  const saveBtn = document.getElementById("save");
  const actions = document.getElementById("actions");
  const result = document.getElementById("result");
  document.getElementById("loginBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "login" }, (response) => {
      if (response.success) {
        console.log("Zalogowano z tokenem:", response.token);
      } else {
        console.log("Login failed :(");
      }
    });
  });

  chrome.storage.local.get("apiKey", ({ apiKey }) => {
    if (apiKey) {
      loginBtn.style.display = "none";
      actions.style.display = "block";
    }
  });

  saveBtn.onclick = () => {
    const key = keyInput.value.trim();
    if (key) {
      chrome.storage.local.set({ apiKey: key }, () => {
        loginBtn.style.display = "none";
        keyInput.style.display = "none";
        saveBtn.style.display = "none";
        actions.style.display = "block";
      });
    }
  };

  document.getElementById("testGen").onclick = () => {
    chrome.runtime
      .sendMessage({
        action: "generate",
        prompt: "Powiedz cześć w zabawny sposób",
      })
      .then((response) => {
        result.innerText = response;
      });
  };
});
