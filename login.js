
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const username = formData.get("username");
      const password = formData.get("password");

      try {
        const response = await fetch("/login_process", {
          method: "POST",
          body: new URLSearchParams({ username, password }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const accessToken = data.accessToken;

          // 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", accessToken);

          // index.html로 이동
          window.location.href = "index.html";
        } else {
          alert("Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    });
  });