/*
 * Ambient background field.
 * Personal mode: an organic, slowly breathing drift of points (warm).
 * Professional mode: the same points settle into a loose lattice (cool).
 * Switching modes morphs one state into the other.
 */
import * as THREE from 'three';

(function () {
    var canvas;
    try {
        canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return;
    } catch (e) {
        return;
    }

    var root = document.documentElement;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.matchMedia('(max-width: 640px)').matches;
    var ambient = document.body.getAttribute('data-scene') !== 'full';

    var COUNT = ambient ? (isMobile ? 300 : 550) : (isMobile ? 550 : 1100);
    var ACCENT_RATIO = 0.14;
    var SPREAD = { x: 58, y: 36, z: 20 };

    canvas = document.createElement('canvas');
    canvas.className = 'scene-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 300);
    camera.position.z = 72;

    /* Per-point data: an organic "drift" home and an ordered "lattice" home */
    var drift = new Float32Array(COUNT * 3);
    var lattice = new Float32Array(COUNT * 3);
    var phase = new Float32Array(COUNT * 3);
    var freq = new Float32Array(COUNT);
    var isAccent = new Uint8Array(COUNT);

    // Lattice dimensions: wide, shallow grid with slight jitter
    var nx = Math.round(Math.cbrt(COUNT) * 1.9);
    var ny = Math.round(Math.cbrt(COUNT) * 1.15);
    var nz = Math.max(2, Math.ceil(COUNT / (nx * ny)));

    for (var i = 0; i < COUNT; i++) {
        var ix = i % nx;
        var iy = Math.floor(i / nx) % ny;
        var iz = Math.floor(i / (nx * ny));

        lattice[i * 3] = (ix / (nx - 1) - 0.5) * 2 * SPREAD.x + (Math.random() - 0.5) * 1.1;
        lattice[i * 3 + 1] = (iy / (ny - 1) - 0.5) * 2 * SPREAD.y + (Math.random() - 0.5) * 1.1;
        lattice[i * 3 + 2] = (iz / Math.max(1, nz - 1) - 0.5) * 2 * SPREAD.z * 0.55 + (Math.random() - 0.5) * 1.1;

        // Organic cloud: even spread with soft edges
        drift[i * 3] = (Math.random() * 2 - 1) * SPREAD.x * 1.1;
        drift[i * 3 + 1] = (Math.random() * 2 - 1) * SPREAD.y * 1.1;
        drift[i * 3 + 2] = (Math.random() * 2 - 1) * SPREAD.z;

        phase[i * 3] = Math.random() * Math.PI * 2;
        phase[i * 3 + 1] = Math.random() * Math.PI * 2;
        phase[i * 3 + 2] = Math.random() * Math.PI * 2;
        freq[i] = 0.18 + Math.random() * 0.4;
        isAccent[i] = Math.random() < ACCENT_RATIO ? 1 : 0;
    }

    var positions = new Float32Array(drift);
    var colors = new Float32Array(COUNT * 3);

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Soft round sprite so points read as quiet dots, not squares
    function makeDotTexture() {
        var c = document.createElement('canvas');
        c.width = c.height = 64;
        var ctx = c.getContext('2d');
        var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        var tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    var material = new THREE.PointsMaterial({
        size: 1.1,
        map: makeDotTexture(),
        vertexColors: true,
        transparent: true,
        opacity: ambient ? 0.28 : 0.42,
        sizeAttenuation: true,
        depthWrite: false
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);

    function cssColor(name, fallback) {
        var v = getComputedStyle(root).getPropertyValue(name).trim();
        return new THREE.Color(v || fallback);
    }

    function updateColors() {
        var dot = cssColor('--scene-dot', '#AEB2B8');
        var accent = cssColor('--scene-accent', '#C88A6C');
        for (var i = 0; i < COUNT; i++) {
            var c = isAccent[i] ? accent : dot;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        geometry.attributes.color.needsUpdate = true;
    }

    /* morph: 0 = personal drift, 1 = professional lattice */
    var morph = root.getAttribute('data-mode') === 'personal' ? 0 : 1;
    var morphTarget = morph;

    var pointer = { x: 0, y: 0 };
    var pointerEased = { x: 0, y: 0 };

    window.addEventListener('mousemove', function (e) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function ease(t) {
        return t * t * (3 - 2 * t); // smoothstep
    }

    function update(t, dt) {
        morph += (morphTarget - morph) * Math.min(1, dt * 2.2);
        var m = ease(Math.max(0, Math.min(1, morph)));

        var wobble = 3.1 * (1 - m) + 0.3 * m;
        var breath = 1 + Math.sin(t * 0.45) * 0.035 * (1 - m);

        for (var i = 0; i < COUNT; i++) {
            var i3 = i * 3;
            var f = freq[i];
            var dx = drift[i3] * breath;
            var dy = drift[i3 + 1] * breath;
            var dz = drift[i3 + 2] * breath;
            positions[i3] = dx + (lattice[i3] - dx) * m + Math.sin(t * f + phase[i3]) * wobble;
            positions[i3 + 1] = dy + (lattice[i3 + 1] - dy) * m + Math.sin(t * f * 0.86 + phase[i3 + 1]) * wobble;
            positions[i3 + 2] = dz + (lattice[i3 + 2] - dz) * m + Math.sin(t * f * 0.71 + phase[i3 + 2]) * wobble * 0.6;
        }
        geometry.attributes.position.needsUpdate = true;

        pointerEased.x += (pointer.x - pointerEased.x) * Math.min(1, dt * 3);
        pointerEased.y += (pointer.y - pointerEased.y) * Math.min(1, dt * 3);

        var rotSpeed = 0.022 * (1 - m) + 0.004 * m;
        points.rotation.y = t * rotSpeed + pointerEased.x * 0.05;
        points.rotation.x = pointerEased.y * 0.035 + 0.04 * (1 - m);
    }

    function render() {
        renderer.render(scene, camera);
    }

    var rafId = null;
    var clock = new THREE.Clock();
    var elapsed = 0;

    function loop() {
        rafId = requestAnimationFrame(loop);
        var dt = Math.min(clock.getDelta(), 0.1);
        elapsed += dt;
        update(elapsed, dt);
        render();
    }

    function start() {
        if (rafId === null && !reducedMotion) {
            clock.getDelta();
            loop();
        }
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function renderStill() {
        morph = morphTarget;
        update(elapsed, 0.016);
        render();
    }

    updateColors();
    if (reducedMotion) {
        renderStill();
    } else {
        start();
    }

    document.addEventListener('sitemode', function (e) {
        morphTarget = e.detail.mode === 'personal' ? 0 : 1;
        updateColors();
        if (reducedMotion) renderStill();
    });

    document.addEventListener('sitetheme', function () {
        updateColors();
        if (reducedMotion) renderStill();
    });

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (reducedMotion) renderStill();
    });
})();
