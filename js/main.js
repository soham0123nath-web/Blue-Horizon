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
  
  // ── DYNAMIC JOBS LOADER ──
  const loadJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      
      const renderGroup = (containerId, countryData) => {
        const container = document.getElementById(containerId);
        if (!container || !countryData) return;
        
        let html = '';
        for (const [division, jobs] of Object.entries(countryData)) {
          html += `
            <div class="division-line">
              <span>✦ ${division.toUpperCase()} ✦</span>
            </div>
            <div class="job-grid">
          `;
          jobs.forEach(job => {
            html += `
              <div class="job-card">
                <div class="job-tag">${job.division}</div>
                <h3>${job.emoji || '🏭'} ${job.title}</h3>
                <div class="salary">${job.salary_display}</div>
                <div class="salary-inr">${job.salary_inr_display || ''}</div>
                <div class="card-actions">
                  <button type="button" class="toggle-btn" aria-expanded="false">View Details</button>
                  <button type="button" class="quick-apply" data-job="${job.title} (${job.country})">Apply →</button>
                </div>
                <div class="job-details" hidden>
                  <ul>
                    ${(job.details || []).map(d => `<li>${d}</li>`).join('')}
                  </ul>
                  <button type="button" class="apply-btn" data-job="${job.title} (${job.country})">💬 Apply via WhatsApp</button>
                </div>
              </div>
            `;
          });
          html += `</div>`;
        }
        container.innerHTML = html || '<p style="text-align:center; padding: 2rem;">No open positions at this moment.</p>';
      };

      if (data.grouped) {
        renderGroup('israel-jobs-container', data.grouped['Israel']);
        renderGroup('vietnam-jobs-container', data.grouped['Vietnam']);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  loadJobs();  
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

  // ── CUSTOM INTERACTIVE CURSOR ──
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    const cursor = document.getElementById('customCursor');
    const ring = document.getElementById('cursorRing');
    
    if (cursor && ring) {
      body.classList.add('custom-cursor-active');
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;
      
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      });
      
      // Smooth interpolation for the ring
      const renderRing = () => {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderRing);
      };
      requestAnimationFrame(renderRing);

      // Hover states for clickable elements
      const clickables = document.querySelectorAll('a, button, input, select, textarea, .job-card, .why-card');
      clickables.forEach(el => {
        el.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
      });
      
      // Magnetic Buttons
      const magneticBtns = document.querySelectorAll('.btn-primary, .nav-cta, .quick-apply');
      magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = `translate(0px, 0px)`;
        });
      });
    }
  }
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
      // Classes and Active states — preserve animation classes
      body.classList.remove("theme-vietnam");
      body.classList.add("theme-israel");
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
      // Classes and Active states — preserve animation classes
      body.classList.remove("theme-israel");
      body.classList.add("theme-vietnam");
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

  // Event Delegation for dynamically loaded job cards
  document.addEventListener("click", (e) => {
    // Handle toggle details
    if (e.target.matches(".toggle-btn")) {
      const card = e.target.closest(".job-card");
      if (!card) return;
      const details = card.querySelector(".job-details");
      if (details) {
        const isHidden = details.hasAttribute("hidden");
        if (isHidden) {
          details.removeAttribute("hidden");
          e.target.textContent = "Hide Details";
          e.target.setAttribute("aria-expanded", "true");
        } else {
          details.setAttribute("hidden", "");
          e.target.textContent = "View Details";
          e.target.setAttribute("aria-expanded", "false");
        }
      }
    }

    // Handle Quick Apply buttons
    if (e.target.matches(".quick-apply") || e.target.matches(".apply-btn")) {
      const jobTitle = e.target.getAttribute("data-job");
      openModal(jobTitle);
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
    body.style.overflow = ""; // Unlock page scroll
    
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
  // (Dynamic apply buttons handled by event delegation above)

  // WhatsApp form submission + Supabase tracking
  modalSubmit.addEventListener("click", async () => {
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

    // Also save to Supabase for tracking (fire-and-forget, don't block WhatsApp)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          full_name: name,
          phone: phone,
          email: email || null,
          job_title: job,
          country: country,
          experience: exp || null,
          cover_note: msg || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Store tracking ID locally
        localStorage.setItem('bh_tracking_id', result.tracking_id);
        localStorage.setItem('bh_tracking_phone', phone);

        // Show tracking ID to user
        alert(`✅ Application Submitted!\n\nYour Tracking ID: ${result.tracking_id}\n\nSave this ID to track your application status at any time.\n\nYou can also check your status at:\nbluehorizonoverseas.in/tracker`);
      }
    } catch (err) {
      // Silently fail — WhatsApp is the primary flow, tracking is secondary
      console.log('Tracking save failed (non-critical):', err.message);
    }

    closeModal();
  });

  // Initialize default theme (use classList to preserve animation classes)
  body.classList.add("theme-israel");

  // ── AI CHATBOT WIDGET ──
  const chatbotToggle = document.getElementById("chatbotToggle");
  const chatbotWindow = document.getElementById("chatbotWindow");
  const chatbotInput = document.getElementById("chatbotInput");
  const chatbotSend = document.getElementById("chatbotSend");
  const chatbotMessages = document.getElementById("chatbotMessages");
  const chatbotIcon = document.querySelector(".chatbot-icon");
  const chatbotCloseIcon = document.querySelector(".chatbot-close-icon");

  let chatbotSessionId = localStorage.getItem("bh_chat_session") || ("s_" + Date.now());
  localStorage.setItem("bh_chat_session", chatbotSessionId);

  if (chatbotToggle) {
    chatbotToggle.addEventListener("click", () => {
      const isOpen = chatbotWindow.classList.toggle("open");
      chatbotIcon.style.display = isOpen ? "none" : "inline";
      chatbotCloseIcon.style.display = isOpen ? "inline" : "none";

      if (isOpen && typeof gsap !== "undefined") {
        gsap.fromTo(chatbotWindow, 
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }
        );
        chatbotInput.focus();
      }
    });
  }

  if (chatbotSend) {
    chatbotSend.addEventListener("click", sendChatbotMessage);
  }
  if (chatbotInput) {
    chatbotInput.addEventListener("keydown", e => {
      if (e.key === "Enter") sendChatbotMessage();
    });
  }

  async function sendChatbotMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    // Add user message
    addChatbotMsg("user", message);
    chatbotInput.value = "";

    // Show typing indicator
    const typingEl = document.createElement("div");
    typingEl.className = "cb-msg bot";
    typingEl.innerHTML = `<div class="cb-typing"><span></span><span></span><span></span></div>`;
    chatbotMessages.appendChild(typingEl);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    try {
      const res = await fetch("/api/ai-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: chatbotSessionId })
      });

      typingEl.remove();

      if (res.ok) {
        const data = await res.json();
        addChatbotMsg("bot", data.reply);
        if (data.session_id) chatbotSessionId = data.session_id;
      } else {
        addChatbotMsg("bot", getLocalChatbotReply(message));
      }
    } catch {
      typingEl.remove();
      addChatbotMsg("bot", getLocalChatbotReply(message));
    }
  }

  function addChatbotMsg(role, content) {
    const div = document.createElement("div");
    div.className = `cb-msg ${role}`;
    div.innerHTML = `<div class="cb-bubble">${content.replace(/\n/g, "<br>")}</div>`;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    if (typeof gsap !== "undefined") {
      gsap.from(div, { y: 10, opacity: 0, duration: 0.25, ease: "power2.out" });
    }
  }

  function getLocalChatbotReply(msg) {
    const m = msg.toLowerCase();
    if (m.includes("salary") || m.includes("pay") || m.includes("earn"))
      return "💰 Israel positions: $1,000–$1,900 USD/month. Vietnam: ₹30K–₹65K/month. Free accommodation & food included! Try our <a href='calculator/' style='color:var(--gold)'>Salary Calculator</a> for details.";
    if (m.includes("visa") || m.includes("document") || m.includes("passport"))
      return "🛂 We handle the full visa process! We accept ECR & ECNR passports. You'll need: Passport, Photos, Certificates, and Experience letters.";
    if (m.includes("apply") || m.includes("job"))
      return "📋 Browse jobs above, click 'Apply', fill the form, and it goes to our team via WhatsApp. You'll get a tracking ID to monitor progress!";
    if (m.includes("track") || m.includes("status"))
      return "📍 Track your application at our <a href='tracker/' style='color:var(--gold)'>Tracker page</a>. Enter your Tracking ID + phone number.";
    if (m.includes("hello") || m.includes("hi") || m.includes("hey"))
      return "👋 Hello! Welcome to Blue Horizon Overseas! Ask me about jobs, salaries, visa process, or anything else. I'm here to help!";
    if (m.includes("contact") || m.includes("phone") || m.includes("whatsapp"))
      return "📞 WhatsApp: +91 89420 69079 | Helpline: +91 92308 59550 | Email: global@bluehorizonoverseas.in";
    if (m.includes("accommodation") || m.includes("food") || m.includes("living"))
      return "🏠 Yes! Free accommodation & food are provided by employers for all placements. Most of your salary goes straight to savings!";
    return "Thanks for your question! For detailed help, contact us on WhatsApp: <a href='https://wa.me/918942069079' target='_blank' style='color:var(--gold)'>+91 89420 69079</a> 😊";
  }
});
