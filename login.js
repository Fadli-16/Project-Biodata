(function () {
    const REDIRECT_TARGET = "index.html";
    const splashWrap = document.getElementById("splashWrap");
    const loginRoot = document.getElementById("loginRoot");
    const splashBtn = document.getElementById("splashBtn");
    const splashName = document.getElementById("splashName");
    const splashPass = document.getElementById("splashPass");
    const toggleTheme = document.getElementById("toggleTheme");

    // contoh user statis (bisa diganti dengan autentikasi nyata)
    const USERS = [
        { id: "user1", username: "Fadli Nobel", password: "fadli123" },
        { id: "user2", username: "bob", password: "bob123" },
    ];

    // apply theme from localStorage (if ada) & set icon
    function applyThemeFromStorage() {
        const t = localStorage.getItem("bio:theme") || "light";
        if (t === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        if (toggleTheme) {
            toggleTheme.textContent = "🌙";
            toggleTheme.title = "Beralih Mode Terang";
            toggleTheme.setAttribute("aria-pressed", "true");
        }
        } else {
        document.documentElement.removeAttribute("data-theme");
        if (toggleTheme) {
            toggleTheme.textContent = "☀️";
            toggleTheme.title = "Beralih Mode Gelap";
            toggleTheme.setAttribute("aria-pressed", "false");
        }
        }
    }
    applyThemeFromStorage();

    // toggle theme
    if (toggleTheme) {
        toggleTheme.addEventListener("click", () => {
        const cur = localStorage.getItem("bio:theme") || "light";
        const next = cur === "light" ? "dark" : "light";
        localStorage.setItem("bio:theme", next);
        applyThemeFromStorage();
        });
    }

    // show login after splash delay (2 detik)
    function showLogin() {
        splashWrap.style.transition = "opacity 220ms ease, transform 300ms ease";
        splashWrap.style.opacity = "0";
        splashWrap.style.transform = "scale(.98) translateY(-6px)";
        setTimeout(() => {
        splashWrap.style.display = "none";
        splashWrap.setAttribute("aria-hidden", "true");
        loginRoot.style.display = "flex";
        loginRoot.setAttribute("aria-hidden", "false");
        if (splashName) splashName.focus();
        }, 300);
    }

    // splash visible a bit longer: 2000 ms
    window.addEventListener("DOMContentLoaded", () => {
        setTimeout(showLogin, 2000);
        try {
        const logged = localStorage.getItem("bio:logged");
        if (logged === "1") {
            window.location.href = REDIRECT_TARGET;
        }
        } catch (e) {
        /* ignore */
        }
    });

    // authenticate against USERS
    function authenticate(username, password) {
        username = (username || "").trim();
        password = (password || "").trim();
        if (!username || !password) return null;
        return (
        USERS.find((u) => u.username === username && u.password === password) ||
        null
        );
    }

    function onLogin() {
        const username = splashName.value.trim();
        const password = splashPass.value.trim();
        const user = authenticate(username, password);
        if (!user) {
        alert("Username atau password salah. Coba lagi.");
        return;
        }

        try {
        const userKey = "bio:data_" + user.id;
        if (!localStorage.getItem(userKey) && user.data) {
            localStorage.setItem(userKey, JSON.stringify(user.data));
        }
        localStorage.setItem("bio:logged", "1");
        localStorage.setItem("bio:user", user.id);

        try {
            const existing = localStorage.getItem(userKey);
            if (existing) localStorage.setItem("bio:data", existing);
        } catch (e) {
            /* ignore */
        }
        } catch (e) {
        /* ignore */
        }

        window.location.href = REDIRECT_TARGET;
    }

    if (splashBtn) splashBtn.addEventListener("click", onLogin);
    if (splashPass)
        splashPass.addEventListener("keyup", (e) => {
        if (e.key === "Enter") onLogin();
        });
    if (splashName)
        splashName.addEventListener("keyup", (e) => {
        if (e.key === "Enter") splashPass.focus();
        });
})();
