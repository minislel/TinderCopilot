let GEMINI_API_KEY = "Dude... Its cringe dude...";
// chrome.storage.local.get("geminiKey", (result) => {
//   if (!result.geminiKey) {
//     console.error("🔐 Klucza brak! Idź do popupu i ustaw!");
//     return;
//   }

//   GEMINI_API_KEY = result.geminiKey;
//   console.log("🔑 Globalny klucz ustawiony:", GEMINI_API_KEY);

//   // Możesz tutaj zawołać jakąś funkcję, która potrzebuje klucza
//   // np. autoFetchSomething();
// });

async function getProfile(id) {
  try {
    const res = await fetch(`https://api.gotinder.com/user/${id}`, {
      headers: {
        "X-Auth-Token": localStorage.getItem("TinderWeb/APIToken"),
        platform: "android",
      },
    });

    if (!res.ok) {
      console.warn(`Tinder API zwróciło ${res.status}`);
      return false;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Błąd w getProfile:", err);
    return false;
  }
}

console.log("👀 Tinder Copilot patrzy na twoje wiadomości...");

async function parseMessages(format) {
  const selectorSender = [
    ".msg",
    ".BreakWord",
    ".D\\(ib\\)",
    ".Ta\\(start\\)",
    ".Us\\(t\\)",
    ".Pos\\(r\\)",
    ".Whs\\(pw\\)",
    ".Va\\(m\\)",
    ".Maw\\(100\\%\\)",
    ".C\\(\\$c-ds-text-chat-bubble-send\\)",
    ".Px\\(12px\\)",
    ".Py\\(10px\\)",
  ].join("");

  const selectorPartner = [
    ".msg",
    ".BreakWord",
    ".D\\(ib\\)",
    ".Ta\\(start\\)",
    ".Us\\(t\\)",
    ".Pos\\(r\\)",
    ".Whs\\(pw\\)",
    ".Va\\(m\\)",
    ".Maw\\(100\\%\\)",
    ".C\\(\\$c-ds-text-chat-bubble-receive\\)",
    ".msg--received",
    ".Op\\(1\\)",
    ".Trsp\\(\\$opacity\\)",
    ".Trsdu\\(\\$fast\\)",
    ".Trsde\\(\\$normal\\)",
    ".Px\\(12px\\)",
    ".Py\\(10px\\)",
  ].join("");

  // pobieramy NodeList’y
  const msgsSender = Array.from(document.querySelectorAll(selectorSender));
  const msgsPartner = Array.from(document.querySelectorAll(selectorPartner));

  // łączymy w jedną tablicę z metadanymi
  const fullMatchId = window.location.pathname.split("/").pop(); // bierzemy ostatni fragment URL
  const userId = fullMatchId.substring(0, 24); // klasyczny ObjectId ma 24 znaki

  const profile = await getProfile(userId);

  const allMsgs = [
    ...msgsSender.map((el) => ({ sender: "you", text: el.innerText, el })),
    ...msgsPartner.map((el) => ({
      sender: profile?.results?.name || "partner",
      text: el.innerText,
      el,
    })),
  ];

  // sortujemy wg. kolejności w DOM
  allMsgs.sort((a, b) => {
    // jeśli a jest wcześniej w DOM niż b, zwróć -1
    if (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
    return -1;
  });
  allMsgs.forEach((msg, index) => {
    msg.index = index;
  });

  console.log("AAA");
  if (format == "JSON") {
    return allMsgs;
  }
  return allMsgs.map(({ index, sender, text }) => ({ index, sender, text }));
}
function addPrompt(dest, role, content) {
  dest.contents.push({
    role: role,
    parts: [
      {
        text: content,
      },
    ],
  });
}
async function generateNextMessage() {
  const fullMatchId = window.location.pathname.split("/").pop(); // bierzemy ostatni fragment URL
  const userId = fullMatchId.substring(0, 24); // klasyczny ObjectId ma 24 znaki

  const profile = await getProfile(userId);
  console.log(profile);
  const messages = await parseMessages("JSON");
  console.log(messages);
  console.log(typeof messages);

  let prompt = { contents: [] };
  if (messages.length == 0) {
    addPrompt(
      prompt,
      "user",
      `    Zaczynasz rozmowę na tinderze. Wymyśl ciekawą pierwszą wiadomość.
    TYLKO WIADOMOŚĆ, nic więcej, zadnych swoich przemyśleń, żadnego [tu wstaw...] ani nic. 
    Wiadomość ma być gotowa do wysłania w takiej formie, jaką ją prześlesz
    Postaraj się, by brzmiała ludzko, a nie jak wygenerowana przez AI.
    Ma być luźna, niech ma w sobie nutkę pikanterii"`
    );
  } else {
    addPrompt(
      prompt,
      "user",
      `  Prowadzisz rozmowę na tinderze,
Dodaj nową, kreatywną wiadomość jako kontynuację tej rozmowy na tinderze. 
    TYLKO WIADOMOŚĆ, nic więcej, zadnych swoich przemyśleń, żadnego [tu wstaw...] ani nic. 
    Wiadomość ma być gotowa do wysłania w takiej formie, jaką ją prześlesz
Postaraj się, by brzmiała ludzko, a nie jak wygenerowana przez AI.
Ma być luźna.
Jeżeli nie odpisał na poprzednią wiadomość to wymyśl coś, by przyciągnąć jego uwagę.
Zanim wyślesz odpowiedź, zastanów się czy jest "Rizzowa" i czy poleciałbyś na to.
Niech twoja wiadomość ma w sobie nutkę pikanterii
`
    );
  }
  if (profile) {
    let userInfo = ``;
    console.log("dd");
    userInfo += `Imię rozmówcy: ${profile.results.name} `;
    if (profile.results?.bio)
      userInfo += `Opis rozmówcy: ${profile.results?.bio} `;
    if (profile.results?.jobs)
      userInfo += `Rozmówca pracuje w: ${profile.results?.jobs}`;
    if (profile.results?.user_interests?.selected_interests) {
      for (const z of profile.results?.user_interests?.selected_interests) {
        userInfo += `Rozmówca interesuje się: ${z.name}, `;
      }
    }
    if (profile.results?.selected_descriptors) {
      for (const el of profile.results?.selected_descriptors) {
        if (
          el.name &&
          el.choice_selections[0].name &&
          el.choice_selections[0].name != "undefined"
        ) {
          userInfo += `Dodatkowe informacje o Rozmówcy: ${el.name}: ${el.choice_selections[0].name}, `;
        }
      }
    }
    addPrompt(prompt, "user", "Dodatkowe informacje o rozmówcy: " + userInfo);
  }
  addPrompt(prompt, "user", `Oto historia wiadomości: ${messages}`);

  console.log(prompt);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    }
  );

  if (!res.ok) {
    console.error("❌ Błąd przy odpytywaniu Gemini:", await res.text());

    return null;
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("🤖 Gemini mówi:", reply);
  return reply;
}
async function EvaluateMessages() {
  const messages = await parseMessages("JSON");

  const prompt = { contents: [] };

  addPrompt(prompt, "user", JSON.stringify(messages));
  // for (const el of messages) {
  //   prompt.contents.push({
  //     role: el.sender,
  //     parts: {
  //       text: el.text,
  //     },
  //   });
  // }
  addPrompt(
    prompt,
    "user",
    `Oceniasz powyższe wiadomości na tinderze. "you" to rozmówca1, "partner" to rozmówca2
Do każdej z wiadomości daj ocenę, jak bardzo dana wiadomość jest "Rizzowa", bierz pod uwagę kontekst całej rozmowy
Oceny mają być stylu ewaluacji chess.com, np blunder, brilliant move, book move itp. itd. w formacie '"0":["Blunder", "bardzo krótkie uzasadnienie oceny, w kilku słowach"], "1":["Book Move", "uzasadnienie"]...' gdzie "1" to indeks wiadomosci. 
Oto lista poprawnych ocen posortowana od najlepszej do najgorszej oceny:
"Brilliant"
"Best Move"
"Excellent"
"Good"
"Book Move"
"Inaccuracy"
"Mistake"
"Blunder"
Nie dodawaj swoich przemyśleń, ani niczego więcej, odpowiedź ma zawierać tylko i wyłącznie wskazany format. Oceń KAŻDĄ wiadomość od pierwszej do ostatniej. Oceny prześlij w prawidłowym formacie JSON`
  );

  console.log(prompt);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    }
  );
  if (!res.ok) {
    console.error("❌ Błąd przy odpytywaniu Gemini:", await res.text());

    return null;
  }

  const data = await res.json();
  let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log(reply);
  ApplyEvaluation(reply);
  return reply;
}
async function ApplyEvaluation(evals) {
  console.log(evals);
  evaluations = JSON.parse(evals.slice(7, -4));
  const messages = await parseMessages("JSON");
  console.log(messages);
  console.log(evaluations);
  messages.forEach(({ index, el, sender }) => {
    const verdict = evaluations[index][0];
    console.log(verdict);
    if (!verdict) return;
    const iconMap = {
      Brilliant: "✨",
      "Brilliant Move": "✨",
      "Great Move": "🔥",
      "Book Move": "📘",
      "Good Move": "👍",
      Good: "👍",
      Inaccuracy: "😬",
      Mistake: "❌",
      Blunder: "💀",
    };
    const emoji = iconMap[verdict] || "🤔";
    // Sprawdź, czy już jest ikona
    if (el.querySelector(".eval-icon")) return;

    const span = document.createElement("span");
    span.className = "eval-icon";
    span.textContent = emoji;
    span.title = evaluations[index][1];
    span.style.display = "inline-flex";
    span.style.alignItems = "center";
    span.style.justifyContent = "center";
    span.style.width = "1.7em";
    span.style.height = "1.7em";
    span.style.fontSize = "1.3em";
    span.style.backgroundColor = "#222";
    span.style.borderRadius = "50%";
    span.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
    span.style.cursor = "pointer";
    span.style.position = "absolute";
    span.style.top = "50%";
    span.style.transform = "translateY(-50%)";
    if (sender == "you") {
      span.style.left = "-4.8em";
      span.style.right = "";
    } else {
      span.style.right = "-4.8em";
      span.style.left = "";
    }

    // Ustaw pozycjonowanie rodzica
    el.style.position = "relative";

    // Dodaj ikonę do głównego kontenera wiadomości
    el.appendChild(span);
  });
}
window.addEventListener("load", () => {
  const czatContainer =
    document.querySelector('[aria-label="Conversation history"]') ||
    document.body;

  if (!czatContainer) {
    console.error("😬 Nie znaleziono kontenera na wiadomości!");
    return;
  }

  console.log("👀 Obserwuję zmiany w czacie...");

  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" || mutation.type === "subtree") {
        console.log("🔥 Zmiana czatu wykryta!");
        if (!document.querySelector(".rizzButton")) {
          placed = placeButtons();
          if (placed) {
            console.log("❤️‍🔥Rizz buttons placed!");
          }
        }
        break;
      }
    }
  });

  observer.observe(czatContainer, {
    childList: true,
    subtree: true,
  });

  console.log("🔧 Observer odpalony!");
});
// użycie
function placeButtons() {
  const classes = `button Lts($ls-s) Z(0) CenterAlign Mx(a) Cur(p) Tt(u) Ell Bdrs(100px) Px(24px) Px(20px)--s Py(0) Mih(40px) Pos(r) Ov(h) C(#fff) Bg($c-pink):h::b Bg($c-pink):f::b Bg($c-pink):a::b Trsdu($fast) Trsp($background) Bg($g-ds-background-brand-gradient) button--primary-shadow StyledButton Bxsh($bxsh-btn) Fw($semibold) focus-button-style Mb(16px) As(fe) `;
  const selector = [
    ".Bgc\\(\\$c-ds-background-primary\\)",
    ".Pos\\(r\\)",
    ".D\\(f\\)",
    ".Fx\\(\\$flx1\\)",
    ".Bdstartw\\(0\\)",
    ".Mih\\(72px\\)--ml",
    ".Pend\\(24px\\)--ml",
  ].join("");
  const chatBox = document.querySelector(selector);
  if (!chatBox) {
    console.log("nie udalo sie postawic buttona");
    return false;
  }

  const btnEvaluate = document.createElement("span");
  btnEvaluate.textContent = "Evaluate Messages";
  btnEvaluate.classList += classes;
  btnEvaluate.classList += "evaluateButton";
  btnEvaluate.style.marginLeft = "3px";
  btnEvaluate.style.marginRight = "3px";
  btnEvaluate.onclick = async () => {
    console.log("Evaluating...");
    await EvaluateMessages();
    return false;
  };
  const btn = document.createElement("span");
  btn.classList += classes;
  btn.classList += "rizzButton";
  btn.textContent = "Rizz me";
  btn.onclick = async () => {
    const reply = await generateNextMessage();
    const input = document.querySelector("textarea");
    if (input) {
      input.value = reply;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return false;
  };
  chatBox.appendChild(btnEvaluate);
  chatBox.appendChild(btn);
  return true;
}
