// ── BLUE HORIZON CONFIGURATION ──
const WHATSAPP_NUMBER = "918942069079"; // Replace with your agency WhatsApp number (include country code, e.g., 91 for India)

// HTML sanitizer to prevent XSS from API data
const esc = (s) => typeof s === 'string' ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') : s;

document.addEventListener("DOMContentLoaded", () => {
  // ── ELEMENTS ──
  const body = document.body;
  const progress = document.getElementById("progress-bar");
  const nav = document.getElementById("mainNav");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  
  // Country flag codes (common ones — extensible)
  const COUNTRY_FLAGS = {
    'Israel': { flag: '🇮🇱', code: 'il' },
    'Vietnam': { flag: '🇻🇳', code: 'vn' },
    'UAE': { flag: '🇦🇪', code: 'ae' },
    'Saudi Arabia': { flag: '🇸🇦', code: 'sa' },
    'Qatar': { flag: '🇶🇦', code: 'qa' },
    'Kuwait': { flag: '🇰🇼', code: 'kw' },
    'Bahrain': { flag: '🇧🇭', code: 'bh' },
    'Oman': { flag: '🇴🇲', code: 'om' },
    'Singapore': { flag: '🇸🇬', code: 'sg' },
    'Malaysia': { flag: '🇲🇾', code: 'my' },
    'Japan': { flag: '🇯🇵', code: 'jp' },
    'South Korea': { flag: '🇰🇷', code: 'kr' },
    'Germany': { flag: '🇩🇪', code: 'de' },
    'Poland': { flag: '🇵🇱', code: 'pl' },
    'Romania': { flag: '🇷🇴', code: 'ro' },
    'Hungary': { flag: '🇭🇺', code: 'hu' },
    'Croatia': { flag: '🇭🇷', code: 'hr' },
    'Canada': { flag: '🇨🇦', code: 'ca' },
    'Australia': { flag: '🇦🇺', code: 'au' },
    'New Zealand': { flag: '🇳🇿', code: 'nz' },
    'UK': { flag: '🇬🇧', code: 'gb' },
    'USA': { flag: '🇺🇸', code: 'us' },
  };
  const getCountryInfo = (name) => COUNTRY_FLAGS[name] || { flag: '🌍', code: null };

  // Dynamic state
  let allCountries = [];
  let activeCountry = null;
  const countrySwitcher = document.getElementById('countrySwitcher');
  const dynamicJobGroups = document.getElementById('dynamicJobGroups');
  
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
        const divisions = new Set();
        for (const [division, jobs] of Object.entries(countryData)) {
          divisions.add(division);
          html += `
            <div class="division-line" data-division="${division}">
              <span>✦ ${division.toUpperCase()} ✦</span>
            </div>
            <div class="job-grid" data-division="${division}">
          `;
          jobs.forEach(job => {
            html += `
              <div class="job-card" data-division="${esc(division)}" data-country="${esc(job.country)}">
                <div class="job-tag">${esc(division)}</div>
                <h3>${esc(job.emoji) || '🏭'} ${esc(job.title)}</h3>
                <div class="salary">${esc(job.salary_display)}</div>
                <div class="salary-inr">${esc(job.salary_inr_display) || ''}</div>
                <div class="card-actions">
                  <button type="button" class="toggle-btn" aria-expanded="false">View Details</button>
                  <button type="button" class="quick-apply" data-job="${esc(job.title)} (${esc(job.country)})">Apply →</button>
                </div>
                <div class="job-details" hidden>
                  <ul>
                    ${(job.details || []).map(d => `<li>${esc(d)}</li>`).join('')}
                  </ul>
                  <button type="button" class="apply-btn" data-job="${esc(job.title)} (${esc(job.country)})">📨 Apply Now</button>
                </div>
              </div>
            `;
          });
          html += `</div>`;
        }
        container.innerHTML = html || '<p style="text-align:center; padding: 2rem;">No open positions at this moment.</p>';
        return divisions;
      };

      if (data.grouped) {
        allCountries = Object.keys(data.grouped);
        
        // Build country tabs dynamically
        let tabsHtml = '';
        allCountries.forEach((country, i) => {
          const info = getCountryInfo(country);
          const isActive = i === 0 ? 'active' : '';
          const flagImg = info.code 
            ? `<img src="https://flagcdn.com/w40/${info.code}.png" alt="${esc(country)} Flag">` 
            : '';
          tabsHtml += `
            <button type="button" class="switcher-btn ${isActive}" data-country="${esc(country)}" role="tab" aria-selected="${i === 0}">
              ${flagImg}
              <span>${info.flag} ${esc(country)} Placements</span>
            </button>
          `;
        });
        countrySwitcher.innerHTML = tabsHtml;

        // Build job groups dynamically
        let groupsHtml = '';
        allCountries.forEach((country, i) => {
          const slug = country.toLowerCase().replace(/\s+/g, '-');
          groupsHtml += `
            <div class="country-job-group ${i === 0 ? 'active' : ''}" id="group-${slug}" data-country="${esc(country)}" role="tabpanel">
              <div class="division-filters" id="${slug}-division-filters"></div>
              <div id="${slug}-jobs-container" class="dynamic-jobs-container"></div>
            </div>
          `;
        });
        dynamicJobGroups.innerHTML = groupsHtml;

        // Render jobs into each group
        allCountries.forEach(country => {
          const slug = country.toLowerCase().replace(/\s+/g, '-');
          const divisions = renderGroup(`${slug}-jobs-container`, data.grouped[country]);
          buildFilterPills(`${slug}-division-filters`, `${slug}-jobs-container`, divisions);
        });

        // Set initial active country
        if (allCountries.length > 0) {
          activeCountry = allCountries[0];
        }

        // Attach tab click handlers
        countrySwitcher.addEventListener('click', (e) => {
          const btn = e.target.closest('.switcher-btn');
          if (!btn) return;
          const country = btn.dataset.country;
          switchCountry(country);
        });
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      dynamicJobGroups.innerHTML = '<p style="text-align:center; padding: 2rem; color: var(--text-dim);">Failed to load jobs. Please refresh the page.</p>';
    }
  };

  // ── DIVISION FILTER PILLS ──
  const buildFilterPills = (filterContainerId, jobsContainerId, divisions) => {
    const filterContainer = document.getElementById(filterContainerId);
    const jobsContainer = document.getElementById(jobsContainerId);
    if (!filterContainer || !jobsContainer || !divisions || divisions.size === 0) return;

    let pillsHtml = '<button type="button" class="filter-pill active" data-division="all">All</button>';
    divisions.forEach(div => {
      pillsHtml += `<button type="button" class="filter-pill" data-division="${div}">${div}</button>`;
    });
    filterContainer.innerHTML = pillsHtml;

    filterContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      const selectedDiv = pill.dataset.division;

      // Update active pill
      filterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Filter job cards and division lines
      const cards = jobsContainer.querySelectorAll('.job-card');
      const grids = jobsContainer.querySelectorAll('.job-grid');
      const divLines = jobsContainer.querySelectorAll('.division-line');

      if (selectedDiv === 'all') {
        cards.forEach(c => c.style.display = '');
        grids.forEach(g => g.style.display = '');
        divLines.forEach(d => d.style.display = '');
      } else {
        cards.forEach(c => {
          c.style.display = c.dataset.division === selectedDiv ? '' : 'none';
        });
        grids.forEach(g => {
          g.style.display = g.dataset.division === selectedDiv ? '' : 'none';
        });
        divLines.forEach(d => {
          d.style.display = d.dataset.division === selectedDiv ? '' : 'none';
        });
      }
    });
  };

  loadJobs();  

  // ── COUNTRY / THEME SWITCHER ──
  const switchCountry = (country) => {
    // Reset search
    jobSearchInput.value = "";
    filterJobs();

    activeCountry = country;

    // Update tabs
    countrySwitcher.querySelectorAll('.switcher-btn').forEach(btn => {
      const isActive = btn.dataset.country === country;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    // Show/hide country groups
    dynamicJobGroups.querySelectorAll('.country-job-group').forEach(group => {
      group.classList.toggle('active', group.dataset.country === country);
    });

    // Update salary banner generically
    salaryVal.textContent = `${country} Opportunities`;
    salarySub.textContent = `Premium ${country} Placements`;
    salaryBens.innerHTML = `
      <span>🏠 Free Accommodation</span>
      <span>🍽️ Food Provided</span>
      <span>⏰ Overtime Available</span>
      <span>🌍 ${esc(country)}</span>
    `;

    // Smoothly scroll to jobs section
    const jobsSection = document.getElementById("jobs");
    if (jobsSection) {
      const yOffset = -100; 
      const y = jobsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

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
  const applicantCV = document.getElementById("applicantCV");
  const cvUploadZone = document.getElementById("cvUploadZone");
  const cvFileName = document.getElementById("cvFileName");

  // ── SUPABASE CLIENT FOR CV UPLOADS ──
  let _sbClient = null;
  async function getSupabaseClient() {
    if (_sbClient) return _sbClient;
    try {
      const res = await fetch('/api/config');
      const cfg = await res.json();
      if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && typeof supabase !== 'undefined') {
        _sbClient = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      }
    } catch (e) { console.log('Supabase client init skipped:', e.message); }
    return _sbClient;
  }

  // ── CV UPLOAD ZONE INTERACTIONS ──
  if (cvUploadZone && applicantCV) {
    cvUploadZone.addEventListener('click', () => applicantCV.click());
    applicantCV.addEventListener('change', () => {
      if (applicantCV.files[0]) {
        const f = applicantCV.files[0];
        if (f.size > 5 * 1024 * 1024) {
          alert('File too large. Max 5MB.');
          applicantCV.value = '';
          return;
        }
        cvFileName.innerHTML = `✅ ${esc(f.name)} <br><span style="font-size:0.75rem; opacity:0.6;">${(f.size / 1024).toFixed(0)} KB — Click to change</span>`;
        cvUploadZone.style.borderColor = 'var(--gold-dim)';
      }
    });
    // Drag & drop
    cvUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); cvUploadZone.style.borderColor = 'var(--gold)'; });
    cvUploadZone.addEventListener('dragleave', () => { cvUploadZone.style.borderColor = 'rgba(255,255,255,0.15)'; });
    cvUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      cvUploadZone.style.borderColor = 'rgba(255,255,255,0.15)';
      const f = e.dataTransfer.files[0];
      if (f) {
        const allowed = ['.pdf','.doc','.docx'];
        const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
        if (!allowed.includes(ext)) { alert('Only PDF, DOC, DOCX allowed.'); return; }
        if (f.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
        // Assign to file input
        const dt = new DataTransfer();
        dt.items.add(f);
        applicantCV.files = dt.files;
        cvFileName.innerHTML = `✅ ${esc(f.name)} <br><span style="font-size:0.75rem; opacity:0.6;">${(f.size / 1024).toFixed(0)} KB — Click to change</span>`;
        cvUploadZone.style.borderColor = 'var(--gold-dim)';
      }
    });
  }

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
    // Search within active country group
    const activeGroup = dynamicJobGroups.querySelector('.country-job-group.active');
    if (!activeGroup) return;
    const cards = activeGroup.querySelectorAll(".job-card");
    const divisions = activeGroup.querySelectorAll(".division-line");
    let hasMatches = false;

    cards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const tag = card.querySelector(".job-tag").textContent.toLowerCase();
      const details = card.querySelector(".job-details") ? card.querySelector(".job-details").textContent.toLowerCase() : "";
      
      const isMatch = !query || title.includes(query) || tag.includes(query) || details.includes(query);
      
      if (isMatch) {
        card.style.display = "block";
        hasMatches = true;
      } else {
        card.style.display = "none";
      }
    });

    // Toggle division lines depending on whether they contain visible cards
    const grids = activeGroup.querySelectorAll('.job-grid');
    divisions.forEach((div, i) => {
      const grid = grids[i];
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
    if (hasMatches || !query) {
      noResults.style.display = "none";
    } else {
      noResults.style.display = "block";
    }
  };

  jobSearchInput.addEventListener("input", filterJobs);

  // ── MODAL & APPLICATION SYSTEM ──
  const openModal = (jobTitle) => {
    modalJobTitle.textContent = jobTitle;
    // Reset to form view (in case success panel was showing)
    document.getElementById('applyFormFields').style.display = '';
    document.getElementById('applySuccess').style.display = 'none';
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

    // Reset to form view
    document.getElementById('applyFormFields').style.display = '';
    document.getElementById('applySuccess').style.display = 'none';

    // Reset submit button to default
    modalSubmit.disabled = false;
    modalSubmit.textContent = '📨 Submit Application';
    modalSubmit.style.background = '';
    modalSubmit.style.color = '';
  };

  // Close triggers
  modalClose.addEventListener("click", closeModal);
  applyModal.addEventListener("click", (e) => {
    if (e.target === applyModal) closeModal();
  });

  // Attach modal triggers to job cards
  // (Dynamic apply buttons handled by event delegation above)

  // Direct form submission to API
  modalSubmit.addEventListener("click", async () => {
    const name = applicantName.value.trim();
    const phone = applicantPhone.value.trim();
    const email = applicantEmail.value.trim();
    const exp = applicantExp.value;
    const msg = applicantMsg.value.trim();
    const job = modalJobTitle.textContent;
    const country = activeCountry || 'Israel';

    // Validations
    if (!name) {
      alert("Please enter your full name.");
      applicantName.focus();
      return;
    }
    if (!phone) {
      alert("Please enter your phone number.");
      applicantPhone.focus();
      return;
    }

    // Disable button and show loading state
    modalSubmit.disabled = true;
    const origBtnText = modalSubmit.textContent;
    modalSubmit.textContent = "⏳ Submitting...";

    try {
      // Upload CV to Supabase Storage if file selected
      let cv_url = null;
      const cvFile = applicantCV?.files[0];
      if (cvFile) {
        modalSubmit.textContent = "📤 Uploading CV...";
        const sb = await getSupabaseClient();
        if (sb) {
          const ext = cvFile.name.substring(cvFile.name.lastIndexOf('.')).toLowerCase();
          const fileName = `cv_${Date.now()}_${Math.random().toString(36).slice(2,8)}${ext}`;
          const { data: uploadData, error: uploadErr } = await sb.storage
            .from('cv-uploads')
            .upload(fileName, cvFile, { contentType: cvFile.type, upsert: false });

          if (uploadErr) {
            console.error('CV upload error:', uploadErr);
            // Continue without CV — don't block the application
          } else {
            const { data: urlData } = sb.storage.from('cv-uploads').getPublicUrl(fileName);
            cv_url = urlData?.publicUrl || null;
          }
        }
        modalSubmit.textContent = "⏳ Submitting...";
      }

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
          cover_note: msg || null,
          cv_url: cv_url
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Store tracking ID locally
        localStorage.setItem('bh_tracking_id', result.tracking_id);
        localStorage.setItem('bh_tracking_phone', phone);

        // Show success panel
        document.getElementById('applyFormFields').style.display = 'none';
        document.getElementById('trackingIdValue').textContent = result.tracking_id;
        document.getElementById('applySuccess').style.display = 'block';

        // Turn button green with success message
        modalSubmit.style.background = '#10b981';
        modalSubmit.style.color = '#fff';
        modalSubmit.textContent = '✅ Submitted! Check email for details';
        modalSubmit.disabled = true;

        // Reset form fields for next use
        applicantName.value = '';
        applicantPhone.value = '';
        applicantEmail.value = '';
        applicantExp.value = '';
        applicantMsg.value = '';
        if (applicantCV) applicantCV.value = '';
        if (cvFileName) cvFileName.innerHTML = '📎 Click to upload or drag & drop<br><span style="font-size:0.75rem; opacity:0.6;">PDF, DOC, DOCX — Max 5MB</span>';
        if (cvUploadZone) cvUploadZone.style.borderColor = 'rgba(255,255,255,0.15)';
        return; // Don't restore button — keep green
      } else {
        const err = await response.json();
        alert(err.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
      console.error('Application submit error:', err);
    }

    modalSubmit.disabled = false;
    modalSubmit.textContent = origBtnText;
  });

  // Initialize default theme (use classList to preserve animation classes)
  // Theme initialized dynamically by loadJobs()

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
      return "📋 Browse jobs above, click 'Apply', fill the form, and submit directly. You'll get a tracking ID to monitor your application progress!";
    if (m.includes("track") || m.includes("status"))
      return "📍 Track your application at our <a href='tracker/' style='color:var(--gold)'>Tracker page</a>. Enter your Tracking ID + phone number.";
    if (m.includes("hello") || m.includes("hi") || m.includes("hey"))
      return "👋 Hello! Welcome to Blue Horizon Overseas! Ask me about jobs, salaries, visa process, or anything else. I'm here to help!";
    if (m.includes("contact") || m.includes("phone") || m.includes("whatsapp"))
      return "📞 WhatsApp: +91 89420 69079 | Helpline: +91 92308 59550 | Email: global@bluehorizonoverseas.in";
    if (m.includes("accommodation") || m.includes("food") || m.includes("living"))
      return "🏠 Yes! Free accommodation & food are provided by employers for all placements. Most of your salary goes straight to savings!";
    return "Thanks for your question! For detailed help, contact us at: <a href='tel:+918942069079' style='color:var(--gold)'>+91 89420 69079</a> or email global@bluehorizonoverseas.in 😊";
  }

  // ══════════════════════════════════════════════════════════════
  // TALENT POOL FORM
  // ══════════════════════════════════════════════════════════════
  const talentForm = document.getElementById('talentPoolForm');
  if (talentForm) {
    talentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Honeypot check — bots fill this, humans never see it
      if (document.getElementById('tpHoneypot') && document.getElementById('tpHoneypot').value) return;
      const submitBtn = talentForm.querySelector('.tp-submit');
      const origText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Submitting...';

      try {
        const payload = {
          full_name: document.getElementById('tpName').value.trim(),
          phone: document.getElementById('tpPhone').value.trim(),
          trade: document.getElementById('tpTrade').value,
          preferred_country: document.getElementById('tpCountry').value || null
        };

        const res = await fetch('/api/talent-pool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          talentForm.reset();
          submitBtn.textContent = '✅ Profile Submitted!';
          submitBtn.style.background = 'rgba(16,185,129,0.2)';
          submitBtn.style.borderColor = 'rgba(16,185,129,0.5)';
          setTimeout(() => {
            submitBtn.textContent = origText;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            submitBtn.disabled = false;
          }, 3000);
        } else {
          const err = await res.json();
          alert(err.error || 'Submission failed. Please try again.');
          submitBtn.textContent = origText;
          submitBtn.disabled = false;
        }
      } catch {
        alert('Network error. Please try again.');
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // EMPLOYER INQUIRY FORM
  // ══════════════════════════════════════════════════════════════
  const employerForm = document.getElementById('employerForm');
  if (employerForm) {
    employerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Honeypot check — bots fill this, humans never see it
      if (document.getElementById('empHoneypot') && document.getElementById('empHoneypot').value) return;
      const submitBtn = employerForm.querySelector('.emp-submit');
      const origText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Sending...';

      try {
        const payload = {
          company_name: document.getElementById('empCompany').value.trim(),
          contact_person: document.getElementById('empContact').value.trim(),
          phone: document.getElementById('empPhone').value.trim(),
          email: document.getElementById('empEmail').value.trim() || null,
          country: document.getElementById('empCountry').value || null,
          roles_needed: document.getElementById('empRoles').value.trim() || null
        };

        const res = await fetch('/api/employers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          employerForm.reset();
          submitBtn.textContent = '✅ Inquiry Submitted!';
          submitBtn.style.background = 'rgba(16,185,129,0.2)';
          submitBtn.style.borderColor = 'rgba(16,185,129,0.5)';
          setTimeout(() => {
            submitBtn.textContent = origText;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            submitBtn.disabled = false;
          }, 3000);
        } else {
          const err = await res.json();
          alert(err.error || 'Submission failed. Please try again.');
          submitBtn.textContent = origText;
          submitBtn.disabled = false;
        }
      } catch {
        alert('Network error. Please try again.');
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
      }
    });
  }
});
