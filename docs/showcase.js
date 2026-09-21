(() => {
  "use strict";

  const navigation = document.querySelector("#site-navigation");
  const navigationToggle = document.querySelector(".nav-toggle");

  const closeNavigation = () => {
    if (!navigation || !navigationToggle) return;
    navigation.classList.remove("is-open");
    navigationToggle.setAttribute("aria-expanded", "false");
  };

  if (navigation && navigationToggle) {
    navigationToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      navigationToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation();
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const heroImage = document.querySelector(".hero-device img");
  if (heroImage) {
    heroImage.addEventListener("error", () => {
      heroImage.removeAttribute("alt");
      heroImage.setAttribute("src", "");
    });
  }

  const candidates = [
    {
      brand: "Oppo",
      model: "K13 Turbo Pro (512GB)",
      price: 56000,
      ram: 12,
      storage: 512,
      battery: 7000,
      display: "AMOLED · 6.80 in",
      camera: "50 + 2 MP",
      chipset: "Qualcomm Snapdragon 8s Gen 4",
    },
    {
      brand: "Oppo",
      model: "K13 Turbo (512GB)",
      price: 52000,
      ram: 12,
      storage: 512,
      battery: 7000,
      display: "AMOLED · 6.80 in",
      camera: "50 + 2 MP",
      chipset: "Dimensity 8450",
    },
    {
      brand: "Infinix",
      model: "Hot 60 Pro Plus (256GB)",
      price: 23999,
      ram: 8,
      storage: 256,
      battery: 5160,
      display: "AMOLED · 6.78 in",
      camera: "50 MP",
      chipset: "Helio G200",
    },
    {
      brand: "Motorola",
      model: "Moto G96 (256GB)",
      price: 30000,
      ram: 8,
      storage: 256,
      battery: 5500,
      display: "P-OLED · 6.67 in",
      camera: "50 + 8 MP",
      chipset: "Snapdragon 7s Gen 2",
    },
  ];

  const demoForm = document.querySelector("#demo-form");
  const demoOutput = document.querySelector("#demo-output");
  const demoCount = document.querySelector("#demo-count");
  const budgetInput = document.querySelector("#demo-budget");
  const budgetOutput = document.querySelector("#budget-output");
  const demoSummary = document.querySelector("#demo-summary");

  const formatPrice = (value) => `৳${value.toLocaleString("en-IN")}`;

  const renderCandidate = (candidate) => `
    <article class="result-lead">
      <div>
        <p class="section-kicker">Lead match</p>
        <h3>${candidate.brand} ${candidate.model}</h3>
        <p>${candidate.chipset}. A representative catalogue row selected by the constraints above.</p>
        <div class="spec-line">
          <span>${candidate.ram} GB RAM</span>
          <span>${candidate.storage} GB storage</span>
          <span>${candidate.battery.toLocaleString("en-IN")} mAh</span>
          <span>${candidate.display}</span>
          <span>${candidate.camera}</span>
        </div>
      </div>
      <strong class="result-price">${formatPrice(candidate.price)}</strong>
    </article>
  `;

  const renderAlternative = (candidate) => `
    <div class="alternative">
      <small>${candidate.brand}</small>
      <strong>${candidate.model}</strong>
      <span>${formatPrice(candidate.price)}</span>
    </div>
  `;

  const updateDemo = () => {
    if (!demoForm || !demoOutput || !demoCount || !budgetInput || !budgetOutput) return;

    const formData = new FormData(demoForm);
    const budget = Number(formData.get("budget"));
    const ram = Number(formData.get("ram"));
    const storage = Number(formData.get("storage"));
    const battery = Number(formData.get("battery"));

    const matches = candidates
      .filter(
        (candidate) =>
          candidate.price <= budget &&
          candidate.ram >= ram &&
          candidate.storage >= storage &&
          candidate.battery >= battery,
      )
      .sort((left, right) => {
        if (right.ram !== left.ram) return right.ram - left.ram;
        if (right.battery !== left.battery) return right.battery - left.battery;
        return left.price - right.price;
      });

    budgetOutput.textContent = formatPrice(budget);
    demoCount.textContent = `${matches.length} ${matches.length === 1 ? "candidate" : "candidates"}`;

    if (demoSummary) {
      demoSummary.innerHTML = [
        `Up to ${formatPrice(budget)}`,
        `${ram} GB+ RAM`,
        `${storage} GB+ storage`,
        `${battery.toLocaleString("en-IN")} mAh+`,
      ].map((label) => `<span>${label}</span>`).join("");
    }

    if (matches.length === 0) {
      demoOutput.innerHTML = `
        <div class="result-empty">
          <p class="section-kicker">No representative match</p>
          <h3>Loosen one constraint to continue.</h3>
          <p>The local application would return an empty result set here; this showcase does not invent a replacement.</p>
        </div>
      `;
      return;
    }

    const [lead, ...alternatives] = matches;
    demoOutput.innerHTML = `${renderCandidate(lead)}${
      alternatives.length
        ? `<div class="alternatives">${alternatives.map(renderAlternative).join("")}</div>`
        : ""
    }`;
  };

  if (demoForm) {
    demoForm.addEventListener("submit", (event) => event.preventDefault());
    demoForm.addEventListener("input", updateDemo);
    demoForm.addEventListener("change", updateDemo);
    demoForm.addEventListener("reset", () => window.setTimeout(updateDemo, 0));
    updateDemo();
  }

  const workflowSteps = document.querySelectorAll(".workflow-step");
  if (workflowSteps.length && "IntersectionObserver" in window) {
    const workflowObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting)),
      { threshold: 0.55 },
    );
    workflowSteps.forEach((step) => workflowObserver.observe(step));
  }

  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
