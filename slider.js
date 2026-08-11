document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SLIDER LOGIK ---
    const containers = document.querySelectorAll('.carousel-container');
    containers.forEach(container => {
        let currentIndex = 0;
        const slider = container.querySelector('.insta-slider');
        const slides = container.querySelectorAll('.insta-item');
        const dotsContainer = container.querySelector('.dots-container');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');

        if (!slider || slides.length === 0) return;

        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => { currentIndex = i; updateUI(); });
            dotsContainer.appendChild(dot);
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
                updateUI();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
                updateUI();
            });
        }

        function updateUI() {
            const offset = -currentIndex * 100;
            slider.style.transform = `translateX(${offset}%)`;
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => { dot.classList.toggle('active', i === currentIndex); });
        }
    });

    // --- 2. RECIPE TAB SWITCHER LOGIK ---
    const recipeRadios = document.querySelectorAll('input[name="recipes"]');
    recipeRadios.forEach((radio) => {
        radio.addEventListener('change', (e) => {
            // 1. Get corresponding label & target ID
            const activeLabel = document.querySelector(`label[for="${e.target.id}"]`);
            const targetId = activeLabel?.getAttribute('data-recipe-target');

            // 2. Update navigation tabs
            document.querySelectorAll('.recipe-nav-item').forEach((label) => {
                label.classList.remove('is-active');
                label.setAttribute('aria-selected', 'false');
            });
            activeLabel?.classList.add('is-active');
            activeLabel?.setAttribute('aria-selected', 'true');

            // 3. Update active panel
            document.querySelectorAll('.recipe-panel').forEach((panel) => {
                panel.classList.remove('is-active');
            });
            if (targetId) {
                document.getElementById(targetId)?.classList.add('is-active');
            }
        });
    });

    // --- 3. MODAL & FORMULAR LOGIK ---
    const modal = document.getElementById('contactModal');
    const contactForm = document.getElementById('contactForm');
    const serviceSelect = document.getElementById('service');
    const workshopDetails = document.getElementById('workshop-details');
    const ovenQuestion = document.getElementById('oven-question-container');

    if (!modal || !contactForm) {
        console.error("Modal oder Formular nicht im HTML gefunden!");
        return;
    }

    const openButtons = document.querySelectorAll('.js-open-modal');
    const closeBtn = document.querySelector('.close-modal');
    const previewContainer = document.getElementById('image-preview-container');
    const zipInput = document.getElementById('zip');
    const cityInput = document.getElementById('city');

    function updateExtraFields(serviceValue) {
        if (!workshopDetails || !ovenQuestion) return;

        if (serviceValue === 'Workshop' || serviceValue === 'Catering') {
            workshopDetails.style.display = 'block';
            ovenQuestion.style.display = (serviceValue === 'Workshop') ? 'block' : 'none';
        } else {
            workshopDetails.style.display = 'none';
        }
    }

    if (serviceSelect) {
        serviceSelect.addEventListener('change', (e) => updateExtraFields(e.target.value));
    }

    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedService = btn.getAttribute('data-service');
            if (selectedService && serviceSelect) {
                serviceSelect.value = selectedService;
                updateExtraFields(selectedService);
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.style.display = 'none';
        const successModal = document.getElementById('successModal');
        const errorModal = document.getElementById('errorModal');
        if (successModal) successModal.style.display = 'none';
        if (errorModal) errorModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    window.onclick = (event) => { if (event.target === modal) closeModal(); };

    if (zipInput) {
        zipInput.addEventListener('input', async (e) => {
            const zip = e.target.value;
            if (zip.length === 5) {
                try {
                    const response = await fetch(`https://api.zippopotam.us/de/${zip}`);
                    if (response.ok) {
                        const data = await response.json();
                        cityInput.value = data.places[0]['place name'];
                        cityInput.style.backgroundColor = "#f0fdf4";
                    } else {
                        cityInput.value = "Nicht gefunden";
                        cityInput.style.backgroundColor = "#fef2f2";
                    }
                } catch (error) { console.error(error); }
            }
        });
    }

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const honey = document.getElementById('honeypot_phone')?.value;
        if (honey) {
            console.warn("Bot erkannt!");
            this.reset();
            closeModal();
            const successModal = document.getElementById('successModal');
            if (successModal) successModal.style.display = 'block';
            return;
        }
        
        const btn = this.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;

        btn.innerHTML = "Wird in den Ofen geschoben...";
        btn.disabled = true;
        btn.style.opacity = "0.7";

        const formData = new FormData(this);

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                closeModal();
                this.reset();
                if (previewContainer) previewContainer.innerHTML = '';
                const successModal = document.getElementById('successModal');
                if (successModal) successModal.style.display = 'block';
            } else {
                throw new Error("Server-Antwort war nicht okay.");
            }
        } catch (error) {
            const errorModal = document.getElementById('errorModal');
            if (errorModal) errorModal.style.display = 'block';
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    });
});