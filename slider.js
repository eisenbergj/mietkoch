document.addEventListener('DOMContentLoaded', () => {
    // Wir suchen alle Slider-Container auf der Seite
    const containers = document.querySelectorAll('.carousel-container');

    containers.forEach(container => {
        let currentIndex = 0;
        const slider = container.querySelector('.insta-slider');
        const slides = container.querySelectorAll('.insta-item');
        const dotsContainer = container.querySelector('.dots-container');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');

        if (!slider || slides.length === 0) return;

        // 1. Dots für DIESEN Slider erstellen
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateUI();
            });
            dotsContainer.appendChild(dot);
        });

        // 2. Click-Events für DIESE Buttons
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
            updateUI();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
            updateUI();
        });

        // 3. Update-Funktion für DIESEN Slider
        function updateUI() {
            const offset = -currentIndex * 100;
            slider.style.transform = `translateX(${offset}%)`;
            
            // Nur die Dots in diesem Container updaten
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
    });
});