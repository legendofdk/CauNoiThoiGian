const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const progressBar = document.querySelector(".scroll-progress");
const revealNodes = document.querySelectorAll(".reveal");
const visitCountNode = document.querySelector("#visit-count");

const COUNTER_UP_API =
  "https://api.counterapi.dev/v2/hoan-kieu-dinhs-team-3626/caunoithoigian/up";
const COUNTER_GET_API =
  "https://api.counterapi.dev/v2/hoan-kieu-dinhs-team-3626/caunoithoigian";

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

const observeRevealNode = (node) => {
  if (!node) {
    return;
  }

  revealObserver.observe(node);
};

revealNodes.forEach(observeRevealNode);

const updateScrollProgress = () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? (scrollTop / height) * 100 : 0;
  progressBar.style.width = `${progress}%`;
};

document.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const formatVisitCount = (count) =>
  new Intl.NumberFormat("vi-VN").format(Number(count || 0));

const renderVisitCount = (count) => {
  if (!visitCountNode) {
    return;
  }

  visitCountNode.textContent = `${formatVisitCount(count)} lượt truy cập`;
};

const renderVisitCountError = () => {
  if (!visitCountNode) {
    return;
  }

  visitCountNode.textContent = "Chưa tải được lượt truy cập";
};

const getCounterValue = (payload) => payload?.data?.up_count;

const loadVisitCount = async () => {
  if (!visitCountNode) {
    return;
  }

  try {
    const upResponse = await fetch(COUNTER_UP_API, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!upResponse.ok) {
      throw new Error(`Counter up failed: ${upResponse.status}`);
    }

    const upPayload = await upResponse.json();
    const optimisticCount = getCounterValue(upPayload);

    if (typeof optimisticCount === "number") {
      renderVisitCount(optimisticCount);
    }

    const getResponse = await fetch(COUNTER_GET_API, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!getResponse.ok) {
      if (typeof optimisticCount === "number") {
        return;
      }

      throw new Error(`Counter get failed: ${getResponse.status}`);
    }

    const getPayload = await getResponse.json();
    const count = getCounterValue(getPayload);

    if (typeof count === "number") {
      renderVisitCount(count);
      return;
    }

    if (typeof optimisticCount === "number") {
      renderVisitCount(optimisticCount);
      return;
    }

    throw new Error("Counter payload missing up_count");
  } catch (error) {
    console.error(error);
    renderVisitCountError();
  }
};

loadVisitCount();
