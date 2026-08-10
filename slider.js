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

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
            updateUI();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            updateUI();
        });

        function updateUI() {
            const offset = -currentIndex * 100;
            slider.style.transform = `translateX(${offset}%)`;
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => { dot.classList.toggle('active', i === currentIndex); });
        }
    });

    // --- 2. MODAL & FORMULAR LOGIK ---
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

    // Funktion zur Steuerung der Küchen-Felder
    function updateExtraFields(serviceValue) {
        if (!workshopDetails || !ovenQuestion) return;

        if (serviceValue === 'Workshop' || serviceValue === 'Catering') {
            workshopDetails.style.display = 'block';
            // Ofen-Frage NUR bei Workshop
            ovenQuestion.style.display = (serviceValue === 'Workshop') ? 'block' : 'none';
        } else {
            workshopDetails.style.display = 'none';
        }
    }

    // Listener für manuelle Änderungen im Dropdown
    if (serviceSelect) {
        serviceSelect.addEventListener('change', (e) => updateExtraFields(e.target.value));
    }

    // Modal öffnen & Service setzen
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedService = btn.getAttribute('data-service');
            if (selectedService && serviceSelect) {
                serviceSelect.value = selectedService;
                updateExtraFields(selectedService); // Logik sofort triggern
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Hilfsfunktion zum Schließen
    const closeModal = () => {
        modal.style.display = 'none';
        document.getElementById('successModal').style.display = 'none';
        document.getElementById('errorModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    window.onclick = (event) => { if (event.target === modal) closeModal(); };

    // PLZ Suche
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
        // Honeypot Check
        const honey = document.getElementById('honeypot_phone').value;
        if (honey !== "") {
            console.warn("Bot erkannt!");
            // Wir tun so, als ob es geklappt hätte, senden aber nichts ab.
            this.reset();
            closeModal();
            document.getElementById('successModal').style.display = 'block';
            return;
        }
        const btn = this.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;

        // UI-Feedback: Sende-Status
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
                // ERFOLG
                closeModal(); // Schließt das Formular-Modal
                this.reset();
                if (previewContainer) previewContainer.innerHTML = '';
                document.getElementById('successModal').style.display = 'block';
            } else {
                // SERVER-FEHLER (z.B. Formspree Limit erreicht)
                throw new Error("Server-Antwort war nicht okay.");
            }
        } catch (error) {
            // NETZWERK-FEHLER ODER SERVER-DOWN
            document.getElementById('errorModal').style.display = 'block';
        } finally {
            // Button wieder in Normalzustand versetzen
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    });
});