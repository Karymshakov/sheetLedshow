document.addEventListener('DOMContentLoaded', () => {
    // --- 1. HEADER SCROLL EFFECT ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. MOBILE MENU ---
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.querySelector('.nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }

    // --- 3. SCROLL REVEAL ANIMATIONS (Intersection Observer) ---
    const reveals = document.querySelectorAll('.reveal');
    // Use a lower threshold on mobile to ensure tall sections (e.g., works portfolio)
    // correctly appear even when only a small portion is visible
    const isMobile = window.innerWidth <= 768;
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Animates once
            }
        });
    }, {
        threshold: isMobile ? 0.02 : 0.1,
        rootMargin: isMobile ? "0px 0px 0px 0px" : "0px 0px -30px 0px"
    });

    reveals.forEach(element => {
        revealObserver.observe(element);
    });

    // --- 4. ASSORTMENT TAB SYSTEM ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabInfos = document.querySelectorAll('.assortment-info');
    const previewBox = document.getElementById('preview-screen-box');
    const previewLabel = document.querySelector('.preview-content-label');
    const previewGlow = document.querySelector('.preview-glow-core');
    const previewGrid = document.querySelector('.preview-grid');

    // Colors mirror the RGB sub-pixels in the LED Show logo (cyan/green/red),
    // plus blue and violet as two further distinct channels.
    const tabStyles = {
        'sale': { text: 'УСТАНОВКА', sub: 'Медиафасады, LED экраны и панели', color: '#00f0ff', coarse: false },
        'rent': { text: 'АРЕНДА', sub: 'Сцены, подиумы, звук и свет', color: '#23ea00', coarse: true },
        'lines': { text: 'БЕГУЩИЕ СТРОКИ', sub: 'Бегущие строки и табло', color: '#ff3131', coarse: false },
        'light': { text: 'ОБОРУДОВАНИЕ', sub: 'Сцены, DMX свет, конференц-системы', color: '#3b82f6', coarse: true },
        'panels': { text: 'СЕНСОРНАЯ ПАНЕЛЬ', sub: 'Интерактивное обучение и презентации', color: '#8b5cf6', coarse: false }
    };

    // Shared updater for the simulator preview box - used when switching tabs
    function setPreview(text, sub, color, coarse) {
        if (previewLabel) {
            previewLabel.innerHTML = `${text}<span>${sub}</span>`;
            previewLabel.style.color = color;
        }
        if (previewGlow) {
            previewGlow.style.background = `radial-gradient(circle, ${color}55 0%, transparent 70%)`;
        }
        if (previewGrid) {
            previewGrid.classList.toggle('coarse', !!coarse);
        }
    }

    function showTabDefaultPreview(tabId) {
        const style = tabStyles[tabId];
        if (style) {
            setPreview(style.text, style.sub, style.color, style.coarse);
        }
    }

    // Each tab swaps the shared simulator box into its own interactive mode
    const PREVIEW_MODE_CLASSES = ['marquee-mode', 'modular-mode', 'dmx-mode', 'draw-mode'];
    const TAB_PREVIEW_MODE = {
        rent: 'modular-mode',
        lines: 'marquee-mode',
        light: 'dmx-mode',
        panels: 'draw-mode'
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Toggle active classes on buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active classes on info panels
            tabInfos.forEach(info => {
                info.classList.remove('active');
                if (info.getAttribute('id') === tabId) {
                    info.classList.add('active');
                }
            });

            // Swap the shared simulator box into this tab's interactive mode
            if (previewBox) {
                previewBox.classList.remove(...PREVIEW_MODE_CLASSES);
                const mode = TAB_PREVIEW_MODE[tabId];
                if (mode) {
                    previewBox.classList.add(mode);
                }
            }

            if (tabId === 'panels') {
                resetDrawCanvas();
            }

            showTabDefaultPreview(tabId);
        });
    });

    // --- 4b. LIVE LED MARQUEE (RUNNING TEXT) DEMO ---
    const marqueeInput = document.getElementById('marquee-input');
    const marqueeTrack = document.getElementById('led-marquee-track');
    const marqueeColorBtns = document.querySelectorAll('.marquee-color-btn');
    const DEFAULT_MARQUEE_TEXT = 'LED SHOW • БИШКЕК • ';

    if (marqueeInput && marqueeTrack) {
        marqueeInput.addEventListener('input', () => {
            const value = marqueeInput.value.trim();
            marqueeTrack.textContent = value ? `${value}  •  ` : DEFAULT_MARQUEE_TEXT;
        });
    }

    marqueeColorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            marqueeColorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (marqueeTrack) {
                marqueeTrack.style.setProperty('--marquee-color', btn.getAttribute('data-color'));
            }
        });
    });

    // --- 4c. LIVE DMX COLOR MIXER DEMO ("Сценическое оборудование" tab) ---
    const dmxBeam = document.getElementById('dmx-beam');
    const dmxSwatchBtns = document.querySelectorAll('.dmx-swatch');

    dmxSwatchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dmxSwatchBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (dmxBeam) {
                dmxBeam.style.setProperty('--dmx-color', btn.getAttribute('data-color'));
            }
        });
    });

    // --- 4d. DRAWABLE TOUCH PANEL DEMO ("Интерактивные панели" tab) ---
    const drawCanvas = document.getElementById('draw-canvas');
    const drawCtx = drawCanvas ? drawCanvas.getContext('2d') : null;
    const drawHint = document.getElementById('draw-hint');
    let isDrawing = false;
    let lastDrawX = 0;
    let lastDrawY = 0;

    function resetDrawCanvas() {
        if (!drawCanvas || !drawCtx) return;
        const rect = drawCanvas.getBoundingClientRect();
        drawCanvas.width = rect.width;
        drawCanvas.height = rect.height;
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        if (drawHint) {
            drawHint.classList.remove('is-hidden');
        }
    }

    function getDrawPos(e) {
        const rect = drawCanvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    if (drawCanvas && drawCtx) {
        drawCanvas.addEventListener('pointerdown', (e) => {
            isDrawing = true;
            if (drawHint) drawHint.classList.add('is-hidden');
            const pos = getDrawPos(e);
            lastDrawX = pos.x;
            lastDrawY = pos.y;
        });

        drawCanvas.addEventListener('pointermove', (e) => {
            if (!isDrawing) return;
            const pos = getDrawPos(e);
            drawCtx.strokeStyle = '#00f0ff';
            drawCtx.lineWidth = 3;
            drawCtx.lineCap = 'round';
            drawCtx.shadowColor = '#00f0ff';
            drawCtx.shadowBlur = 8;
            drawCtx.beginPath();
            drawCtx.moveTo(lastDrawX, lastDrawY);
            drawCtx.lineTo(pos.x, pos.y);
            drawCtx.stroke();
            lastDrawX = pos.x;
            lastDrawY = pos.y;
        });

        window.addEventListener('pointerup', () => {
            isDrawing = false;
        });
    }

    // --- 5. INTERACTIVE LED CALCULATOR / SIMULATOR ---
    const calcWidthSlider = document.getElementById('calc-width');
    const calcHeightSlider = document.getElementById('calc-height');
    const calcWidthVal = document.getElementById('calc-width-val');
    const calcHeightVal = document.getElementById('calc-height-val');
    const btnOptions = document.querySelectorAll('.calc-btn-option');
    const calcStatRes = document.getElementById('calc-res');
    const calcStatDist = document.getElementById('calc-dist');
    const calcStatPower = document.getElementById('calc-power');

    const calcPixelGrid = document.querySelector('.calc-pixel-grid');
    const calcSimulatedText = document.querySelector('.calc-simulated-text');

    let currentEnvironment = 'indoor'; // 'indoor' or 'outdoor'

    // Environment toggle
    btnOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            btnOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentEnvironment = btn.getAttribute('data-env');
            calculateLED();
        });
    });

    // Slider updates
    if (calcWidthSlider && calcHeightSlider) {
        calcWidthSlider.addEventListener('input', (e) => {
            calcWidthVal.textContent = parseFloat(e.target.value).toFixed(1) + 'м';
            calculateLED();
        });
        calcHeightSlider.addEventListener('input', (e) => {
            calcHeightVal.textContent = parseFloat(e.target.value).toFixed(1) + 'м';
            calculateLED();
        });
    }

    function calculateLED() {
        if (!calcWidthSlider || !calcHeightSlider) return;

        const w = parseFloat(calcWidthSlider.value);
        const h = parseFloat(calcHeightSlider.value);
        const area = w * h;

        // Choose Pixel Pitch and parameters based on environment
        let pitch, pitchName, averagePowerSqM, weightSqM;

        if (currentEnvironment === 'indoor') {
            // Finer resolution for indoor
            pitch = 2.5; // 2.5mm
            pitchName = 'P2.5 (Indoor)';
            averagePowerSqM = 250; // W/sqm
            weightSqM = 22; // kg/sqm
        } else {
            // Coarser for outdoor
            pitch = 6.0; // 6.0mm
            pitchName = 'P6.0 (Outdoor)';
            averagePowerSqM = 400; // W/sqm
            weightSqM = 38; // kg/sqm
        }

        // Calculations
        const pixelsX = Math.round((w * 1000) / pitch);
        const pixelsY = Math.round((h * 1000) / pitch);
        const totalPowerkW = ((area * averagePowerSqM) / 1000).toFixed(1);
        const viewDistance = Math.ceil(pitch * 1.0);

        // Update UI Stats
        if (calcStatRes) calcStatRes.textContent = `${pixelsX} × ${pixelsY} px`;
        if (calcStatDist) calcStatDist.textContent = `от ${viewDistance} метров`;
        if (calcStatPower) calcStatPower.textContent = `~${totalPowerkW} кВт`;

        // Update Visual Simulator Grid & Label
        if (calcPixelGrid) {
            // Visual sizing trick: represent pitch by altering grid background-size
            // Fine pitch = smaller pattern; Coarse pitch = larger pattern
            const scaleFactor = currentEnvironment === 'indoor' ? 6 : 14;
            calcPixelGrid.style.backgroundSize = `${scaleFactor}px ${scaleFactor}px`;
        }

        if (calcSimulatedText) {
            calcSimulatedText.innerHTML = `${pitchName}<span style="display:block; font-size:0.9rem; font-weight:500; opacity:0.8; margin-top:5px; color:#00f0ff;">${pixelsX}x${pixelsY}</span>`;
        }
    }

    // Run initial calculation
    calculateLED();

    // --- 6. MODALS ---
    const contactModal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.querySelector('.modal-close');

    if (contactModal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                contactModal.classList.add('active');
            });
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                contactModal.classList.remove('active');
            });
        }

        // Close on overlay click
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('active');
            }
        });
    }

    // Certificate Modal
    const certModal = document.getElementById('cert-modal');
    const openCertBtns = document.querySelectorAll('.open-cert-btn');
    const closeCertModalBtn = document.getElementById('cert-modal-close');

    if (certModal) {
        openCertBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                certModal.classList.add('active');
            });
        });

        if (closeCertModalBtn) {
            closeCertModalBtn.addEventListener('click', () => {
                certModal.classList.remove('active');
            });
        }

        // Close on overlay click
        certModal.addEventListener('click', (e) => {
            if (e.target === certModal) {
                certModal.classList.remove('active');
            }
        });
    }

    // --- GOOGLE ADS CONVERSION LABELS MAPPING ---
    const GOOGLE_ADS_CONVERSIONS = {
        'generate_lead': 'AW-18213825167/5keyCKOgh8EcEI_Vg-1D',  // ✅ Отправка формы / Покупка
        'click_whatsapp': '',                             // Клик на WhatsApp (ярлык не задан)
        'click_telegram': '',                             // Клик на Telegram (ярлык не задан)
        'click_phone': 'AW-18213825167/tG1VCJnM68AcEI_Vg-1D'  // ✅ Клик по номеру телефона
    };

    // Специальная функция для конверсий по телефону с callback (рекомендация Google)
    function gtag_report_conversion(url) {
        var callback = function () {
            if (typeof(url) !== 'undefined') {
                window.location = url;
            }
        };
        gtag('event', 'conversion', {
            'send_to': GOOGLE_ADS_CONVERSIONS['click_phone'],
            'value': 1.0,
            'currency': 'USD',
            'event_callback': callback
        });
        return false;
    }

    // Helper function to safely send gtag events (hoisted/available throughout DOMContentLoaded)
    function trackEvent(eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
            
            // Отправка прямой конверсии в Google Ads, если настроен ярлык
            const conversionId = GOOGLE_ADS_CONVERSIONS[eventName];
            if (conversionId && conversionId.trim() !== '') {
                gtag('event', 'conversion', {
                    'send_to': conversionId
                });
                console.log(`[Google Ads Tag] Direct conversion sent to Google Ads: ${conversionId}`);
            }

            console.log(`[Google Ads Tag] Event tracked: ${eventName}`, params);
        } else {
            console.log(`[Google Ads Tag] Event simulated (gtag not loaded yet): ${eventName}`, params);
        }
    }

    // --- 7. FORM SUBMISSION ---
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Track form submission conversion
            trackEvent('generate_lead', {
                'event_category': 'form',
                'event_label': form.getAttribute('id') || 'contact-form'
            });

            const nameInput = form.querySelector('input[placeholder*="Асан"]');
            const phoneInput = form.querySelector('input[type="tel"]');
            const msgInput = form.querySelector('textarea') || form.querySelector('input[placeholder*="Покупка"]');

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const msg = msgInput ? msgInput.value.trim() : '';

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Interactive loading simulation
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loader">Отправка...</span>';

            // Redirect to WhatsApp with prefilled message
            const whatsappNumber = "996552181122";
            const messageText = `Здравствуйте! Меня зовут ${name}. Мой телефон: ${phone}.${msg ? ' Интересует: ' + msg : ' Хочу получить консультацию.'}`;
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
            window.open(whatsappUrl, '_blank');

            setTimeout(() => {
                submitBtn.innerHTML = 'Успешно отправлено!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                submitBtn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
                submitBtn.style.color = '#ffffff';
                form.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.boxShadow = '';
                    submitBtn.style.color = '';

                    // Close modal if open
                    if (contactModal) contactModal.classList.remove('active');
                }, 3000);
            }, 1000);
        });
    });

    // --- 8b. PLAY PORTFOLIO VIDEO ONLY WHEN VISIBLE ---
    const worksVideo = document.getElementById('works-video');
    if (worksVideo) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    worksVideo.play().catch(() => {});
                } else {
                    worksVideo.pause();
                }
            });
        }, { threshold: 0.25 });
        videoObserver.observe(worksVideo);
    }

    // --- 7b. LIVE OPEN/CLOSED HOURS BADGE ---
    // Mirrors the real openingHoursSpecification in the page's JSON-LD (Mon-Sat, 09:00-18:00, Asia/Bishkek).
    const hoursBadge = document.getElementById('hours-status');
    if (hoursBadge) {
        const updateHoursStatus = () => {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Bishkek',
                weekday: 'short',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            }).formatToParts(new Date());

            const map = {};
            parts.forEach(part => { map[part.type] = part.value; });

            const minutesNow = (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10);
            const isSunday = map.weekday === 'Sun';
            const isOpen = !isSunday && minutesNow >= 9 * 60 && minutesNow < 18 * 60;

            hoursBadge.classList.toggle('is-open', isOpen);
            hoursBadge.classList.toggle('is-closed', !isOpen);
            hoursBadge.innerHTML = '<span class="hours-dot"></span>' +
                (isOpen ? 'Открыто сейчас · до 18:00' : 'Закрыто · открываемся в 09:00');
        };

        updateHoursStatus();
        setInterval(updateHoursStatus, 60000);
    }

    // --- 8. LAZY LOAD MAP IFRAME ---
    const mapWrap = document.getElementById('map-wrap');
    const mapPlaceholder = document.getElementById('map-placeholder');
    if (mapWrap && mapPlaceholder) {
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = document.createElement('iframe');
                    iframe.className = 'map-iframe';
                    iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=74.644%2C42.887%2C74.659%2C42.894&layer=mapnik&marker=42.8906%2C74.6517';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('loading', 'lazy');
                    iframe.setAttribute('title', 'Шоурум LED Show на карте Бишкека');
                    
                    // Replace placeholder with iframe
                    mapPlaceholder.replaceWith(iframe);
                    mapObserver.unobserve(mapWrap);
                }
            });
        }, {
            rootMargin: '200px 0px' // Load 200px before entering viewport
        });
        mapObserver.observe(mapWrap);
    }

    // --- 9. GOOGLE ADS / ANALYTICS CONVERSION TRACKING ---
    // Track WhatsApp link clicks
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('click_whatsapp', {
                'event_category': 'contact',
                'event_label': link.getAttribute('id') || 'whatsapp-link'
            });
        });
    });

    // Track Telegram link clicks
    document.querySelectorAll('a[href*="t.me"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('click_telegram', {
                'event_category': 'contact',
                'event_label': link.getAttribute('id') || 'telegram-link'
            });
        });
    });

    // Track Phone link clicks (с Google Ads callback для надёжной отправки конверсии)
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const phoneHref = link.getAttribute('href');
            console.log(`[Google Ads Tag] Phone click conversion fired: ${phoneHref}`);
            gtag_report_conversion(phoneHref);
        });
    });
});
