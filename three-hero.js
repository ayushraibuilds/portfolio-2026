/* ============================================
   THREE.JS 3D Hero Scene
   Floating icosahedron + orbiting particles
   ============================================ */

class HeroScene {
    constructor(container) {
        this.container = container;
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.isVisible = true;
        this.clock = new THREE.Clock();
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0e1a, 0.035);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        this.addLights();

        // Objects
        this.createMainGeometry();
        this.createOrbitingParticles();
        this.createFloatingRings();

        // Events
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Visibility observer
        const observer = new IntersectionObserver(
            (entries) => {
                this.isVisible = entries[0].isIntersecting;
            },
            { threshold: 0.01 }
        );
        observer.observe(this.container);

        this.animate();
    }

    addLights() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x334466, 0.5);
        this.scene.add(ambient);

        // Main point light (cyan)
        const pointCyan = new THREE.PointLight(0x22d3ee, 2, 20);
        pointCyan.position.set(2, 2, 3);
        this.scene.add(pointCyan);

        // Purple accent light
        const pointPurple = new THREE.PointLight(0x8b5cf6, 1.5, 20);
        pointPurple.position.set(-3, -1, 2);
        this.scene.add(pointPurple);

        // Blue fill light
        const pointBlue = new THREE.PointLight(0x3b82f6, 1, 15);
        pointBlue.position.set(0, -3, 4);
        this.scene.add(pointBlue);

        this.lights = { pointCyan, pointPurple, pointBlue };
    }

    createMainGeometry() {
        // Main icosahedron — wireframe
        const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
        const icoMat = new THREE.MeshPhongMaterial({
            color: 0x22d3ee,
            wireframe: true,
            transparent: true,
            opacity: 0.35,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.15,
        });
        this.icosahedron = new THREE.Mesh(icoGeo, icoMat);
        this.scene.add(this.icosahedron);

        // Inner solid icosahedron (subtle glow core)
        const innerGeo = new THREE.IcosahedronGeometry(0.6, 2);
        const innerMat = new THREE.MeshPhongMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.15,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.3,
        });
        this.innerCore = new THREE.Mesh(innerGeo, innerMat);
        this.scene.add(this.innerCore);
    }

    createOrbitingParticles() {
        const count = 200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorCyan = new THREE.Color(0x22d3ee);
        const colorPurple = new THREE.Color(0x8b5cf6);
        const colorBlue = new THREE.Color(0x3b82f6);
        const palette = [colorCyan, colorPurple, colorBlue];

        for (let i = 0; i < count; i++) {
            // Distribute on a sphere shell
            const radius = 2 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 3 + 1;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMat = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(particleGeo, particleMat);
        this.scene.add(this.particles);
    }

    createFloatingRings() {
        this.rings = [];
        const ringRadii = [1.8, 2.5, 3.2];
        const ringColors = [0x22d3ee, 0x8b5cf6, 0x3b82f6];

        ringRadii.forEach((radius, i) => {
            const ringGeo = new THREE.TorusGeometry(radius, 0.008, 8, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: ringColors[i],
                transparent: true,
                opacity: 0.12 + i * 0.03,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2 + (i * 0.3);
            ring.rotation.y = i * 0.5;
            this.rings.push(ring);
            this.scene.add(ring);
        });
    }

    onResize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    animate() {
        if (!this.isVisible) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        const t = this.clock.getElapsedTime();

        // Smooth mouse follow
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // Rotate main icosahedron
        this.icosahedron.rotation.x = t * 0.15 + this.mouse.y * 0.3;
        this.icosahedron.rotation.y = t * 0.2 + this.mouse.x * 0.3;

        // Breathe effect
        const breathe = 1 + Math.sin(t * 0.8) * 0.05;
        this.icosahedron.scale.setScalar(breathe);

        // Inner core counter-rotate
        this.innerCore.rotation.x = -t * 0.1;
        this.innerCore.rotation.y = -t * 0.15;
        this.innerCore.scale.setScalar(0.6 + Math.sin(t * 1.2) * 0.08);

        // Rotate particles
        this.particles.rotation.y = t * 0.05;
        this.particles.rotation.x = t * 0.02;

        // Rotate rings at different speeds
        this.rings.forEach((ring, i) => {
            ring.rotation.z = t * (0.05 + i * 0.02);
            ring.rotation.x = Math.PI / 2 + i * 0.3 + Math.sin(t * 0.3 + i) * 0.1;
        });

        // Subtle camera movement following mouse
        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (-this.mouse.y * 0.3 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        // Animate lights
        this.lights.pointCyan.position.x = Math.sin(t * 0.7) * 3;
        this.lights.pointCyan.position.y = Math.cos(t * 0.5) * 2;
        this.lights.pointPurple.position.x = Math.cos(t * 0.3) * 3;
        this.lights.pointPurple.position.y = Math.sin(t * 0.4) * 2;

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
}
