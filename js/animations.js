/**
 * ══════════════════════════════════════════════════════════════
 * BLUE HORIZON OVERSEAS — ANIMATION ENGINE
 * Powered by GSAP + ScrollTrigger
 * ══════════════════════════════════════════════════════════════
 */

// ── ACCESSIBILITY: Respect prefers-reduced-motion ──
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const isMobile = window.innerWidth <= 768;

// ══════════════════════════════════════════════════════════════
// 1. SPLASH SCREEN INTRO
// ══════════════════════════════════════════════════════════════
function initSplashScreen() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;

  // Skip splash for returning visitors (within 24 hours)
  const lastVisit = localStorage.getItem("bh_lastVisit");
  const now = Date.now();
  if (lastVisit && now - parseInt(lastVisit) < 86400000) {
    splash.remove();
    document.body.classList.add("splash-done");
    return;
  }

  localStorage.setItem("bh_lastVisit", String(now));

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

  // Logo letters cascade in
  tl.from(".splash-letter", {
    y: 80,
    opacity: 0,
    rotateX: -90,
    stagger: 0.06,
    duration: 0.6,
    ease: "back.out(1.7)"
  })
  .to(".splash-tagline", {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.2")
  .to(".splash-content", {
    scale: 0.9,
    opacity: 0,
    duration: 0.4,
    ease: "power2.in",
    delay: 0.6
  })
  .to(splash, {
    clipPath: "circle(0% at 50% 50%)",
    duration: 0.7,
    ease: "power3.in"
  }, "-=0.2");

  // Skip button
  const skipBtn = document.getElementById("splash-skip");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => tl.progress(1));
  }
}

