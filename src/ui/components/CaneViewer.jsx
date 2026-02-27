import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import icaneData from "../../assets/project.json";

const AD_TEXTS = [
  {
    label: "Voice-Guided Navigation",
    headline: "Navigate with Confidence",
    sub: "Real-time obstacle detection keeps every step safe.",
    position: { bottom: "10%", left: "5%", right: "auto", top: "auto" }
  },
  {
    label: "Always Connected",
    headline: "Peace of Mind, Everywhere",
    sub: "Live GPS tracking so guardians are never out of the loop.",
    position: { top: "10%", right: "5%", bottom: "auto", left: "auto" }
  },
  {
    label: "Emergency Ready",
    headline: "SOS at Your Fingertips",
    sub: "Instant alerts sent to your guardians when it matters most.",
    position: { bottom: "10%", right: "5%", top: "auto", left: "auto" }
  },
  {
    label: "Smart Assistive Tech",
    headline: "Smart. Safe. Independent.",
    sub: "The future of assistive mobility is finally here.",
    position: { top: "10%", left: "5%", bottom: "auto", right: "auto" }
  }
];

// Small hook for responsive logic
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();

    // Support older Safari
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [query]);

  return matches;
};

const CaneViewer = () => {
  const mountRef = useRef(null);
  const [adIndex, setAdIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Cycle through ad texts with fade in/out
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setAdIndex((i) => (i + 1) % AD_TEXTS.length);
        setVisible(true);
      }, 700);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Scene / Camera / Renderer ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10); // placeholder, overridden after model loads

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Load model ---
    const loader = new THREE.ObjectLoader();
    const model = loader.parse(icaneData.scene);

    // Remove floor (if present)
    const floor = model.getObjectByName("Box");
    if (floor) floor.removeFromParent();

    // Auto-center & scale
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const scale = 3 / maxDim;
    model.scale.setScalar(scale);

    model.position.set(
      -center.x * scale - 0.1,
      -center.y * scale - 0.2,
      -center.z * scale
    );

    // Tilt group for slanted presentation
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = -Math.PI / 5;
    tiltGroup.position.x = -0.2;
    tiltGroup.add(model);
    scene.add(tiltGroup);

    // Camera framing
    const dist = (3 / 2 / Math.tan((50 * Math.PI) / 180 / 2)) * 0.9;
    camera.position.set(0.5, 0, dist);
    camera.lookAt(0, 0, 0);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.enablePan = false;
    controls.enableZoom = false;

    // Desktop: locked unless holding click; Mobile: always enabled (better UX)
    controls.enabled = isMobile ? true : false;
    controls.update();

    const handlePointerDown = () => {
      if (!isMobile) controls.enabled = true;
    };
    const handlePointerUp = () => {
      if (!isMobile) controls.enabled = false;
    };
    const handleMouseLeave = () => {
      if (!isMobile) controls.enabled = false;
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown, {
      capture: true
    });
    window.addEventListener("pointerup", handlePointerUp);
    mount.addEventListener("mouseleave", handleMouseLeave);

    // --- Resize ---
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Render loop ---
    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      model.rotation.y += isMobile ? 0.004 : 0.008;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener(
        "pointerdown",
        handlePointerDown,
        { capture: true }
      );
      mount.removeEventListener("mouseleave", handleMouseLeave);

      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, [isMobile]);

  const ad = AD_TEXTS[adIndex];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #09132b 0%, #112248 45%, #0e2d6b 100%)"
      }}
    >
      {/* 3D canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-left branding (responsive) */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-8 pointer-events-none flex items-center gap-2">
        <img src="/icane.svg" alt="iCane Logo" className="h-7 sm:h-8 w-auto" />
        <span className="text-white/70 text-[10px] sm:text-xs tracking-[0.35em] uppercase font-medium">
          iCane — Smart Cane
        </span>
      </div>

      {/* Ad text: Desktop floating vs Mobile bottom card */}
      {!isMobile ? (
        <div
          className="absolute pointer-events-none max-w-md"
          style={{
            ...ad.position,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            padding: "0 2rem"
          }}
        >
          <span className="text-[#5b8def] text-xs tracking-[0.3em] uppercase font-semibold">
            {ad.label}
          </span>
          <h2 className="text-white text-3xl sm:text-4xl font-bold mt-1 mb-2 leading-tight">
            {ad.headline}
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            {ad.sub}
          </p>
        </div>
      ) : (
        <div
          className="absolute left-0 right-0 bottom-0 px-4 pb-5 pt-3 pointer-events-none"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease, transform 0.7s ease"
          }}
        >
          <div
            className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-4"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)"
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#5b8def] text-[10px] tracking-[0.35em] uppercase font-semibold">
                {ad.label}
              </span>
              <span className="text-white/45 text-[11px]">
                Hold &amp; drag to rotate
              </span>
            </div>

            <h2 className="text-white text-xl font-bold mt-2 leading-snug">
              {ad.headline}
            </h2>
            <p className="text-white/65 text-sm mt-1 leading-relaxed">
              {ad.sub}
            </p>

            {/* Dots inside card on mobile */}
            <div className="mt-3 flex justify-center gap-2">
              {AD_TEXTS.map((_, i) => (
                <span
                  key={i}
                  className="block rounded-full transition-all duration-500"
                  style={{
                    width: i === adIndex ? "18px" : "6px",
                    height: "6px",
                    background:
                      i === adIndex ? "#5b8def" : "rgba(255,255,255,0.25)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop dot indicators (hidden on mobile) */}
      {!isMobile && (
        <div className="absolute bottom-14 right-10 flex gap-2 pointer-events-none">
          {AD_TEXTS.map((_, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-500"
              style={{
                width: i === adIndex ? "20px" : "6px",
                height: "6px",
                background: i === adIndex ? "#5b8def" : "rgba(255,255,255,0.25)"
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(5,10,25,0.55) 100%)"
        }}
      />
    </div>
  );
};

export default CaneViewer;
