class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Options for intersection detector
        const observerOptions = {
            root: null, // Viewport
            rootMargin: '0px',
            threshold: 0.12 // Trigger when 12% of the element is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animated class to trigger CSS keyframes/transitions
                    entry.target.classList.add('animated');
                    
                    // For grid lists, trigger their children to stagger
                    const staggers = entry.target.querySelectorAll('.stagger-item');
                    staggers.forEach((item, index) => {
                        // Apply staggered animation delays
                        item.classList.add('animated');
                    });

                    // Once animated, stop observing this item for performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Find all main animation targets
        const animateElements = document.querySelectorAll('[data-animate]');
        animateElements.forEach(el => observer.observe(el));

        // Setup dynamic bento card layout staggering
        const bentoGrid = document.querySelector('.bento-grid');
        if (bentoGrid) {
            const bentoCards = bentoGrid.querySelectorAll('.bento-card');
            bentoCards.forEach((card, index) => {
                card.classList.add('stagger-item');
                // Dynamically apply cascade delays
                card.classList.add(`stagger-delay-${(index % 5) + 1}`);
                observer.observe(card);
            });
        }

        // Setup skills list staggering
        const skillsCategories = document.querySelectorAll('.skills-category');
        skillsCategories.forEach((cat, index) => {
            cat.classList.add('stagger-item');
            cat.classList.add(`stagger-delay-${index + 1}`);
            observer.observe(cat);
        });

        // Setup project card staggering
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.classList.add('stagger-item');
            card.classList.add(`stagger-delay-${index + 1}`);
            observer.observe(card);
        });
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
});
