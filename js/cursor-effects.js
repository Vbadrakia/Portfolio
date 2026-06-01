class CursorEffects {
    constructor() {
        this.cursor = document.querySelector('.custom-cursor');
        this.glow = document.querySelector('.custom-cursor-glow');
        
        // Mouse tracking coordinates
        this.mouse = { x: -100, y: -100 };
        this.cursorPos = { x: -100, y: -100 };
        this.glowPos = { x: -100, y: -100 };

        this.init();
    }

    init() {
        // Only run cursor effects on desktop/pointer-supported devices
        if (window.matchMedia('(max-width: 768px)').matches) return;

        // 1. Mouse coordinate tracking
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // 2. Continuous cursor update loop (adds smooth drag-lag effect)
        this.updateCursor();

        // 3. Hover elements (buttons, links) expansion effect
        const interactiveElements = document.querySelectorAll('a, button, .social-btn, .skill-tag, .project-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.cursor) {
                    this.cursor.style.width = '24px';
                    this.cursor.style.height = '24px';
                    this.cursor.style.background = 'rgba(99, 102, 241, 0.25)';
                    this.cursor.style.border = '1px solid #6366f1';
                }
            });
            el.addEventListener('mouseleave', () => {
                if (this.cursor) {
                    this.cursor.style.width = '8px';
                    this.cursor.style.height = '8px';
                    this.cursor.style.background = '#6366f1';
                    this.cursor.style.border = 'none';
                }
            });
        });

        // 4. 3D Tilt Card Effects
        this.setupTiltCards();

        // 5. Magnetic CTA Button tracking
        this.setupMagneticButtons();
    }

    updateCursor() {
        // Linear interpolation (Lerp) for elastic lag feel
        this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * 0.2;
        this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * 0.2;

        this.glowPos.x += (this.mouse.x - this.glowPos.x) * 0.08;
        this.glowPos.y += (this.mouse.y - this.glowPos.y) * 0.08;

        if (this.cursor) {
            this.cursor.style.transform = `translate3d(${this.cursorPos.x}px, ${this.cursorPos.y}px, 0) translate(-50%, -50%)`;
        }

        if (this.glow) {
            this.glow.style.transform = `translate3d(${this.glowPos.x}px, ${this.glowPos.y}px, 0) translate(-50%, -50%)`;
        }

        requestAnimationFrame(this.updateCursor.bind(this));
    }

    setupTiltCards() {
        const cards = document.querySelectorAll('.skills-category, .project-card, .bento-card, .timeline-content');
        
        cards.forEach(card => {
            let rect = null;

            card.addEventListener('mouseenter', () => {
                rect = card.getBoundingClientRect();
            });

            card.addEventListener('mousemove', (e) => {
                if (!rect) rect = card.getBoundingClientRect();
                
                // Mouse position inside the element from 0 to width/height
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Normalize position to -0.5 to +0.5
                const normalizedX = (x / rect.width) - 0.5;
                const normalizedY = (y / rect.height) - 0.5;
                
                // Tilt settings
                const maxTilt = 8; // Max rotation degrees
                const rotateX = -normalizedY * maxTilt;
                const rotateY = normalizedX * maxTilt;
                
                // Apply 3D perspective transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
                
                // Ambient lighting highlight inside the card
                const shadowX = -normalizedX * 15;
                const shadowY = -normalizedY * 15;
                card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(99, 102, 241, 0.08), 0 10px 30px rgba(0, 0, 0, 0.3)`;
            });

            card.addEventListener('mouseleave', () => {
                rect = null; // Clear cached rectangle on leave
                // Reset card transform smoothly
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                card.style.boxShadow = '';
            });
        });
    }

    setupMagneticButtons() {
        const magneticCTAs = document.querySelectorAll('.btn-primary, .social-btn');
        
        magneticCTAs.forEach(btn => {
            let rect = null;

            btn.addEventListener('mouseenter', () => {
                rect = btn.getBoundingClientRect();
            });

            btn.addEventListener('mousemove', (e) => {
                if (!rect) rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - (rect.width / 2);
                const y = e.clientY - rect.top - (rect.height / 2);
                
                // Pull button 35% towards the cursor coordinate
                btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                rect = null; // Clear cached rectangle on leave
                // Return to baseline
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    new CursorEffects();
});
