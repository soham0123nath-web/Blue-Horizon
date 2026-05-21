// ── BLUE HORIZON CONFIGURATION ──
const WHATSAPP_NUMBER = "918942069079"; // Replace with your agency WhatsApp number (include country code, e.g., 91 for India)

document.addEventListener("DOMContentLoaded", () => {
  // ── ELEMENTS ──
  const body = document.body;
  const progress = document.getElementById("progress-bar");
  const nav = document.getElementById("mainNav");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  // Tabs
  const tabIsrael = document.getElementById("tab-israel");
  const tabVietnam = document.getElementById("tab-vietnam");
  const groupIsrael = document.getElementById("group-israel");
  const groupVietnam = document.getElementById("group-vietnam");
  
  // Salary Highlights Dynamic Content
  const salaryVal = document.getElementById("salary-val");
  const salarySub = document.getElementById("salary-sub");
  const salaryBens = document.getElementById("salary-bens");
  
  // Search
  const jobSearchInput = document.getElementById("jobSearch");
  const noResults = document.getElementById("no-results");
  
  // Modal
  const applyModal = document.getElementById("applyModal");
  const modalClose = document.getElementById("modalClose");
  const modalJobTitle = document.getElementById("modalJobTitle");
  const modalSubmit = document.getElementById("modalSubmit");
  
  // Form inputs
  const applicantName = document.getElementById("applicantName");
  const applicantPhone = document.getElementById("applicantPhone");
  const applicantEmail = document.getElementById("applicantEmail");
  const applicantExp = document.getElementById("applicantExp");
  const applicantMsg = document.getElementById("applicantMsg");

  // ── 3D HERO TITLE INTERACTION ──
  const heroSection = document.getElementById("hero");
  const hero3dTitle = document.getElementById("hero3dTitle");
  
  if (heroSection && hero3dTitle) {
    let requestRef = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    const ease = 0.08; // smooth interpolation factor
    
    const updateRotation = () => {
      currentRotateX += (targetRotateX - currentRotateX) * ease;
      currentRotateY += (targetRotateY - currentRotateY) * ease;
      
      hero3dTitle.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
      
      // Stop loop if rotation reaches target
      if (Math.abs(targetRotateX - currentRotateX) > 0.01 || Math.abs(targetRotateY - currentRotateY) > 0.01) {
        requestRef = requestAnimationFrame(updateRotation);
      } else {
        requestRef = null;
      }
    };
    
    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return; // skip on mobile to let CSS float keyframe run
      
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate rotation angles (rotateX up to 10deg, rotateY up to 12deg)
      targetRotateX = -(y / (rect.height / 2)) * 10;
      targetRotateY = (x / (rect.width / 2)) * 12;
      
      if (!requestRef) {
        requestRef = requestAnimationFrame(updateRotation);
      }
    };
    
    const handleMouseLeave = () => {
      targetRotateX = 0;
      targetRotateY = 0;
      
      if (!requestRef) {
        requestRef = requestAnimationFrame(updateRotation);
      }
    };
    
    heroSection.addEventListener("mousemove", handleMouseMove);
    heroSection.addEventListener("mouseleave", handleMouseLeave);
  }

  // ── NAVIGATION CONTROLS ──
  // Hamburger toggle
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  // Mobile navigation close on link click
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  // Scroll events: Progress bar and Nav sticky styling
  window.addEventListener("scroll", () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progress.style.width = scrolled + "%";

    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });

  // ── COUNTRY / THEME SWITCHER ──
  const switchCountry = (country) => {
    // Reset search
    jobSearchInput.value = "";
    filterJobs();

    if (country === "israel") {
      // Classes and Active states
      body.className = "theme-israel";
      tabIsrael.classList.add("active");
      tabVietnam.classList.remove("active");
      
      groupIsrael.classList.add("active");
      groupVietnam.classList.remove("active");

      // Update Salary Highlight Banner Content
      salaryVal.textContent = "$1000 – $1900 USD";
      salarySub.textContent = "₹85K – ₹1.62L INR / Month";
      salaryBens.innerHTML = `
        <span>🏠 Free Accommodation</span>
        <span>🍽️ Food Provided</span>
        <span>⏰ Overtime Available</span>
        <span>🏭 Industrial Environment</span>
      `;
    } else if (country === "vietnam") {
      // Classes and Active states
      body.className = "theme-vietnam";
      tabVietnam.classList.add("active");
      tabIsrael.classList.remove("active");
      
      groupVietnam.classList.add("active");
      groupIsrael.classList.remove("active");

      // Update Salary Highlight Banner Content
      salaryVal.textContent = "₹30,000 – ₹65,000 INR";
      salarySub.textContent = "Premium Overseas Placements";
      salaryBens.innerHTML = `
        <span>🏠 Accommodation Provided</span>
        <span>🍽️ Food Provided</span>
        <span>⏰ Overtime Available</span>
        <span>✈️ Hospitality & Processing Roles</span>
      `;
    }

    // Smoothly scroll to jobs section title
    const jobsSection = document.getElementById("jobs");
    if (jobsSection) {
      const yOffset = -100; 
      const y = jobsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  tabIsrael.addEventListener("click", () => switchCountry("israel"));
  tabVietnam.addEventListener("click", () => switchCountry("vietnam"));

  // ── JOB CARD EXPANSIONS ──
  document.querySelectorAll(".job-card").forEach(card => {
    const toggleBtn = card.querySelector(".toggle-btn");
    const details = card.querySelector(".job-details");

    if (toggleBtn && details) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = details.hasAttribute("hidden");
        
        if (isHidden) {
          details.removeAttribute("hidden");
          toggleBtn.textContent = "Hide Details";
          toggleBtn.setAttribute("aria-expanded", "true");
        } else {
          details.setAttribute("hidden", "");
          toggleBtn.textContent = "View Details";
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  });

  // ── SEARCH AND FILTER ──
  const filterJobs = () => {
    const query = jobSearchInput.value.toLowerCase().trim();
    // Search within active country only
    const activeGroup = body.classList.contains("theme-vietnam") ? groupVietnam : groupIsrael;
    const cards = activeGroup.querySelectorAll(".job-card");
    const divisions = activeGroup.querySelectorAll(".division-line");
    let hasMatches = false;

    cards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const tag = card.querySelector(".job-tag").textContent.toLowerCase();
      const details = card.querySelector(".job-details") ? card.querySelector(".job-details").textContent.toLowerCase() : "";
      
      const isMatch = title.includes(query) || tag.includes(query) || details.includes(query);
      
      if (isMatch) {
        card.style.display = "block";
        hasMatches = true;
      } else {
        card.style.display = "none";
      }
    });

    // Toggle division lines depending on whether they contain visible cards
    divisions.forEach(div => {
      const divId = div.id;
      const gridId = divId.replace("div-", "grid-");
      const grid = document.getElementById(gridId);
      
      if (grid) {
        const visibleCards = Array.from(grid.querySelectorAll(".job-card")).filter(c => c.style.display !== "none");
        if (visibleCards.length > 0) {
          div.style.display = "flex";
          grid.style.display = "grid";
        } else {
          div.style.display = "none";
          grid.style.display = "none";
        }
      }
    });

    // Show / Hide No Results element
    if (hasMatches) {
      noResults.style.display = "none";
    } else {
      noResults.style.display = "block";
    }
  };

  jobSearchInput.addEventListener("input", filterJobs);

  // ── MODAL & WHATSAPP APPLICATION SYSTEM ──
  const openModal = (jobTitle) => {
    modalJobTitle.textContent = jobTitle;
    applyModal.classList.add("open");
    applyModal.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden"; // Lock page scroll
  };

  const closeModal = () => {
    applyModal.classList.remove("open");
    applyModal.setAttribute("aria-hidden", "true");
    body.style.overflow = "visible"; // Unlock page scroll
    
    // Clear inputs
    applicantName.value = "";
    applicantPhone.value = "";
    applicantEmail.value = "";
    applicantExp.value = "";
    applicantMsg.value = "";
  };

  // Close triggers
  modalClose.addEventListener("click", closeModal);
  applyModal.addEventListener("click", (e) => {
    if (e.target === applyModal) closeModal();
  });

  // Attach modal triggers to job cards
  document.querySelectorAll(".quick-apply, .apply-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const job = btn.getAttribute("data-job");
      openModal(job);
    });
  });

  // WhatsApp form submission
  modalSubmit.addEventListener("click", () => {
    const name = applicantName.value.trim();
    const phone = applicantPhone.value.trim();
    const email = applicantEmail.value.trim();
    const exp = applicantExp.value;
    const msg = applicantMsg.value.trim();
    const job = modalJobTitle.textContent;
    const country = body.classList.contains("theme-vietnam") ? "Vietnam" : "Israel";

    // Validations
    if (!name) {
      alert("Please enter your full name.");
      applicantName.focus();
      return;
    }
    if (!phone) {
      alert("Please enter your WhatsApp phone number.");
      applicantPhone.focus();
      return;
    }

    // Construct professional WhatsApp message
    let messageText = `*New Job Application - Blue Horizon Overseas*\n\n`;
    messageText += `*Position:* ${job}\n`;
    messageText += `*Country:* ${country}\n\n`;
    messageText += `*Full Name:* ${name}\n`;
    messageText += `*WhatsApp Phone:* ${phone}\n`;
    if (email) messageText += `*Email:* ${email}\n`;
    if (exp) messageText += `*Experience:* ${exp}\n`;
    if (msg) messageText += `\n*Message:* ${msg}`;

    // Encode message and open WhatsApp deep link
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");
    closeModal();
  });

  // ── SCROLL REVEAL UTILITY ──
  const reveals = document.querySelectorAll(".reveal");
  
  const handleScrollReveal = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 120; // threshold
      
      if (elementTop < windowHeight - elementVisible) {
        el.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", handleScrollReveal);

  // Initialize
  body.className = "theme-israel"; // default
  handleScrollReveal();
});
