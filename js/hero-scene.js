import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

// Performance toggle – set to true for smoother experience on lower‑end devices
const HIGH_PERFORMANCE_MODE = true;

class HeroScene {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        if (!this.container) return;

        // Settings
        this.particleCount = HIGH_PERFORMANCE_MODE ? 400 : 800; // reduced particles in high‑perf mode
        this.geometryCount = 4;
        
        // Mouse interaction state
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.scrollOpacity = 1;
        
        this.init();
    }

    init() {
        // 1. Setup Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x030014, 0.015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.container,
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // 2. Add Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50); // Indigo glow
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 50); // Cyan glow
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);

        // 3. Create Swirling Particle Nebula
        this.createNebula();

        // 4. Create Floating Wireframe Geometries
        this.createFloatingGeometries();

        // 5. Setup Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

        // 6. Start Loop
        this.clock = new THREE.Clock();
        this.animate();
    }

    createNebula() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const colorIndigo = new THREE.Color('#6366f1');
        const colorCyan = new THREE.Color('#06b6d4');

        for (let i = 0; i < this.particleCount; i++) {
            // Swirling disc formation
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 25;
            const spin = radius * 0.1; // swirl effect

            const x = Math.cos(angle + spin) * radius;
            const y = (Math.random() - 0.5) * 6; // slightly flat disc
            const z = Math.sin(angle + spin) * radius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Interpolate colors based on distance from center
            const ratio = radius / 30;
            const mixedColor = colorIndigo.clone().lerp(colorCyan, ratio);

            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Soft round circular particle
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        const particleTexture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 0.15,
            map: particleTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createFloatingGeometries() {
        this.geometries = [];

        // Various modern architectural geometries
        const shapes = [
            new THREE.IcosahedronGeometry(2, 1),
            new THREE.TorusGeometry(1.5, 0.4, 8, 24),
            new THREE.OctahedronGeometry(1.8, 0),
            new THREE.DodecahedronGeometry(1.5, 0)
        ];

        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending
        });

        const solidMaterial = new THREE.MeshPhongMaterial({
            color: 0x06b6d4,
            shininess: 100,
            flatShading: true,
            transparent: true,
            opacity: 0.03,
            blending: THREE.AdditiveBlending
        });

        shapes.forEach((shape, index) => {
            const group = new THREE.Group();
            
            const wire = new THREE.Mesh(shape, wireframeMaterial.clone());
            const solid = new THREE.Mesh(shape, solidMaterial.clone());
            
            // Differentiate colors/opacities slightly
            if (index % 2 === 0) {
                wire.material.color.setHex(0x06b6d4);
                solid.material.color.setHex(0x6366f1);
            }

            group.add(wire);
            group.add(solid);

            // Spread out in space
            group.position.x = (Math.random() - 0.5) * 30;
            group.position.y = (Math.random() - 0.5) * 15;
            group.position.z = (Math.random() - 0.5) * 10 - 5;

            // Give distinct rotation speeds/directions
            group.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.2,
                rotSpeedY: (Math.random() - 0.5) * 0.2,
                orbitSpeed: (Math.random() * 0.1) + 0.05,
                orbitRadius: group.position.length(),
                orbitAngle: Math.random() * Math.PI * 2
            };

            this.scene.add(group);
            this.geometries.push(group);
        });
    }

    onMouseMove(e) {
        // Convert screen coordinates to normalized device coordinates (-1 to +1)
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onScroll() {
        const scrolled = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Gracefully fade canvas opacity when hero scrolls out of view
        this.scrollOpacity = Math.max(0, 1 - (scrolled / windowHeight));
        this.container.style.opacity = this.scrollOpacity;
    }

    animate() {
        // Throttle to ~60fps
        const now = performance.now();
        if (!this._lastFrameTime) this._lastFrameTime = now;
        const delta = now - this._lastFrameTime;
        if (delta < 1000 / 60) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }
        this._lastFrameTime = now;

        // Pause rendering when tab is hidden to save resources
        if (document.hidden) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }

        requestAnimationFrame(this.animate.bind(this));

        // Skip calculations and drawing if completely off-screen
        if (this.scrollOpacity <= 0) return;

        const elapsedTime = this.clock.getElapsedTime();

        // 1. Slow particle nebula rotation & breathing
        if (this.particles) {
            this.particles.rotation.y = elapsedTime * 0.02;
            this.particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;
        }

        // 2. Slow orbit & rotation of floating polyhedra
        this.geometries.forEach(geo => {
            geo.rotation.x += geo.userData.rotSpeedX * 0.05;
            geo.rotation.y += geo.userData.rotSpeedY * 0.05;

            // Gentle floating vertical orbit
            geo.position.y += Math.sin(elapsedTime + geo.userData.orbitAngle) * 0.005;
        });

        // 3. Mouse interpolation for lag-free cinematic parallax
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        this.camera.position.x = this.mouse.x * 4;
        this.camera.position.y = -this.mouse.y * 4;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Create FPS overlay for debugging (optional)
    const fpsOverlay = document.createElement('div');
    fpsOverlay.id = 'fps-overlay';
    document.body.appendChild(fpsOverlay);
    // Extend HeroScene to update FPS
    const originalRender = HeroScene.prototype.animate;
    HeroScene.prototype.animate = function () {
        const start = performance.now();
        originalRender.apply(this);
        const end = performance.now();
        const fps = Math.round(1000 / (end - start));
        const overlay = document.getElementById('fps-overlay');
        if (overlay) overlay.textContent = `FPS: ${fps}`;
    };
    new HeroScene();
});
