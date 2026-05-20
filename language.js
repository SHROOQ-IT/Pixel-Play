const langToggle = document.getElementById("lang-toggle");

let currentLang = localStorage.getItem("pixelplay-lang") || "en";

function applyLanguage(lang) {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-en][data-ar]").forEach((element) => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });

    document.querySelectorAll("[data-en-placeholder][data-ar-placeholder]").forEach((element) => {
        element.placeholder = element.getAttribute(`data-${lang}-placeholder`);
    });

    if (langToggle) {
        langToggle.textContent = lang === "ar" ? "EN" : "AR";
    }

    localStorage.setItem("pixelplay-lang", lang);
}

applyLanguage(currentLang);

if (langToggle) {
    langToggle.addEventListener("click", () => {
        currentLang = currentLang === "en" ? "ar" : "en";
        applyLanguage(currentLang);
    });
}