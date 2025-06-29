/*document.getElementById("access-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const form = document.getElementById("access-form");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");

  // Hide form and show loading
  form.style.display = "none";
  loadingDiv.style.display = "block";
  resultDiv.innerText = "";

  try {
    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_info_1: username,
        auth_info_2: email,
        password: password,
      }),
    });

    const data = await res.json();
    loadingDiv.style.display = "none";

    if (!res.ok) {
      // ❌ Show backend error message
      resultDiv.innerText = `❌ ${data.detail || "Login failed."}`;
      resultDiv.style.color = "red";
    } else {
      // ✅ Show success to user, log full result
      console.log("✅ Login successful, server response:", data);
      resultDiv.innerText = "✅ You have granted access to see your feed.";
      resultDiv.style.color = "lightgreen";
    }
  } catch (err) {
    loadingDiv.style.display = "none";
    resultDiv.innerText = `❌ Error: ${err.message}`;
    resultDiv.style.color = "red";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("access-form");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent form from submitting normally

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Form submitted:");
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);

    loadingDiv.style.display = "block";
    resultDiv.innerText = "";

    setTimeout(() => {
      loadingDiv.style.display = "none";
      resultDiv.innerText = "✅ Form data logged in console.";
      resultDiv.style.color = "lightgreen";
    }, 1000);
  });
});
*/


document.addEventListener("DOMContentLoaded", function () {
  console.log("🟢 DOM fully loaded");

  const submitBtn = document.getElementById("submit-btn");
  const form = document.getElementById("access-form");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");

  submitBtn.addEventListener("click", async function () {
    console.log("📨 Button clicked");

    const username = document.getElementById("username")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!username || !email || !password) {
      resultDiv.innerText = "❌ Please fill in all fields.";
      resultDiv.style.color = "red";
      return;
    }

    console.log("🔐 Data:", { username, email, password });

    form.style.display = "none";
    loadingDiv.style.display = "block";
    resultDiv.innerText = "";

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_info_1: username,
          auth_info_2: email,
          password: password,
        }),
      });

      console.log("📬 Awaiting response...");
      const data = await res.json();

      loadingDiv.style.display = "none";

      if (!res.ok) {
        console.error("❌ Server error:", data);
        resultDiv.innerText = `❌ ${data.detail || "Login failed."}`;
        resultDiv.style.color = "red";
      } else {
        console.log("✅ Login successful:", data);
        resultDiv.innerText = "✅ You have granted access to see your feed.";
        resultDiv.style.color = "lightgreen";
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      loadingDiv.style.display = "none";
      resultDiv.innerText = `❌ Network error: ${err.message}`;
      resultDiv.style.color = "red";
    }
  });
});
