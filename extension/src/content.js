console.log("📌 content.js injected");

// Only run if on X home
if (location.hostname === "x.com" && location.pathname === "/home") {
  console.log("✅ Injecting dropdown on X Home");

  // === DROPDOWN CONTAINER ===
  const container = document.createElement("div");
  container.id = "xfeed-user-dropdown";
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.zIndex = "999999";
  container.style.backgroundColor = "#fff";
  container.style.padding = "8px";
  container.style.borderRadius = "6px";
  container.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.2)";
  container.style.fontSize = "14px";
  container.style.color = "#000";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.border = "2px solid red";

  const label = document.createElement("label");
  label.textContent = "👤 Switch Feed: ";
  label.style.marginRight = "5px";
  container.appendChild(label);

  const select = document.createElement("select");
  select.id = "xfeed-dropdown";
  select.innerHTML = `<option value="default">Your Feed</option>`;
  container.appendChild(select);
  document.body.appendChild(container);

  // === FETCH USERS FROM STORAGE ===
  chrome.storage.local.get(["userSessions"], (result) => {
    const users = result.userSessions || [];
    if (users.length === 0) {
      console.log("ℹ️ No stored user sessions found.");
      return;
    }

    users.forEach((user, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = user.auth_info || `User ${index + 1}`;
      select.appendChild(option);
    });

    console.log("✅ Dropdown populated with users:", users.map(u => u.auth_info));
  });

  // === ON DROPDOWN CHANGE ===
  select.addEventListener("change", async (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "default") {
      removeInjectedFeed();
      restoreRealFeed();
      return;
    }

    chrome.storage.local.get(["userSessions"], async (result) => {
      const users = result.userSessions || [];
      const selectedUser = users[selectedIndex];
      if (!selectedUser) return;

      try {
        const res = await fetch("http://localhost:8000/get-feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: selectedUser.cookies }),
        });

        const data = await res.json();
        console.log("🟢 Feed fetched for:", selectedUser.auth_info);
        console.log(data);

        hideRealFeed();
        renderMockFeed(data);
      } catch (err) {
        console.error("❌ Failed to fetch feed:", err);
      }
    });
  });

  // === FEED RENDER FUNCTION ===
  function renderMockFeed(feed) {
    removeInjectedFeed(); // Clean previous

    const feedWrapper = document.createElement("div");
    feedWrapper.id = "xfeed-mock-feed";
    feedWrapper.style.position = "fixed";
    feedWrapper.style.top = "70px";
    feedWrapper.style.left = "0";
    feedWrapper.style.width = "100%";
    feedWrapper.style.maxHeight = "90vh";
    feedWrapper.style.overflowY = "auto";
    feedWrapper.style.padding = "10px 40px";
    feedWrapper.style.backgroundColor = "#f5f5f5";
    feedWrapper.style.zIndex = "999999";
    feedWrapper.style.fontFamily = "Arial, sans-serif";

    feed.forEach(tweet => {
      const tweetDiv = document.createElement("div");
      tweetDiv.style.border = "1px solid #ccc";
      tweetDiv.style.background = "#fff";
      tweetDiv.style.padding = "12px";
      tweetDiv.style.marginBottom = "10px";
      tweetDiv.style.borderRadius = "8px";
      tweetDiv.innerHTML = `
        <strong>@${tweet.handle}</strong> — <em>${tweet.created_at}</em><br>
        <p>${tweet.text}</p>
        <small>❤️ ${tweet.likes} | 🔁 ${tweet.retweets} | 💬 ${tweet.replies}</small>
      `;
      feedWrapper.appendChild(tweetDiv);
    });

    document.body.appendChild(feedWrapper);
  }

  // === CLEANER ===
  function removeInjectedFeed() {
    const existing = document.getElementById("xfeed-mock-feed");
    if (existing) existing.remove();
  }

  function hideRealFeed() {
    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (realFeed) realFeed.style.display = "none";
  }

  function restoreRealFeed() {
    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (realFeed) realFeed.style.display = "block";
  }

} else {
  console.log("🚫 Not on X Home, skipping dropdown injection");
}