// ══════════════════════════════════════════════════════════════
// 2. PAGE ENTRANCE (after splash)
// ══════════════════════════════════════════════════════════════
function initPageEntrance() {
  if (prefersReducedMotion) return;

  const tl = gsap.timeline();

  // Nav slides down
  tl.from("#mainNav", {
    y: -100,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out"
  });

  // Hero content fades in
  tl.from(".hero-eyebrow", {
    y: 30,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.3");

  // Hero 3D title chars cascade
  tl.from(".hero-3d-title .char", {
    y: 100,
    opacity: 0,
    rotateX: -90,
    stagger: 0.04,
    duration: 0.5,
    ease: "back.out(1.4)"
  }, "-=0.3");

  // Tagline types in
  tl.from(".hero-tagline", {
    y: 20,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.2");

  tl.from(".hero-content > p", {
    y: 20,
    opacity: 0,
    duration: 0.4,
    ease: "power2.out"
  }, "-=0.2");

  // Buttons pop in
  tl.from(".hero-buttons .btn", {
    scale: 0,
    opacity: 0,
    stagger: 0.1,
    duration: 0.4,
    ease: "back.out(2)"
  }, "-=0.2");
}

// ══════════════════════════════════════════════════════════════
// 3. SCROLL-TRIGGERED SECTION ANIMATIONS
// ══════════════════════════════════════════════════════════════
function initScrollAnimations() {
  if (prefersReducedMotion) {
    // Make everything visible immediately
    gsap.set(".reveal, .stat-item, .why-card, .process-step, .job-card, .testimonial-card, .faq-item, .contact-card", {
      opacity: 1,
      clearProps: "all"
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Stats Bar: Animated Counters ──
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach(el => {
    const rawText = el.textContent.trim();
    // Parse the target number
    let target = 0;
    let prefix = "";
    let suffix = "";

    if (rawText.includes("₹")) {
      prefix = "₹";
      const num = rawText.replace(/[^\d.]/g, "");
      target = parseFloat(num);
      suffix = rawText.includes("L") ? "L+" : "+";
    } else if (rawText.includes("%")) {
      target = parseInt(rawText);
      suffix = "%";
    } else {
      target = parseInt(rawText.replace(/[^\d]/g, ""));
      suffix = rawText.includes("+") ? "+" : "";
    }

    el.setAttribute("data-target", target);
    el.setAttribute("data-prefix", prefix);
    el.setAttribute("data-suffix", suffix);
    el.textContent = prefix + "0" + suffix;

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            const isDecimal = String(target).includes(".");
            const display = isDecimal ? obj.val.toFixed(2) : Math.floor(obj.val);
            el.textContent = prefix + display + suffix;
          }
        });
      }
    });
  });

  // ── Stats Bar Container ──
  gsap.from(".stats-bar .stat-item", {
    scrollTrigger: {
      trigger: ".stats-bar",
      start: "top 85%",
      once: true
    },
    y: 60,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: "power3.out"
  });

  // ── Why Us Cards: Fan out from center ──
  gsap.from(".why-card", {
    scrollTrigger: {
      trigger: ".why-section",
      start: "top 75%",
      once: true
    },
    y: 80,
    opacity: 0,
    rotateY: -15,
    stagger: 0.1,
    duration: 0.6,
    ease: "power3.out"
  });

  // ── Process Steps: Sequential timeline ──
  const steps = document.querySelectorAll(".process-step");
  steps.forEach((step, i) => {
    gsap.from(step, {
      scrollTrigger: {
        trigger: step,
        start: "top 85%",
        once: true
      },
      x: i % 2 === 0 ? -60 : 60,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1,
      ease: "power3.out"
    });

    // Animate the step number with a pop
    gsap.from(step.querySelector(".step-num"), {
      scrollTrigger: {
        trigger: step,
        start: "top 85%",
        once: true
      },
      scale: 0,
      duration: 0.4,
      delay: i * 0.1 + 0.2,
      ease: "back.out(3)"
    });
  });

  // ── Section Titles ──
  document.querySelectorAll(".section-title").forEach(title => {
    gsap.from(title.children, {
      scrollTrigger: {
        trigger: title,
        start: "top 85%",
        once: true
      },
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out"
    });
  });

  // ── Country Switcher ──
  gsap.from(".country-switcher", {
    scrollTrigger: {
      trigger: ".country-switcher",
      start: "top 85%",
      once: true
    },
    y: 30,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  });

  // ── Salary Highlight ──
  gsap.from(".salary-highlight", {
    scrollTrigger: {
      trigger: ".salary-highlight",
      start: "top 85%",
      once: true
    },
    scale: 0.9,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(1.5)"
  });

  // ── Job Cards: Cascade from alternating sides ──
  document.querySelectorAll(".job-grid").forEach(grid => {
    const cards = grid.querySelectorAll(".job-card");
    cards.forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          once: true
        },
        x: i % 2 === 0 ? -50 : 50,
        y: 40,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.05,
        ease: "power3.out"
      });
    });
  });

  // ── Division Lines ──
  document.querySelectorAll(".division-line").forEach(line => {
    gsap.from(line, {
      scrollTrigger: {
        trigger: line,
        start: "top 88%",
        once: true
      },
      scaleX: 0,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  });

  // ── Testimonial Cards: Flip in ──
  gsap.from(".testimonial-card", {
    scrollTrigger: {
      trigger: ".testimonials-section",
      start: "top 75%",
      once: true
    },
    rotateY: -30,
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.7,
    ease: "power3.out"
  });

  // Animate stars individually
  document.querySelectorAll(".testimonial-card .stars").forEach(stars => {
    gsap.from(stars, {
      scrollTrigger: {
        trigger: stars,
        start: "top 85%",
        once: true
      },
      scale: 0,
      duration: 0.4,
      delay: 0.3,
      ease: "back.out(3)"
    });
  });

  // ── FAQ Items: Slide in from right ──
  gsap.from(".faq-item", {
    scrollTrigger: {
      trigger: ".faq-section",
      start: "top 75%",
      once: true
    },
    x: 60,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "power3.out"
  });

  // ── Social Box: Scale up from center ──
  gsap.from(".social-box", {
    scrollTrigger: {
      trigger: ".social-section",
      start: "top 80%",
      once: true
    },
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: "elastic.out(1, 0.5)"
  });

  // ── Contact Cards: 3D tilt reveal ──
  gsap.from(".contact-card", {
    scrollTrigger: {
      trigger: "#contact",
      start: "top 75%",
      once: true
    },
    y: 60,
    opacity: 0,
    rotateX: -15,
    stagger: 0.12,
    duration: 0.6,
    ease: "power3.out"
  });

  // ── Footer ──
  gsap.from(".footer-top > div", {
    scrollTrigger: {
      trigger: "footer",
      start: "top 90%",
      once: true
    },
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out"
  });

  // ── Badges ──
  gsap.from(".badge", {
    scrollTrigger: {
      trigger: ".badge",
      start: "top 85%",
      once: true
    },
    scale: 0,
    opacity: 0,
    stagger: 0.1,
    duration: 0.4,
    ease: "back.out(2)"
  });
}

// ══════════════════════════════════════════════════════════════
// 4. PARTICLE BACKGROUND SYSTEM
// ══════════════════════════════════════════════════════════════
function initParticleSystem() {
  if (prefersReducedMotion) return;

  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let animFrameId = null;
  let isVisible = true;

  const PARTICLE_COUNT = isMobile ? 30 : 60;
  const CONNECTION_DIST = isMobile ? 100 : 150;
  const MOUSE_RADIUS = 120;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
  }

  function getThemeColor() {
    const isVietnam = document.body.classList.contains("theme-vietnam");
    return isVietnam
      ? { r: 218, g: 55, b: 50, hex: "#da3732" }   // Red for Vietnam
      : { r: 212, g: 175, b: 55, hex: "#d4af37" };  // Gold for Israel
  }

  function createParticle() {
    const color = getThemeColor();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      color: color
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
    ctx.fill();
  }

  function drawConnections() {
    const scrollY = window.scrollY;
    const viewTop = scrollY;
    const viewBottom = scrollY + window.innerHeight;

    for (let i = 0; i < particles.length; i++) {
      // Only draw connections for visible particles
      if (particles[i].y < viewTop - 200 || particles[i].y > viewBottom + 200) continue;

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
          const c = particles[i].color;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse interaction — gentle repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;
    });
  }

  function animate() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);
    update();
    drawConnections();
    particles.forEach(drawParticle);
    animFrameId = requestAnimationFrame(animate);
  }

  // Mouse tracking (relative to document, not viewport)
  document.addEventListener("mousemove", e => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  });

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible && !animFrameId) animate();
  });

  // Resize handling
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
    }, 200);
  });

  // Re-color particles on theme switch
  const observer = new MutationObserver(() => {
    const newColor = getThemeColor();
    particles.forEach(p => { p.color = newColor; });
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  init();
  animate();
}

// ══════════════════════════════════════════════════════════════
// 5. CUSTOM CURSOR
// ══════════════════════════════════════════════════════════════
function initCustomCursor() {
  if (isTouchDevice || isMobile || prefersReducedMotion) return;

  const cursor = document.getElementById("custom-cursor");
  const follower = document.getElementById("cursor-follower");
  if (!cursor || !follower) return;

  let cx = 0, cy = 0;
  let fx = 0, fy = 0;

  document.addEventListener("mousemove", e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  });

  // Smooth follower
  function moveFollower() {
    fx += (cx - fx) * 0.12;
    fy += (cy - fy) * 0.12;
    follower.style.transform = `translate(${fx}px, ${fy}px)`;
    requestAnimationFrame(moveFollower);
  }
  moveFollower();

  // Grow cursor on interactive elements
  const interactiveSelectors = "a, button, .btn, .job-card, .why-card, .switcher-btn, .faq-q, input, select, textarea";
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
      follower.classList.add("follower-hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
      follower.classList.remove("follower-hover");
    });
  });

  // Hide default cursor
  document.body.classList.add("custom-cursor-active");
}

