// AstroCompanion — product state, navigation and demo interactions.
// localStorage keeps the journey alive across reloads on GitHub Pages.

const STORAGE_KEY = "astrocompanion_state_v2";

const DEFAULT_STATE = {
  name: null,
  dob: null,
  birthTime: null,
  place: null,
  focus: "career",
  streak: 0,
  lastVisitDate: null,
  journeyDay: 1,
  journeyStarted: null,
  moodByDate: {},
  referralTopic: null,
  referralInsight: null,
  concern: "",
  aiReflection: null,
  aiQuestion: null
};

let state = { ...DEFAULT_STATE };

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn("Persistence unavailable; using memory.");
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

function registerVisit() {
  const today = localDateKey();

  if (state.lastVisitDate === today) return;

  if (!state.lastVisitDate) {
    state.streak = 1;
    state.journeyDay = 1;
  } else if (state.lastVisitDate === yesterdayKey()) {
    state.streak += 1;
    state.journeyDay = Math.min(7, (state.journeyDay || 1) + 1);
  } else {
    // A missed day should not fake continuity.
    // Start a new 7-day cycle.
    state.streak = 1;
    state.journeyDay = 1;
  }

  state.lastVisitDate = today;
  saveState();
}

function currentJourney() {
  return JOURNEY_TYPES[state.focus] || JOURNEY_TYPES.career;
}

function currentInsight() {
  const journey = currentJourney();

  const index = Math.max(
    0,
    Math.min(
      journey.prompts.length - 1,
      (state.journeyDay - 1) % journey.prompts.length
    )
  );

  return state.journeyDay === 1
    ? journey.insight
    : journey.insight + " " + journey.prompts[index];
}


// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const target = document.getElementById("screen-" + name);

  if (target) {
    target.classList.remove("hidden");

    // IMPORTANT:
    // The phone is no longer the scroll container.
    // Each active screen scrolls independently.
    target.scrollTop = 0;
  }

  const tabbar = document.getElementById("tabbar");

  if (tabbar) {
    tabbar.classList.toggle(
      "hidden",
      !["daily", "match", "membership"].includes(name)
    );
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.nav === name);
  });
}


// ---------------------------------------------------------------------------
// Daily Journey
// ---------------------------------------------------------------------------

function renderDaily() {
  const journey = currentJourney();

  document.getElementById("daily-name").textContent =
    state.name || "Traveller";

  document.getElementById("streak-count").textContent =
    state.streak;

  document.getElementById("journey-label").textContent =
    journey.label;

  document.getElementById("journey-day").textContent =
    `Day ${state.journeyDay} of 7`;

  document.getElementById("journey-progress").style.width =
    `${(state.journeyDay / 7) * 100}%`;

  document.getElementById("insight-text").textContent =
    currentInsight();

  document.getElementById("insight-date").textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric"
    });

  const todayMood = state.moodByDate[localDateKey()];

  document.querySelectorAll(".mood-btn").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.mood === todayMood
    );
  });

  document
    .getElementById("checkin-saved")
    .classList.toggle("hidden", !todayMood);

  document.getElementById("ai-reflection").textContent =
    state.aiReflection ||
    "Your daily reflection will adapt to what you tell us.";

  document.getElementById("ai-question").textContent =
    state.aiQuestion ||
    "Check in above, then ask the guide to reflect with you.";
}


// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

function renderMembership() {
  document.getElementById("plans-container").innerHTML =
    PRICING_TIERS.map(tier => `
      <div class="plan-card ${tier.featured ? "featured" : ""}">
        ${
          tier.badge
            ? `<div class="plan-badge">${tier.badge}</div>`
            : ""
        }

        <div class="plan-name">${tier.name}</div>

        <div class="plan-price">${tier.price}</div>

        <ul class="plan-feats">
          ${tier.features
            .map(feature => `<li>${feature}</li>`)
            .join("")}
        </ul>

        <button
          class="${tier.featured ? "btn-primary" : "btn-secondary"} plan-btn"
          data-plan="${tier.id}"
        >
          ${tier.id === "free" ? "Current plan" : "Explore plan →"}
        </button>
      </div>
    `).join("");
}


// ---------------------------------------------------------------------------
// Share Card
// ---------------------------------------------------------------------------

function populateShare() {
  const journey = currentJourney();

  document.getElementById("share-streak").textContent =
    state.streak;

  document.getElementById("share-focus").textContent =
    journey.topic;

  document.getElementById("share-card-text").textContent =
    `“${journey.card}”`;

  document.getElementById("share-card-name").textContent =
    `${state.name || "A traveller"} · Day ${state.streak}`;
}


// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  const area = document.createElement("textarea");

  area.value = text;

  document.body.appendChild(area);

  area.select();

  document.execCommand("copy");

  area.remove();

  return Promise.resolve();
}


// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function toast(message) {
  const element = document.getElementById("copy-toast");

  if (!element) return;

  element.textContent = message;

  element.classList.remove("hidden");

  setTimeout(() => {
    element.classList.add("hidden");
  }, 2200);
}


// ---------------------------------------------------------------------------
// Referral / Share Loop
// ---------------------------------------------------------------------------

function createReferralLink() {
  const payload = {
    n: state.name || "A friend",
    f: state.focus || "purpose",
    q: currentJourney().card
  };

  const encoded = btoa(
    unescape(
      encodeURIComponent(JSON.stringify(payload))
    )
  );

  return `${location.href.split("?")[0]}?ref=${encodeURIComponent(encoded)}`;
}

function readReferral() {
  const ref = new URLSearchParams(location.search).get("ref");

  if (!ref) return null;

  try {
    return JSON.parse(
      decodeURIComponent(
        escape(atob(ref))
      )
    );
  } catch (e) {
    return null;
  }
}

function openFriend(ref) {
  if (!ref) return false;

  state.referralTopic = ref.f || "purpose";

  state.referralInsight =
    ref.q ||
    "A friend shared a moment from their journey.";

  document.getElementById("friend-sender").textContent =
    ref.n || "A friend";

  document.getElementById("friend-card-text").textContent =
    `“${state.referralInsight}”`;

  showScreen("friend");

  return true;
}


// ---------------------------------------------------------------------------
// Global Navigation Events
// ---------------------------------------------------------------------------

document.addEventListener("click", event => {
  const back = event.target.closest("[data-back]");

  if (back) {
    showScreen(back.dataset.back);
    return;
  }

  const nav = event.target.closest("[data-nav]");

  if (nav) {
    if (nav.dataset.nav === "daily") {
      renderDaily();
    }

    showScreen(nav.dataset.nav);
  }
});


// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

document
  .getElementById("onboarding-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    state.name =
      document.getElementById("ob-name").value.trim() ||
      "Traveller";

    state.dob =
      document.getElementById("ob-dob").value;

    state.birthTime =
      document.getElementById("ob-time").value;

    state.place =
      document.getElementById("ob-place").value.trim();

    state.focus =
      document.getElementById("ob-focus").value;

    state.concern =
      `${state.focus} is what I want more clarity about.`;

    state.journeyDay = 1;
    state.streak = 0;
    state.lastVisitDate = null;
    state.moodByDate = {};

    registerVisit();

    saveState();

    renderDaily();

    showScreen("daily");
  });


// ---------------------------------------------------------------------------
// Mood Check-in
// ---------------------------------------------------------------------------

document.querySelectorAll(".mood-btn").forEach(button => {
  button.addEventListener("click", () => {
    state.moodByDate[localDateKey()] =
      button.dataset.mood;

    saveState();

    renderDaily();
  });
});


// ---------------------------------------------------------------------------
// Daily Actions
// ---------------------------------------------------------------------------

document
  .getElementById("btn-goto-share")
  .addEventListener("click", () => {
    populateShare();
    showScreen("share");
  });

document
  .getElementById("btn-goto-match")
  .addEventListener("click", () => {
    showScreen("match");
  });

document
  .getElementById("btn-goto-membership")
  .addEventListener("click", () => {
    showScreen("membership");
  });


// ---------------------------------------------------------------------------
// AI Journey Guide
// ---------------------------------------------------------------------------

async function runAIReflection() {
  const button =
    document.getElementById("btn-ai-reflect");

  const status =
    document.getElementById("ai-status");

  const mood =
    state.moodByDate[localDateKey()] || "unsure";

  button.disabled = true;

  button.textContent = "Reflecting…";

  status.classList.remove("hidden");

  status.textContent =
    "Connecting to the adaptive journey layer…";

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/journey",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: state.name,
          focus: state.focus,
          concern: state.concern,
          mood,
          day: state.journeyDay
        })
      }
    );

    if (!response.ok) {
      throw new Error("backend unavailable");
    }

    const result = await response.json();

    state.aiReflection =
      result.reflection;

    state.aiQuestion =
      result.question;

    saveState();

    renderDaily();

    status.textContent =
      result.mode === "live-ai"
        ? "Live AI reflection generated from your journey state ✦"
        : "Adaptive demo mode — live AI is optional.";

  } catch (error) {

    const journey = currentJourney();

    const moodText =
      mood === "heavy"
        ? "Today may be better for reflection than forcing a decision."
        : "Notice what feels most important today.";

    state.aiReflection =
      `${moodText} ${
        journey.prompts[
          (state.journeyDay - 1) %
          journey.prompts.length
        ]
      }`;

    state.aiQuestion =
      "What is one small thing you can clarify today?";

    saveState();

    renderDaily();

    status.textContent =
      "Offline adaptive mode — start the Python backend for live AI.";

  } finally {

    button.disabled = false;

    button.textContent =
      "Reflect with AI →";
  }
}

