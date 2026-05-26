/**
 * ══════════════════════════════════════════════════════════════
 * BLUE HORIZON OVERSEAS — REFINED ANIMATION ENGINE
 * Clean, elegant, satisfying motion design
 * ══════════════════════════════════════════════════════════════
 */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.innerWidth <= 768;

// ══════════════════════════════════════════════════════════════
// 1. SPLASH SCREEN — Clean fade out
// ══════════════════════════════════════════════════════════════
function initSplashScreen() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;

  // Skip for returning visitors (24h)
  const lastVisit = localStorage.getItem("bh_lastVisit");
  if (lastVisit && Date.now() - parseInt(lastVisit) < 86400000) {
    splash.remove();
    document.body.classList.add("splash-done");
    return;
  }
  localStorage.setItem("bh_lastVisit", String(Date.now()));

  if (prefersReducedMotion) {
    splash.remove();
    document.body.classList.add("splash-done");
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      splash.remove();
      document.body.classList.add("splash-done");
      initPageEntrance();
    }
  });

  // Letters fade in softly with subtle rise
  tl.from(".splash-letter", {
    y: 30,
    opacity: 0,
    stagger: 0.04,
    duration: 0.5,
    ease: "power2.out"
  })
  // Tagline fades in
  .to(".splash-tagline", {
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: "power2.out"
  }, "-=0.2")
  // Hold briefly then fade entire splash
  .to(splash, {
    opacity: 0,
    duration: 0.5,
    delay: 0.8,
    ease: "power2.inOut"
  });

  // Skip button
  const skipBtn = document.getElementById("splash-skip");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => tl.progress(1));
  }
}

// ══════════════════════════════════════════════════════════════
// 2. PAGE ENTRANCE — Smooth cascade after splash
// ══════════════════════════════════════════════════════════════
function initPageEntrance() {
  if (prefersReducedMotion) return;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out", duration: 0.7 },
    onComplete: () => {
      // Ensure everything is visible after animation
      gsap.set("#mainNav, .hero-eyebrow, .hero-3d-title .char, .hero-tagline, .hero-content > p, .hero-buttons .btn", {
        clearProps: "all"
      });
    }
  });

  // Nav slides in
  tl.from("#mainNav", { y: -40, opacity: 0, duration: 0.5 });

  // Eyebrow badge
  tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");

  // Title letters — simple clean rise
  tl.from(".hero-3d-title .char", {
    y: 40,
    opacity: 0,
    stagger: 0.03,
    duration: 0.4
  }, "-=0.2");

  // Tagline
  tl.from(".hero-tagline", { y: 15, opacity: 0, duration: 0.5 }, "-=0.15");

  // Description
  tl.from(".hero-content > p", { y: 15, opacity: 0, duration: 0.5 }, "-=0.3");

  // Buttons — gentle scale
  tl.from(".hero-buttons .btn", {
    y: 10,
    opacity: 0,
    stagger: 0.08,
    duration: 0.4
  }, "-=0.2");
}