// ══════════════════════════════════════════════════════════════
// 6. MAGNETIC BUTTONS
// ══════════════════════════════════════════════════════════════
function initMagneticButtons() {
  if (isTouchDevice || isMobile || prefersReducedMotion) return;

  const magneticEls = document.querySelectorAll(".btn, .nav-cta, .switcher-btn, .quick-apply, .apply-btn, .social-btn");

  magneticEls.forEach(el => {
    el.addEventListener("mousemove", e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = 0.3;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 7. PARALLAX EFFECTS
// ══════════════════════════════════════════════════════════════
function initParallax() {
  if (prefersReducedMotion || isMobile) return;

  // Hero parallax
  const hero = document.querySelector(".hero");
  if (hero) {
    gsap.to(hero, {
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      },
      backgroundPositionY: "50%",
      ease: "none"
    });
  }

  // Floating decorative shapes
  document.querySelectorAll(".parallax-shape").forEach(shape => {
    const speed = parseFloat(shape.getAttribute("data-speed")) || 0.5;
    gsap.to(shape, {
      scrollTrigger: {
        trigger: shape.closest("section") || shape.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      },
      y: () => -100 * speed,
      ease: "none"
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 8. CONTINUOUS MICRO-ANIMATIONS
// ══════════════════════════════════════════════════════════════
function initMicroAnimations() {
  if (prefersReducedMotion) return;

  // Hero eyebrow: floating
  gsap.to(".hero-eyebrow", {
    y: -5,
    duration: 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // WhatsApp button: breathing pulse
  gsap.to(".whatsapp", {
    scale: 1.1,
    duration: 1.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Process step numbers: orbital glow
  document.querySelectorAll(".step-num").forEach((num, i) => {
    gsap.to(num, {
      boxShadow: "0 0 20px rgba(212,175,55,0.6), 0 0 40px rgba(212,175,55,0.2)",
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: i * 0.3
    });
  });

  // Stats subtle pulse
  document.querySelectorAll(".stat-number").forEach((stat, i) => {
    gsap.to(stat, {
      scale: 1.05,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: i * 1.5
    });
  });

  // Nav logo letter-spacing on idle
  gsap.to(".logo", {
    letterSpacing: "3px",
    duration: 3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Badge subtle float
  document.querySelectorAll(".badge").forEach((badge, i) => {
    gsap.to(badge, {
      y: -3,
      duration: 2.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: i * 0.5
    });
  });

  // Gold gradient shift on section titles
  document.querySelectorAll(".section-title h2").forEach(h2 => {
    gsap.to(h2, {
      backgroundPosition: "200% center",
      duration: 4,
      ease: "none",
      repeat: -1
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 9. INTERACTION ENHANCEMENTS
// ══════════════════════════════════════════════════════════════
function initInteractionAnimations() {
  if (prefersReducedMotion) return;

  // ── Card 3D Tilt Effect ──
  const tiltCards = document.querySelectorAll(".why-card, .testimonial-card, .contact-card");
  tiltCards.forEach(card => {
    if (isTouchDevice) return;

    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 800,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });
    });
  });

  // ── Ripple Click Effect on Buttons ──
  document.querySelectorAll(".btn, .quick-apply, .apply-btn, .modal-submit, .nav-cta, .social-btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      ripple.classList.add("btn-ripple");
      const rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + "px";
      ripple.style.top = (e.clientY - rect.top) + "px";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── Nav Link Hover Underline ──
  document.querySelectorAll(".nav-links a:not(.nav-cta)").forEach(link => {
    link.addEventListener("mouseenter", () => {
      gsap.fromTo(link, { backgroundSize: "0% 2px" }, {
        backgroundSize: "100% 2px",
        duration: 0.3,
        ease: "power2.out"
      });
    });
    link.addEventListener("mouseleave", () => {
      gsap.to(link, {
        backgroundSize: "0% 2px",
        duration: 0.2,
        ease: "power2.in"
      });
    });
  });

  // ── Search Input Focus Expand ──
  const searchInput = document.getElementById("jobSearch");
  if (searchInput) {
    searchInput.addEventListener("focus", () => {
      gsap.to(".search-wrap", {
        scale: 1.02,
        boxShadow: "0 0 30px rgba(212,175,55,0.3)",
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(".search-icon", {
        rotation: 90,
        duration: 0.3,
        ease: "back.out(2)"
      });
    });
    searchInput.addEventListener("blur", () => {
      gsap.to(".search-wrap", {
        scale: 1,
        boxShadow: "none",
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(".search-icon", {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  }

  // ── Modal Spring Animation ──
  const applyModal = document.getElementById("applyModal");
  if (applyModal) {
    const observer = new MutationObserver(() => {
      if (applyModal.classList.contains("open")) {
        gsap.fromTo(".modal", {
          y: 80,
          scale: 0.9,
          opacity: 0
        }, {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.5)"
        });
      }
    });
    observer.observe(applyModal, { attributes: true, attributeFilter: ["class"] });
  }

  // ── Country Switcher Spring ──
  document.querySelectorAll(".switcher-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      gsap.fromTo(btn, { scale: 0.95 }, {
        scale: 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 10. FLOATING DECORATIVE SHAPES
// ══════════════════════════════════════════════════════════════
function createFloatingShapes() {
  if (prefersReducedMotion || isMobile) return;

  const container = document.getElementById("floating-shapes");
  if (!container) return;

  const shapes = [
    { type: "circle", size: 8, x: "10%", y: "20%", speed: 0.3 },
    { type: "circle", size: 5, x: "85%", y: "15%", speed: 0.5 },
    { type: "diamond", size: 12, x: "90%", y: "40%", speed: 0.4 },
    { type: "circle", size: 6, x: "5%", y: "55%", speed: 0.6 },
    { type: "diamond", size: 10, x: "75%", y: "70%", speed: 0.35 },
    { type: "circle", size: 4, x: "15%", y: "80%", speed: 0.45 },
    { type: "diamond", size: 8, x: "50%", y: "30%", speed: 0.55 },
    { type: "circle", size: 7, x: "60%", y: "60%", speed: 0.4 }
  ];

  shapes.forEach(s => {
    const el = document.createElement("div");
    el.classList.add("parallax-shape", `shape-${s.type}`);
    el.setAttribute("data-speed", s.speed);
    el.style.cssText = `
      position: absolute;
      left: ${s.x};
      top: ${s.y};
      width: ${s.size}px;
      height: ${s.size}px;
      pointer-events: none;
    `;
    container.appendChild(el);

    // Give each shape a gentle drifting animation
    gsap.to(el, {
      x: `random(-30, 30)`,
      y: `random(-20, 20)`,
      rotation: `random(-180, 180)`,
      duration: `random(8, 15)`,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  });
}

// ══════════════════════════════════════════════════════════════
// 11. SMOOTH SCROLL
// ══════════════════════════════════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════
// MASTER INITIALIZATION
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  initSplashScreen();
  initParticleSystem();
  initCustomCursor();
  initScrollAnimations();
  initMagneticButtons();
  initParallax();
  initMicroAnimations();
  initInteractionAnimations();
  createFloatingShapes();
  initSmoothScroll();

  // If no splash (returning visitor), run page entrance immediately
  if (document.body.classList.contains("splash-done")) {
    initPageEntrance();
  }
});
