let matchedSessions = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Search page loaded");

  const button = document.getElementById("searchButton");
  if (button) {
    button.addEventListener("click", search);
  }

  // Click on a user to fetch feed using their cookies
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("result-item")) {
      const index = e.target.dataset.index;
      const session = matchedSessions[index];

      if (!session || !session.cookies) return;

      try {
        const res = await fetch("http://localhost:8000/get-feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: session.cookies.cookies }),
        });

        const feed = await res.json();
        console.log("🟢 Feed for:", session.auth_info_1 || session.auth_info_2);
        console.log(feed);
      } catch (err) {
        console.error("❌ Failed to fetch feed:", err);
      }
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
