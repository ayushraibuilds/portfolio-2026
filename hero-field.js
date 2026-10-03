/* ==========================================================
   Ayush Rai — Hero "signal field"
   A WebGL dot terrain behind the hero. No libraries.
   - ripples toward the cursor, pulses when the phone demo
     receives / sends a message (event: "signal:pulse")
   - tap / click anywhere in the hero sends a pulse
   - pauses offscreen, drops quality on slow devices,
     renders a single still frame for reduced motion
   ========================================================== */
(() => {
    'use strict';

    const canvas = document.getElementById('heroField');
    if (!canvas) return;
    const hero = canvas.closest('.hero') || canvas.parentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const conn = navigator.connection;
    if (conn && conn.saveData) { canvas.remove(); return; }

    const start = () => {
        const gl = canvas.getContext('webgl', {
            alpha: true, antialias: false, premultipliedAlpha: true,
            depth: false, stencil: false, powerPreference: 'low-power'
        });
        if (!gl) { canvas.remove(); return; }

        /* ---------- Shaders ---------- */
        const VERT = `
attribute vec2 a_p;
uniform mat4 u_vp;
uniform float u_t;
uniform vec3 u_m;
uniform vec3 u_p0;
uniform vec3 u_p1;
uniform float u_k;
uniform float u_max;
uniform float u_dim;
varying float v_a;
varying float v_h;

float pulse(vec3 P, vec2 p) {
    float age = u_t - P.z;
    if (age < 0.0 || age > 7.0) return 0.0;
    float ring = distance(p, P.xy) - age * 6.5;
    return exp(-ring * ring * 0.55) * exp(-age * 0.5);
}

void main() {
    vec2 p = a_p;
    float t = u_t;
    float h = sin(p.x * 0.32 + t * 0.55) * 0.42
            + sin(p.y * 0.45 - t * 0.75 + p.x * 0.15) * 0.32
            + sin((p.x - p.y) * 0.9 + t * 1.2) * 0.07;
    float md = distance(p, u_m.xy);
    float m = exp(-md * md * 0.07) * u_m.z;
    h += m * 1.1 + sin(md * 1.5 - t * 3.5) * exp(-md * 0.3) * 0.1 * u_m.z;
    float pu = pulse(u_p0, p) + pulse(u_p1, p);
    h += pu * 0.8;

    vec4 c = u_vp * vec4(p.x, h, p.y, 1.0);
    gl_Position = c;
    float depth = max(c.w, 0.001);
    gl_PointSize = min(u_k * (1.0 + m * 0.6 + pu * 1.1) / depth, u_max);

    float fade = smoothstep(34.0, 11.0, depth) * smoothstep(0.6, 2.6, depth);
    float side = mix(1.0 - u_dim, 1.0, smoothstep(-0.85, 0.35, c.x / depth));
    v_a = (0.16 + clamp(h + 0.7, 0.0, 1.8) * 0.19 + m * 0.55 + pu * 0.9) * fade * side;
    v_h = clamp(pu * 1.5, 0.0, 1.0);
}`;
        const FRAG = `
precision mediump float;
varying float v_a;
varying float v_h;
uniform vec3 u_c0;
uniform vec3 u_c1;
void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;
    float a = v_a * smoothstep(0.25, 0.03, r);
    gl_FragColor = vec4(mix(u_c0, u_c1, v_h) * a, a);
}`;

        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
            return s;
        };
        let prog;
        try {
            prog = gl.createProgram();
            gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
            gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        } catch (err) {
            console.warn('[hero-field] disabled:', err);
            canvas.remove();
            return;
        }
        gl.useProgram(prog);
        const U = {};
        ['u_vp', 'u_t', 'u_m', 'u_p0', 'u_p1', 'u_k', 'u_max', 'u_dim', 'u_c0', 'u_c1']
            .forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
        const aP = gl.getAttribLocation(prog, 'a_p');
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(aP);
        gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.uniform3f(U.u_c0, 0.49, 1.0, 0.70);   // --accent  #7dffb3
        gl.uniform3f(U.u_c1, 1.0, 0.72, 0.42);   // --accent-2 #ffb86b
        const maxPoint = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1] || 16;

        /* ---------- Tiny vec / mat helpers (column-major) ---------- */
        const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
        const perspective = (fovy, asp, n, f) => {
            const t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
            return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
        };
        const lookAt = (eye, ctr, up) => {
            const z = norm(sub(eye, ctr)), x = norm(cross(up, z)), y = cross(z, x);
            return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
        };
        const mul = (a, b) => {
            const o = new Array(16);
            for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
                o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
            }
            return o;
        };

        /* ---------- Camera & grid ---------- */
        const FOV = 50 * Math.PI / 180;
        const EYE = [0, 2.4, 5];
        const CTR = [0, -0.4, -10];
        const UP = [0, 1, 0];
        const NEAR_Z = 3, FAR_Z = -34;
        const fwd = norm(sub(CTR, EYE));
        const right = norm(cross(fwd, UP));
        const camUp = cross(right, fwd);

        let cssW = 0, cssH = 0, dpr = 1, aspect = 1, count = 0, gridAspect = 0;
        let dprCap = 1.75;

        const buildGrid = () => {
            const s = aspect < 1 ? 0.16 : 0.22;
            const halfW = Math.min((EYE[2] - FAR_Z) * Math.tan(FOV / 2) * aspect + 2, 34);
            const cols = Math.ceil((2 * halfW) / s);
            const rows = Math.ceil((NEAR_Z - FAR_Z) / s);
            const data = new Float32Array(cols * rows * 2);
            let k = 0;
            for (let r = 0; r < rows; r++) {
                const z = NEAR_Z - r * s;
                for (let c = 0; c < cols; c++) { data[k++] = -halfW + c * s; data[k++] = z; }
            }
            count = cols * rows;
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gridAspect = aspect;
        };

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            cssW = Math.max(1, r.width);
            cssH = Math.max(1, r.height);
            dpr = Math.min(window.devicePixelRatio || 1, dprCap);
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
            aspect = cssW / cssH;
            if (!gridAspect || Math.abs(aspect - gridAspect) / gridAspect > 0.08) buildGrid();
            gl.uniformMatrix4fv(U.u_vp, false, new Float32Array(mul(perspective(FOV, aspect, 0.1, 60), lookAt(EYE, CTR, UP))));
            gl.uniform1f(U.u_k, 14.5 * dpr * (cssH / 900));
            gl.uniform1f(U.u_max, Math.min(6 * dpr, maxPoint));
            gl.uniform1f(U.u_dim, aspect > 1.05 ? 0.62 : 0.15);
        };

        /* screen point (px, relative to canvas) -> ground plane (x, z) */
        const toGround = (sx, sy) => {
            const nx = (sx / cssW) * 2 - 1;
            const ny = 1 - (sy / cssH) * 2;
            const th = Math.tan(FOV / 2);
            const d = norm([
                fwd[0] + right[0] * nx * th * aspect + camUp[0] * ny * th,
                fwd[1] + right[1] * nx * th * aspect + camUp[1] * ny * th,
                fwd[2] + right[2] * nx * th * aspect + camUp[2] * ny * th
            ]);
            const dy = Math.min(d[1], -0.06);
            const t = Math.min(-EYE[1] / dy, 30);
            return [EYE[0] + d[0] * t, EYE[2] + d[2] * t];
        };

        /* ---------- Interaction state ---------- */
        const mouse = { x: 0, z: -6, s: 0, tx: 0, tz: -6, ts: 0 };
        const pulses = [[0, 0, -99], [0, 0, -99]];
        let slot = 0;
        const t0 = performance.now();
        const now = () => (performance.now() - t0) / 1000;

        const pulseAt = (sx, sy) => {
            const [x, z] = toGround(sx, sy);
            pulses[slot] = [x, z, now()];
            slot ^= 1;
            if (!running) kick();
        };

        if (!reduceMotion) {
            if (finePointer) {
                window.addEventListener('pointermove', e => {
                    if (!visible) return;
                    const r = canvas.getBoundingClientRect();
                    const x = e.clientX - r.left, y = e.clientY - r.top;
                    const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
                    mouse.ts = inside ? 1 : 0;
                    if (inside) { const g = toGround(x, y); mouse.tx = g[0]; mouse.tz = g[1]; }
                }, { passive: true });
                document.documentElement.addEventListener('pointerleave', () => { mouse.ts = 0; });
            }
            hero.addEventListener('pointerdown', e => {
                const r = canvas.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                if (y <= r.height) pulseAt(x, y);
            });
            window.addEventListener('signal:pulse', e => {
                const el = (e.detail && e.detail.el) || document.getElementById('phone');
                const r = canvas.getBoundingClientRect();
                if (!el) return pulseAt(cssW * 0.7, cssH * 0.7);
                const p = el.getBoundingClientRect();
                const x = p.left + p.width / 2 - r.left;
                let y = p.top + p.height * 0.75 - r.top;
                if (y > r.height) y = r.height * 0.85;   // phone below the field (mobile)
                pulseAt(x, y);
            });
        }

        /* ---------- Render loop ---------- */
        let visible = true, running = false, raf = 0;
        let slowFrames = 0, frames = 0, last = performance.now();

        const draw = t => {
            const follow = mouse.s < 0.03 ? 1 : 0.08;   // snap while invisible, glide once shown
            mouse.x += (mouse.tx - mouse.x) * follow;
            mouse.z += (mouse.tz - mouse.z) * follow;
            mouse.s += (mouse.ts - mouse.s) * 0.05;
            gl.uniform1f(U.u_t, t);
            gl.uniform3f(U.u_m, mouse.x, mouse.z, mouse.s);
            gl.uniform3f(U.u_p0, pulses[0][0], pulses[0][1], pulses[0][2]);
            gl.uniform3f(U.u_p1, pulses[1][0], pulses[1][1], pulses[1][2]);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, count);
        };

        const loop = ts => {
            raf = 0;
            if (!visible || document.hidden) { running = false; return; }
            draw(now());

            // adaptive quality: if frames are consistently slow, lower resolution, then go static
            const dt = ts - last; last = ts;
            if (++frames > 20 && dt > 34) slowFrames++;
            if (slowFrames > 45) {
                slowFrames = 0;
                if (dprCap > 1) { dprCap = 1; resize(); }
                else { running = false; return; }
            }
            raf = requestAnimationFrame(loop);
        };
        const kick = () => {
            if (reduceMotion) { draw(3.2); return; }
            if (running || !visible) return;
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(loop);
        };

        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (visible) kick();
        }, { threshold: 0 }).observe(canvas);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

        let rt = 0;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(() => { resize(); if (reduceMotion || !running) draw(reduceMotion ? 3.2 : now()); }, 120);
        });
        canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); running = false; canvas.classList.remove('is-on'); });

        resize();
        draw(reduceMotion ? 3.2 : 0);
        requestAnimationFrame(() => canvas.classList.add('is-on'));
        kick();
    };

    // Start after first paint so the field never competes with the hero text for LCP
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
    if (document.readyState === 'complete') idle(start, { timeout: 1200 });
    else window.addEventListener('load', () => idle(start, { timeout: 1200 }), { once: true });
})();