document
  .getElementById("btn-ai-reflect")
  .addEventListener(
    "click",
    runAIReflection
  );


// ---------------------------------------------------------------------------
// Share Loop
// ---------------------------------------------------------------------------

document
  .getElementById("btn-copy-card")
  .addEventListener("click", async () => {

    await copyText(
      `${currentJourney().card} — Day ${state.streak} on AstroCompanion. Start your own journey: ${location.href.split("?")[0]}`
    );

    toast("Share message copied ✦");
  });

document
  .getElementById("btn-share-link")
  .addEventListener("click", () => {

    const link = createReferralLink();

    document.getElementById("share-link-text").textContent =
      link;

    document
      .getElementById("share-link-box")
      .classList.remove("hidden");
  });

document
  .getElementById("btn-copy-link")
  .addEventListener("click", async () => {

    await copyText(
      document.getElementById("share-link-text").textContent
    );

    toast("Friend link copied ✦");
  });


// ---------------------------------------------------------------------------
// Friend Loop
// ---------------------------------------------------------------------------

document.querySelectorAll(".topic-btn").forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".topic-btn")
      .forEach(btn =>
        btn.classList.remove("selected")
      );

    button.classList.add("selected");

    state.focus =
      button.dataset.topic;
  });

});

document
  .getElementById("btn-claim-own")
  .addEventListener("click", () => {

    document.getElementById("ob-focus").value =
      state.referralTopic || "purpose";

    showScreen("onboarding");
  });


// ---------------------------------------------------------------------------
// Smart Match
// ---------------------------------------------------------------------------

document
  .querySelectorAll(".quick-prompts button")
  .forEach(button => {

    button.addEventListener("click", () => {

      document.getElementById("match-input").value =
        button.dataset.prompt;
    });

  });

document
  .getElementById("btn-run-match")
  .addEventListener("click", () => {

    const result =
      runSmartMatch(
        document.getElementById("match-input").value
      );

    const box =
      document.getElementById("match-result");

    if (!result) {
      box.classList.add("hidden");
      return;
    }

    document.getElementById("match-specialty").textContent =
      result.specialty.label;

    document.getElementById("match-confidence").textContent =
      `${result.confidencePct}% confidence`;

    document.getElementById("match-reason").textContent =
      result.reason;

    document.getElementById("match-signals").innerHTML =
      result.signals
        .map(signal => `<span>${signal}</span>`)
        .join("");

    document.getElementById("astrologer-name").textContent =
      result.specialty.astrologer.name;

    document.getElementById("astrologer-tag").textContent =
      result.specialty.astrologer.tag;

    document.getElementById("astrologer-avatar").textContent =
      result.specialty.astrologer.name.charAt(0);

    document.getElementById("match-cta-note").textContent =
      `Start with ${result.specialty.label.toLowerCase()} → your consultation can become the first step of a 7-day tracked journey.`;

    box.classList.remove("hidden");
  });

document
  .getElementById("btn-book-match")
  .addEventListener("click", () => {
    toast(
      "Profile preview opened — consultation flow is illustrative."
    );
  });


// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

document.addEventListener("click", event => {

  const plan =
    event.target.closest(".plan-btn");

  if (
    plan &&
    plan.dataset.plan !== "free"
  ) {
    toast(
      "Prototype checkout — no payment is processed."
    );
  }

});


// ---------------------------------------------------------------------------
// Background Stars
// ---------------------------------------------------------------------------

function initBgStars() {

  const canvas =
    document.getElementById("bg-stars");

  const ctx =
    canvas.getContext("2d");

  let stars = [];

  function resize() {

    canvas.width = innerWidth;

    canvas.height = innerHeight;

    stars =
      Array.from(
        {
          length: Math.min(
            180,
            Math.floor(
              innerWidth *
              innerHeight /
              9000
            )
          )
        },
        () => ({
          x: Math.random() * canvas.width,

          y: Math.random() * canvas.height,

          r: Math.random() * 1.2 + 0.2,

          p: Math.random() * 6.28
        })
      );
  }

  function frame(time) {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    stars.forEach(star => {

      ctx.beginPath();

      ctx.arc(
        star.x,
        star.y,
        star.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(245,241,232,${
          0.12 +
          0.2 *
          (
            0.5 +
            0.5 *
            Math.sin(
              star.p +
              time * 0.001
            )
          )
        })`;

      ctx.fill();
    });

    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);

  resize();

  requestAnimationFrame(frame);
}


// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function boot() {

  loadState();

  initBgStars();

  renderMembership();

  const ref = readReferral();

  if (ref) {
    openFriend(ref);
    return;
  }

  if (state.name) {

    registerVisit();

    renderDaily();

    showScreen("daily");

  } else {

    showScreen("onboarding");
  }
}

document.addEventListener(
  "DOMContentLoaded",
  boot
);