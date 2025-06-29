let matchedSessions = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Search page loaded");

  const button = document.getElementById("searchButton");
  if (button) {
    button.addEventListener("click", search);
  }

  // Store clicked user’s cookies in browser storage instead of calling /get-feed
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("result-item")) {
      const index = e.target.dataset.index;
      const session = matchedSessions[index];
      if (!session || !session.cookies) return;

      const username = session.auth_info_1 || session.auth_info_2;
      const cookieData = {
        auth_info: username,
        cookies: session.cookies.cookies, // flattening `cookies.cookies` for consistency
      };

      // Get existing stored users from Chrome local storage
      chrome.storage.local.get(["userSessions"], (result) => {
        const existing = result.userSessions || [];
        // Avoid duplicates
        const isDuplicate = existing.some((u) => u.auth_info === username);
        if (!isDuplicate) {
          existing.push(cookieData);
          chrome.storage.local.set({ userSessions: existing }, () => {
            console.log("✅ Stored user in browser:", username);
            document.getElementById(
              "saveStatus"
            ).textContent = `Saved session for "${username}"`;
          });
        } else {
          console.log("ℹ️ User already exists in storage:", username);
          document.getElementById(
            "saveStatus"
          ).textContent = `User already exists in storage:"${username}"`;
        }
      });
    }
  });
});

async function search() {
  const input = document.getElementById("searchInput").value.trim();
  if (!input) return;

  document.getElementById("infoText").style.display = "none";
  document.getElementById("results").innerHTML = "🔄 Searching...";

  try {
    const res = await fetch("http://localhost:8000/match-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth_info_1: input, auth_info_2: input }),
    });

    const data = await res.json();

    if (!data.matches || data.matches.length === 0) {
      document.getElementById("results").innerHTML = "❌ No matches found.";
      return;
    }

    matchedSessions = data.matches;

    const html = matchedSessions
      .map((entry, index) => {
        const id = entry.auth_info_1 || entry.auth_info_2;
        return `<div class="result-item" data-index="${index}">${id}</div>`;
      })
      .join("");

    document.getElementById("results").innerHTML = html;
  } catch (error) {
    document.getElementById("results").innerHTML = "❌ Error fetching results.";
    console.error("❌ Fetch error:", error);
  }
}
