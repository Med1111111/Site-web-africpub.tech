/**
 * Scène Three.js du fond animé (shader de halos rouges + particules).
 * Chargée dynamiquement uniquement après hydratation, à l'idle ou à la
 * première interaction utilisateur, afin de ne pas peser sur le TBT initial.
 */
export async function startScene(el: HTMLElement): Promise<() => void> {
  const THREE = await import("three");

  let renderer: InstanceType<typeof THREE.WebGLRenderer>;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return () => {}; // pas de contexte WebGL : le dégradé CSS reste visible
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(el.clientWidth, el.clientHeight);
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uRes: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
  };

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uRes;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main(){
          vec2 uv = vUv;
          vec2 asp = vec2(uRes.x / uRes.y, 1.0);
          float t = uTime * 0.06;

          float n = noise(uv * 3.0 + t) * 0.6 + noise(uv * 7.0 - t * 1.6) * 0.4;

          vec2 m = uMouse;
          float glowMouse = 0.10 / (distance(uv * asp, m * asp) + 0.14);
          float glowA = 0.09 / (distance(uv * asp, vec2(0.22, 0.78) * asp) + 0.20);
          float glowB = 0.08 / (distance(uv * asp, vec2(0.82, 0.24) * asp) + 0.24);

          vec3 red = vec3(0.89, 0.02, 0.07);
          vec3 orange = vec3(1.0, 0.42, 0.10);

          vec3 col = red * glowA + orange * glowB * 0.7 + red * glowMouse * 0.9;
          col += n * 0.045;
          float alpha = clamp(length(col) * 0.85, 0.0, 0.9);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    }),
  );
  scene.add(plane);

  // Particules
  const count = window.innerWidth < 768 ? 260 : 700;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2.2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
    positions[i * 3 + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.006,
      color: new THREE.Color("#ff6a3d"),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(points);

  const pointer = { x: 0.5, y: 0.5 };
  const onPointerMove = (e: PointerEvent) => {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = 1 - e.clientY / window.innerHeight;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const onResize = () => {
    renderer.setSize(el.clientWidth, el.clientHeight);
    uniforms.uRes.value.set(el.clientWidth, el.clientHeight);
  };
  window.addEventListener("resize", onResize);

  let raf = 0;
  let running = true;
  const clock = new THREE.Clock();
  const tick = () => {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uMouse.value.x += (pointer.x - uniforms.uMouse.value.x) * 0.05;
    uniforms.uMouse.value.y += (pointer.y - uniforms.uMouse.value.y) * 0.05;
    points.rotation.z = t * 0.02;
    points.position.x = (pointer.x - 0.5) * 0.12;
    points.position.y = (pointer.y - 0.5) * 0.12;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  // Pause quand l'onglet est en arrière-plan
  const onVisibility = () => {
    const hidden = document.visibilityState === "hidden";
    if (hidden && running) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!hidden && !running) {
      running = true;
      tick();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    renderer.dispose();
    geo.dispose();
    plane.geometry.dispose();
    if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
  };
}
