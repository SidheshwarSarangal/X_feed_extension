console.log("📌 content.js injected");

if (location.hostname === "x.com" && location.pathname === "/home") {
  console.log("✅ Injecting dropdown on X Home");

  const container = document.createElement("div");
  container.id = "xfeed-user-dropdown";
  Object.assign(container.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    zIndex: "999999",
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "6px",
    boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
    fontSize: "14px",
    color: "#000",
    fontFamily: "Arial, sans-serif",
    border: "2px solid red",
  });

  const label = document.createElement("label");
  label.textContent = "👤 Switch Feed: ";
  label.style.marginRight = "5px";
  container.appendChild(label);

  const select = document.createElement("select");
  select.id = "xfeed-dropdown";
  select.innerHTML = `<option value="default">Your Feed</option>`;
  container.appendChild(select);

  document.body.appendChild(container);

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

    console.log(
      "✅ Dropdown populated with users:",
      users.map((u) => u.auth_info)
    );
  });

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
      Object.assign(loadingDiv.style, {
        padding: "50px",
        fontSize: "20px",
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#fff",
      });
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

        removeInjectedFeed();

        if (!Array.isArray(data) || data.length === 0) {
          if (realFeed) {
            realFeed.innerHTML =
              "<div style='padding: 40px; text-align: center;'>Session expired. Ask the user to allow access again</div>";
          }

          const newSessions = [...users];
          newSessions.splice(selectedIndex, 1);
          chrome.storage.local.set({ userSessions: newSessions }, () => {
            console.log(`🗑️ Removed expired session at index ${selectedIndex}`);
            const optionToRemove = document.querySelector(
              `#xfeed-dropdown option[value="${selectedIndex}"]`
            );
            if (optionToRemove) optionToRemove.remove();
          });

          return;
        }

        renderMockFeed(data);
      } catch (err) {
        console.error("❌ Failed to fetch feed:", err);
        if (realFeed) {
          realFeed.innerHTML =
            "<div style='padding: 50px; text-align: center; font-weight: bold; color: red;'>Error loading feed.</div>";
        }
      }
    });
  });

  function renderMockFeed(feed) {
    const realFeed = document.querySelector('[data-testid="primaryColumn"]');
    if (!realFeed) return;

    realFeed.innerHTML = "";

    const feedWrapper = document.createElement("div");
    Object.assign(feedWrapper.style, {
      padding: "10px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f5f5f5",
      transition: "opacity 0.5s ease",
      opacity: "0",
    });
    feedWrapper.id = "xfeed-mock-feed";
    realFeed.appendChild(feedWrapper);

    setTimeout(() => {
      feedWrapper.style.opacity = "1";
    }, 50); // slight delay for fade-in

    let index = 0;
    const batchSize = 10;
    const maxFeedItems = 30;
    feed = feed.slice(0, maxFeedItems);

    function loadNextBatch() {
      if (index >= maxFeedItems) return;

      const fragment = document.createDocumentFragment();
      const tweets = feed.slice(index, index + batchSize);

      tweets.forEach((tweet) => {
        const tweetDiv = document.createElement("div");
        Object.assign(tweetDiv.style, {
          border: "1px solid #ccc",
          background: "#fff",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "12px",
          overflow: "hidden",
          opacity: "0",
          transform: "translateY(20px)",
          transition: "all 0.4s ease",
          willChange: "transform, opacity",
        });

        setTimeout(() => {
          tweetDiv.style.opacity = "1";
          tweetDiv.style.transform = "translateY(0)";
        }, 30); // animate each tweet

        const metaDiv = document.createElement("div");
        metaDiv.innerHTML = `<strong>@${tweet.handle}</strong> — <em style="color: #555;">${tweet.created_at}</em>`;
        metaDiv.style.marginBottom = "4px";
        tweetDiv.appendChild(metaDiv);

        if (tweet.media && tweet.media.length > 0) {
          const imageMedia = tweet.media.filter((url) =>
            url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          );
          const videoMedia = tweet.media.filter((url) =>
            url.match(/\.mp4(\?.*)?$/i)
          );

          const mediaWrapper = document.createElement("div");
          Object.assign(mediaWrapper.style, {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            margin: "10px 0",
          });

          imageMedia.forEach((url) => {
            const img = document.createElement("img");
            Object.assign(img.style, {
              width: "100%",
              maxHeight: "400px",
              borderRadius: "12px",
              objectFit: "cover",
              transition: "opacity 0.3s ease",
            });
            img.loading = "lazy";
            img.decoding = "async";
            img.src = url;
            mediaWrapper.appendChild(img);
          });

          videoMedia.forEach((url) => {
            const video = document.createElement("video");
            Object.assign(video.style, {
              width: "100%",
              maxHeight: "400px",
              borderRadius: "12px",
              display: "block",
              outline: "none",
              backgroundColor: "#000",
            });
            video.src = url;
            video.controls = true;
            video.playsInline = true;

            // 🔇 Start muted and volume at 0.3
            video.muted = true;
            video.volume = 0.3;

            // 🎚️ Detect unmute and reset volume to 30%
            video.addEventListener("volumechange", () => {
              if (!video.muted && video.volume > 0.3) {
                video.volume = 0.3;
              }
            });

            mediaWrapper.appendChild(video);
          });

          tweetDiv.appendChild(mediaWrapper);
        }

        const textP = document.createElement("p");
        textP.style.margin = "6px 0";
        textP.textContent = tweet.text;
        tweetDiv.appendChild(textP);

        const stats = document.createElement("small");
        stats.style.color = "#555";
        stats.textContent = `❤️ ${tweet.likes} | 🔁 ${tweet.retweets} | 💬 ${tweet.replies}`;
        tweetDiv.appendChild(stats);

        fragment.appendChild(tweetDiv);
      });

      feedWrapper.appendChild(fragment);
      index += batchSize;

      while (feedWrapper.children.length > maxFeedItems) {
        feedWrapper.removeChild(feedWrapper.firstChild);
      }
    }

    loadNextBatch();

    const sentinel = document.createElement("div");
    feedWrapper.appendChild(sentinel);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadNextBatch();
    });
    observer.observe(sentinel);
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
