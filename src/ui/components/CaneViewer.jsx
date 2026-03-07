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

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();

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
  const [isInteractMode, setIsInteractMode] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      const timeoutId = setTimeout(() => {
        setAdIndex((i) => (i + 1) % AD_TEXTS.length);
        setVisible(true);
      }, 700);

      return () => clearTimeout(timeoutId);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = isInteractMode ? "none" : "pan-y";

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new THREE.ObjectLoader();
    const model = loader.parse(icaneData.scene);

    const floor = model.getObjectByName("Box");
    if (floor) floor.removeFromParent();

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = -Math.PI / 5;
    scene.add(tiltGroup);
    tiltGroup.add(model);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.9;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.8;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.enabled = isInteractMode;
    controls.update();

    const fitModelToView = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      tiltGroup.position.set(0, 0, 0);

      const rawBox = new THREE.Box3().setFromObject(model);
      const rawCenter = rawBox.getCenter(new THREE.Vector3());
      const rawSize = rawBox.getSize(new THREE.Vector3());

      model.position.set(-rawCenter.x, -rawCenter.y, -rawCenter.z);

      const targetHeight = isMobile ? 4.8 : 5.8;
      const scale = targetHeight / Math.max(rawSize.y, 0.0001);
      model.scale.setScalar(scale);

      const box = new THREE.Box3().setFromObject(tiltGroup);
      const center = box.getCenter(new THREE.Vector3());

      tiltGroup.position.set(-center.x, -center.y, -center.z);

      const fittedBox = new THREE.Box3().setFromObject(tiltGroup);
      const fittedSize = fittedBox.getSize(new THREE.Vector3());

      const maxSizeY = fittedSize.y;
      const maxSizeX = fittedSize.x;

      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distanceForHeight = maxSizeY / 2 / Math.tan(fov / 2);
      const distanceForWidth =
        maxSizeX / 2 / (Math.tan(fov / 2) * camera.aspect);

      const fitDistance = Math.max(distanceForHeight, distanceForWidth);
      const offset = isMobile ? 1.18 : 1.15;
      const initialDistance = fitDistance * offset;

      camera.position.set(0, 0, initialDistance);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);

      controls.minDistance = initialDistance * 0.65;
      controls.maxDistance = initialDistance * 1.8;

      controls.update();
    };

    fitModelToView();

    const handleResize = () => {
      renderer.domElement.style.touchAction = isInteractMode ? "none" : "pan-y";
      controls.enabled = isInteractMode;
      fitModelToView();
    };

    window.addEventListener("resize", handleResize);

    let animFrameId;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      if (!isInteractMode) {
        model.rotation.y += isMobile ? 0.004 : 0.006;
      }

      controls.enabled = isInteractMode;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);

      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      controls.dispose();
      renderer.dispose();
    };
  }, [isMobile, isInteractMode]);

  const ad = AD_TEXTS[adIndex];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #5B8DEF 0%, #EAF2FF 55%, #FFFFFF 100%)"
      }}
    >
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{ touchAction: isInteractMode ? "none" : "pan-y" }}
      />

      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 z-10 max-w-[calc(100%-2rem)] sm:max-w-none">
        <img
          src="/icane.svg"
          alt="iCane Logo"
          className="h-6 w-auto shrink-0"
        />
        <span className="text-black/70 text-[9px] tracking-[0.22em] uppercase font-medium leading-none">
          iCane — Smart Cane
        </span>
      </div>

      {isMobile ? (
        <div className="absolute top-14 left-4 z-10">
          <button
            type="button"
            onClick={() => setIsInteractMode((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] tracking-[0.12em] font-semibold uppercase transition-all duration-300"
            style={{
              borderColor: isInteractMode
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.4)",
              background: isInteractMode
                ? "rgba(0,0,0,0.9)"
                : "rgba(255,255,255,0.9)",
              color: isInteractMode ? "#ffffff" : "#111111",
              boxShadow: isInteractMode
                ? "0 10px 24px rgba(0,0,0,0.22)"
                : "0 10px 24px rgba(91,141,239,0.16)"
            }}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isInteractMode ? "bg-green-400" : "bg-[#5B8DEF]"
              }`}
            />
            {isInteractMode ? "Exit 3D" : "Explore 3D"}
          </button>
        </div>
      ) : (
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={() => setIsInteractMode((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] tracking-[0.14em] font-semibold uppercase transition-all duration-300 cursor-pointer z-20"
            style={{
              borderColor: isInteractMode
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.4)",
              background: isInteractMode
                ? "rgba(0,0,0,0.9)"
                : "rgba(255,255,255,0.9)",
              color: isInteractMode ? "#ffffff" : "#111111",
              boxShadow: isInteractMode
                ? "0 10px 24px rgba(0,0,0,0.22)"
                : "0 10px 24px rgba(91,141,239,0.16)"
            }}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isInteractMode ? "bg-green-400" : "bg-[#5B8DEF]"
              }`}
            />
            {isInteractMode ? "Exit 3D" : "Explore 3D"}
          </button>
        </div>
      )}

      {!isMobile ? (
        <div
          className="absolute pointer-events-none max-w-md z-10"
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
          <h2 className="text-black text-3xl sm:text-4xl font-bold mt-1 mb-2 leading-tight">
            {ad.headline}
          </h2>
          <p className="text-black/60 text-sm sm:text-base leading-relaxed">
            {ad.sub}
          </p>
        </div>
      ) : (
        <div
          className="absolute left-0 right-0 bottom-0 px-4 pb-5 pt-3 pointer-events-none z-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease, transform 0.7s ease"
          }}
        >
          <div
            className="rounded-2xl border border-white/10 bg-black/55 p-4"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)"
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#8fb4ff] text-[10px] tracking-[0.35em] uppercase font-semibold">
                {ad.label}
              </span>
              <span className="text-white/70 text-[11px]">
                {isInteractMode ? "Drag, zoom, and pan" : "Tap Explore 3D"}
              </span>
            </div>

            <h2 className="text-white text-xl font-bold mt-2 leading-snug">
              {ad.headline}
            </h2>
            <p className="text-white/85 text-sm mt-1 leading-relaxed">
              {ad.sub}
            </p>

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

      {!isMobile && (
        <div className="absolute bottom-14 right-10 flex gap-2 pointer-events-none z-10">
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
    </div>
  );
};

export default CaneViewer;
