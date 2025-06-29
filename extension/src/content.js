console.log("📌 content.js injected");

if (location.hostname === "x.com" && location.pathname === "/home") {
  console.log("✅ Injecting dropdown on X Home");

  // === DROPDOWN UI ===
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

  // === POPULATE USERS FROM STORAGE ===
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

    console.log("✅ Dropdown populated with users:", users.map((u) => u.auth_info));
  });

  // === ON USER CHANGE ===
  select.addEventListener("change", async (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "default") {
      removeInjectedFeed();
      restoreRealFeed();
      return;
    }

    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (realFeed) {
      realFeed.innerHTML = "";
      const loadingDiv = document.createElement("div");
      loadingDiv.style.padding = "50px";
      loadingDiv.style.fontSize = "20px";
      loadingDiv.style.fontWeight = "bold";
      loadingDiv.style.textAlign = "center";
      loadingDiv.style.backgroundColor = "#fff";
      loadingDiv.textContent = "Loading...";
      realFeed.appendChild(loadingDiv);
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
        if (realFeed) {
          realFeed.innerHTML = "<div style='padding: 50px; text-align: center; font-weight: bold; color: red;'>Error loading feed.</div>";
        }
      }
    });
  });

  // === RENDER MOCK FEED IN BATCHES ===
  function renderMockFeed(feed) {
    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (!realFeed) return;

    realFeed.innerHTML = "";

    const feedWrapper = document.createElement("div");
    feedWrapper.style.padding = "10px";
    feedWrapper.style.fontFamily = "Arial, sans-serif";
    feedWrapper.style.backgroundColor = "#f5f5f5";
    feedWrapper.id = "xfeed-mock-feed";
    realFeed.appendChild(feedWrapper);

    let index = 0;
    const batchSize = 10;

    function loadNextBatch() {
      const fragment = document.createDocumentFragment();
      const tweets = feed.slice(index, index + batchSize);
      if (tweets.length === 0) return;

      tweets.forEach((tweet) => {
        const tweetDiv = document.createElement("div");
        tweetDiv.style.border = "1px solid #ccc";
        tweetDiv.style.background = "#fff";
        tweetDiv.style.padding = "12px";
        tweetDiv.style.marginBottom = "12px";
        tweetDiv.style.borderRadius = "12px";
        tweetDiv.style.overflow = "hidden";

        let mediaHTML = "";
        if (tweet.media && tweet.media.length > 0) {
          const imageMedia = tweet.media.filter((url) =>
            url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          );

          if (imageMedia.length > 0) {
            mediaHTML =
              `<div style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0;">` +
              imageMedia
                .map((url) =>
                  `<img src="${url}" loading="lazy" style="width: 100%; border-radius: 12px; object-fit: cover;" />`
                )
                .join("") +
              `</div>`;
          }
        }

        tweetDiv.innerHTML = `
          <div style="margin-bottom: 4px;">
            <strong>@${tweet.handle}</strong> — <em style="color: #555;">${tweet.created_at}</em>
          </div>
          ${mediaHTML}
          <p style="margin: 6px 0;">${tweet.text}</p>
          <small style="color: #555;">❤️ ${tweet.likes} | 🔁 ${tweet.retweets} | 💬 ${tweet.replies}</small>
        `;

        fragment.appendChild(tweetDiv);
      });

      feedWrapper.appendChild(fragment);
      index += batchSize;
    }

    // Load initial batch
    loadNextBatch();

    // Lazy load next batch on scroll
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY + window.innerHeight;
      const bottom = document.body.scrollHeight - 100;
      if (scrollY >= bottom) {
        loadNextBatch();
      }
    });
  }

  function removeInjectedFeed() {
    const existing = document.getElementById("xfeed-mock-feed");
    if (existing) existing.remove();
  }

  function restoreRealFeed() {
    location.reload();
  }
} else {
  console.log("🚫 Not on X Home, skipping dropdown injection");
}
