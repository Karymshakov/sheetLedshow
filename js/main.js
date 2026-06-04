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
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Animates once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(element => {
        revealObserver.observe(element);
    });

    // --- 4. ASSORTMENT TAB SYSTEM ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabInfos = document.querySelectorAll('.assortment-info');
    const previewLabel = document.querySelector('.preview-content-label');
    const previewGlow = document.querySelector('.preview-glow-core');
    const previewGrid = document.querySelector('.preview-grid');

    const tabStyles = {
        'sale': { text: 'УСТАНОВКА', sub: 'Внутренние и наружные экраны', color: '#00f0ff', coarse: false },
        'rent': { text: 'АРЕНДА', sub: 'Сцены, подиумы, звук и свет', color: '#3b82f6', coarse: true },
        'lines': { text: 'БЕГУЩИЕ СТРОКИ', sub: 'Бегущие строки и табло', color: '#8b5cf6', coarse: false },
        'light': { text: 'ЛАЗЕРЫ', sub: 'Световое и звуковое оборудование', color: '#10b981', coarse: true }
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

            // Update interactive screen simulator preview
            if (previewLabel && tabStyles[tabId]) {
                const style = tabStyles[tabId];
                previewLabel.innerHTML = `${style.text}<span>${style.sub}</span>`;

                // Animate preview box transition
                previewLabel.style.color = style.color;
                if (previewGlow) {
                    previewGlow.style.background = `radial-gradient(circle, ${style.color}55 0%, transparent 70%)`;
                }

                if (previewGrid) {
                    if (style.coarse) {
                        previewGrid.classList.add('coarse');
                    } else {
                        previewGrid.classList.remove('coarse');
                    }
                }
            }
        });
    });

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

    // --- 7. FORM SUBMISSION ---
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Interactive loading simulation
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loader">Отправка...</span>';

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
            }, 1500);
        });
    });
});
