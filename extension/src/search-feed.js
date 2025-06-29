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

        renderMockFeed(data);
      } catch (err) {
        console.error("❌ Failed to fetch feed:", err);
      }
    });
  });

  // === FEED RENDER FUNCTION (Optimized) ===
  function renderMockFeed(feed) {
    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (!realFeed) {
      console.warn("⚠️ Could not find Twitter feed container.");
      return;
    }

    // Clear existing feed
    realFeed.innerHTML = "";

    const feedWrapper = document.createElement("div");
    feedWrapper.style.padding = "10px";
    feedWrapper.style.fontFamily = "Arial, sans-serif";
    feedWrapper.style.backgroundColor = "#f5f5f5";

    // Cap to 30 tweets
    const fragment = document.createDocumentFragment();
    const tweetsToRender = feed.slice(0, 30);

    tweetsToRender.forEach(tweet => {
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
      fragment.appendChild(tweetDiv);
    });

    feedWrapper.appendChild(fragment);
    realFeed.appendChild(feedWrapper);
  }

  function restoreRealFeed() {
    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (realFeed) location.reload(); // safest way to restore original feed
  }

} else {
  console.log("🚫 Not on X Home, skipping dropdown injection");
}