// ══════════════════════════════════════════════════════════════
// 3. SCROLL ANIMATIONS — Clean, consistent reveals
// ══════════════════════════════════════════════════════════════
function initScrollAnimations() {
  if (prefersReducedMotion || typeof ScrollTrigger === "undefined") return;

  // ── Shared reveal: fade up ──
  function revealUp(selector, trigger, opts = {}) {
    gsap.from(selector, {
      scrollTrigger: {
        trigger: trigger || selector,
        start: "top 88%",
        once: true
      },
      y: opts.y || 30,
      opacity: 0,
      stagger: opts.stagger || 0,
      duration: opts.duration || 0.6,
      delay: opts.delay || 0,
      ease: "power2.out",
      onComplete: function() {
        gsap.set(selector, { clearProps: "all" });
      }
    });
  }

  // ── Section Titles ──
  document.querySelectorAll(".section-title").forEach(title => {
    revealUp(title.children, title, { stagger: 0.08 });
  });

  // ── Stats Bar: Counters ──
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach(el => {
    const rawText = el.textContent.trim();
    let target = 0, prefix = "", suffix = "";

    if (rawText.includes("₹")) {
      prefix = "₹";
      target = parseFloat(rawText.replace(/[^\d.]/g, ""));
      suffix = rawText.includes("L") ? "L+" : "+";
    } else if (rawText.includes("%")) {
      target = parseInt(rawText);
      suffix = "%";
    } else {
      target = parseInt(rawText.replace(/[^\d]/g, ""));
      suffix = rawText.includes("+") ? "+" : "";
    }

    el.setAttribute("data-target", target);
    el.textContent = prefix + "0" + suffix;

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            const isDecimal = String(target).includes(".");
            el.textContent = prefix + (isDecimal ? obj.val.toFixed(2) : Math.floor(obj.val)) + suffix;
          }
        });
      }
    });
  });

  // Stats bar container
  revealUp(".stats-bar .stat-item", ".stats-bar", { stagger: 0.08 });

  // ── Why Us Cards ──
  revealUp(".why-card", ".why-section", { stagger: 0.08, y: 40 });

  // ── Process Steps ──
  document.querySelectorAll(".process-step").forEach((step, i) => {
    revealUp(step, step, { delay: i * 0.06 });
  });

  // ── Country Switcher ──
  revealUp(".country-switcher", ".country-switcher");

  // ── Salary Highlight ──
  revealUp(".salary-highlight", ".salary-highlight");

  // ── Job Cards ──
  document.querySelectorAll(".job-grid").forEach(grid => {
    const cards = grid.querySelectorAll(".job-card");
    cards.forEach((card, i) => {
      revealUp(card, card, { delay: i * 0.04 });
    });
  });

  // ── Division Lines ──
  document.querySelectorAll(".division-line").forEach(line => {
    gsap.from(line, {
      scrollTrigger: { trigger: line, start: "top 88%", once: true },
      scaleX: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  });

  // ── Testimonial Cards ──
  revealUp(".testimonial-card", ".testimonials-section", { stagger: 0.1, y: 40 });

  // ── FAQ Items ──
  revealUp(".faq-item", ".faq-section", { stagger: 0.06 });

  // ── Social Box ──
  revealUp(".social-box", ".social-section");

  // ── Contact Cards ──
  revealUp(".contact-card", "#contact", { stagger: 0.08 });

  // ── Footer ──
  revealUp(".footer-top > div", "footer", { stagger: 0.06 });

  // ── Badges ──
  revealUp(".badge", ".badge", { stagger: 0.06 });

  // ── Tracker CTA ──
  revealUp(".tracker-cta-box", ".tracker-cta-box");
}

// ══════════════════════════════════════════════════════════════
// 4. PARTICLE BACKGROUND — Subtle ambient particles
// ══════════════════════════════════════════════════════════════
function initParticleSystem() {
  if (prefersReducedMotion) return;

  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let animFrameId = null;
  let isVisible = true;

  const COUNT = isMobile ? 20 : 40;
  const CONNECT_DIST = isMobile ? 100 : 130;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
  }

  function getColor() {
    return document.body.classList.contains("theme-vietnam")
      ? { r: 218, g: 55, b: 50 }
      : { r: 212, g: 175, b: 55 };
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.1
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function animate() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);
    const color = getColor();
    const scrollY = window.scrollY;
    const viewTop = scrollY - 100;
    const viewBottom = scrollY + window.innerHeight + 100;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Only draw visible particles
      if (p.y < viewTop || p.y > viewBottom) return;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${p.alpha})`;
      ctx.fill();
    });

    // Subtle connections
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].y < viewTop || particles[i].y > viewBottom) continue;
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${(1 - dist / CONNECT_DIST) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animFrameId = requestAnimationFrame(animate);
  }

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible && !animFrameId) animate();
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  });

  // Re-color on theme switch
  new MutationObserver(() => {}).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  init();
  animate();
}

// ══════════════════════════════════════════════════════════════
// 5. SUBTLE HOVER ENHANCEMENTS
// ══════════════════════════════════════════════════════════════
function initHoverEffects() {
  if (prefersReducedMotion || isMobile) return;

  // Gentle lift on cards
  const cards = document.querySelectorAll(".why-card, .testimonial-card, .contact-card, .job-card");
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -4, duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.4, ease: "power2.out" });
    });
  });

  // Buttons: subtle scale
  const btns = document.querySelectorAll(".btn, .nav-cta, .quick-apply, .apply-btn");
  btns.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { scale: 1.03, duration: 0.2, ease: "power2.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out" });
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 6. GENTLE AMBIENT ANIMATIONS
// ══════════════════════════════════════════════════════════════
function initAmbientAnimations() {
  if (prefersReducedMotion) return;

  // WhatsApp button: gentle breathing
  gsap.to(".whatsapp", {
    scale: 1.05,
    duration: 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Chatbot button: matching breath
  gsap.to(".chatbot-toggle", {
    scale: 1.05,
    duration: 2.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Gold shimmer on section titles
  document.querySelectorAll(".section-title h2").forEach(h2 => {
    gsap.to(h2, {
      backgroundPosition: "200% center",
      duration: 5,
      ease: "none",
      repeat: -1
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 7. SMOOTH SCROLL
// ══════════════════════════════════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════
// MASTER INITIALIZATION
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // Check if GSAP loaded
  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded — skipping animations.");
    const splash = document.getElementById("splash-screen");
    if (splash) splash.remove();
    document.body.classList.add("splash-done");
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  initSplashScreen();
  initParticleSystem();
  initScrollAnimations();
  initHoverEffects();
  initAmbientAnimations();
  initSmoothScroll();

  // If returning visitor (no splash), run page entrance now
  if (document.body.classList.contains("splash-done")) {
    initPageEntrance();
  }
});
