class Translate {
	constructor() {
		this.init();
	}

	init() {
		i18next.init(
			{
				lng: "en",
				debug: true,
				resources: {},
				fallbackLng: "en",
				interpolation: {
					escapeValue: false,
				},
			},
			(err, t) => {
				if (err) {
					console.error("Error initializing i18next", err);
				}
				this.updateTexts();
			}
		);

		this.setupLangSwitcher();
	}

	loadTranslationFile(lang) {
		return fetch(Utils.baseUrl + `/src/i18n/locales/${lang}.json`)
			.then((response) => response.json())
			.then((data) => {
				i18next.addResourceBundle(lang, "translation", data, true, true);
				i18next.changeLanguage(lang, () => this.updateTexts());
				ATON.fireEvent("LanguageChanged", lang);
			})
			.catch((err) => console.error("Errore nel caricare il file di traduzione:", err));
	}

	updateTexts() {
		document.querySelectorAll("[data-i18n]").forEach((el) => {
			const key = el.getAttribute("data-i18n");
			if (el.getAttribute("aria-label")) el.setAttribute("aria-label", i18next.t(key));
			el.textContent = i18next.t(key);
		});
	}

	setupLangSwitcher() {
		const dropdownItems = document.querySelectorAll(
			".dropdown-menu-language .dropdown-item-language"
		);

		dropdownItems.forEach((item) => {
			item.addEventListener("click", (e) => {
				e.preventDefault();
				const selectedLang = item.getAttribute("data-lang");
				this.loadTranslationFile(selectedLang);
				localStorage.setItem("preferredLang", selectedLang);

				const selectedLanguageIcon = document.getElementById("selectedLanguageIcon");
				selectedLanguageIcon.src = item.querySelector("img").src;
				selectedLanguageIcon.alt = item.querySelector("img").alt;
			});
		});

		const preferredLang = localStorage.getItem("preferredLang") || "en";
		const selectedLanguageIcon = document.getElementById("selectedLanguageIcon");
		const selectedLangItem = document.querySelector(`.dropdown-item[data-lang="${preferredLang}"]`);
		if (selectedLangItem) {
			selectedLanguageIcon.src = selectedLangItem.querySelector("img").src;
			selectedLanguageIcon.alt = selectedLangItem.querySelector("img").alt;
		}
		this.loadTranslationFile(preferredLang);
	}
}
