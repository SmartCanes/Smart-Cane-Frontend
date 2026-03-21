import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useTranslation } from "react-i18next";
import icaneData from "../../assets/project.json";

const AD_TEXTS = [
  {
    key: "voiceGuidedNavigation",
    position: { bottom: "10%", left: "auto", right: "5%", top: "auto" }
  },
  {
    key: "alwaysConnected",
    position: { top: "10%", right: "auto", bottom: "auto", left: "5%" }
  },
  {
    key: "emergencyReady",
    position: { bottom: "10%", right: "5%", top: "auto", left: "auto" }
  },
  {
    key: "smartAssistiveTech",
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
  const { t } = useTranslation("guestPage");
  const containerRef = useRef(null);
  const mountRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const tiltGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const fitModelToViewRef = useRef(() => {});
  const isInViewportRef = useRef(false);

  const [adIndex, setAdIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isInteractMode, setIsInteractMode] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const localizedAds = useMemo(
    () =>
      AD_TEXTS.map((ad) => ({
        ...ad,
        label: t(`caneViewer.ads.${ad.key}.label`),
        headline: t(`caneViewer.ads.${ad.key}.headline`),
        sub: t(`caneViewer.ads.${ad.key}.sub`)
      })),
    [t]
  );

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.35
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    isInViewportRef.current = isInViewport;
  }, [isInViewport]);

  useEffect(() => {
    if (!isInViewport) {
      setVisible(true);
      return;
    }

    let timeoutId;

    const interval = setInterval(() => {
      setVisible(false);

      timeoutId = setTimeout(() => {
        setAdIndex((i) => (i + 1) % AD_TEXTS.length);
        setVisible(true);
      }, 700);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isInViewport]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    rendererRef.current = renderer;

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new THREE.ObjectLoader();
    const model = loader.parse(icaneData.scene);
    modelRef.current = model;

    const floor = model.getObjectByName("Box");
    if (floor) floor.removeFromParent();

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = -Math.PI / 5;
    tiltGroup.add(model);
    scene.add(tiltGroup);
    tiltGroupRef.current = tiltGroup;

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
    controlsRef.current = controls;

    const fitModelToView = () => {
      if (
        !mount ||
        !cameraRef.current ||
        !rendererRef.current ||
        !modelRef.current ||
        !tiltGroupRef.current ||
        !controlsRef.current
      ) {
        return;
      }

      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const model = modelRef.current;
      const tiltGroup = tiltGroupRef.current;
      const controls = controlsRef.current;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      tiltGroup.position.set(0, 0, 0);
      tiltGroup.rotation.z = -Math.PI / 5;

      const rawBox = new THREE.Box3().setFromObject(model);
      const rawCenter = rawBox.getCenter(new THREE.Vector3());
      const rawSize = rawBox.getSize(new THREE.Vector3());

      model.position.set(-rawCenter.x, -rawCenter.y, -rawCenter.z);

      const targetHeight = window.innerWidth <= 767 ? 4.8 : 5.8;
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
      const offset = window.innerWidth <= 767 ? 1.18 : 1.15;
      const initialDistance = fitDistance * offset;

      camera.position.set(0, 0, initialDistance);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);

      controls.minDistance = initialDistance * 0.65;
      controls.maxDistance = initialDistance * 1.8;
      controls.update();
    };

    fitModelToViewRef.current = fitModelToView;

    const handleResize = () => {
      fitModelToView();
    };

    window.addEventListener("resize", handleResize);

    fitModelToView();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (!isInViewportRef.current) return;

      if (!controlsRef.current?.enabled && modelRef.current) {
        modelRef.current.rotation.y += window.innerWidth <= 767 ? 0.004 : 0.006;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      window.removeEventListener("resize", handleResize);

      controls.dispose();

      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      renderer.dispose();
      renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    const controls = controlsRef.current;

    if (!renderer || !controls) return;

    renderer.domElement.style.touchAction = isInteractMode ? "none" : "pan-y";
    renderer.domElement.style.pointerEvents = isInteractMode ? "auto" : "none";
    controls.enabled = isInteractMode;
    controls.update();
  }, [isInteractMode]);

  useEffect(() => {
    fitModelToViewRef.current?.();
  }, [isMobile]);

  const handleResetView = () => {
    fitModelToViewRef.current?.();
  };

  const ad = localizedAds[adIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #5B8DEF 0%, #EAF2FF 55%, #FFFFFF 100%)"
      }}
    >
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{
          touchAction: isInteractMode ? "none" : "pan-y",
          pointerEvents: isInteractMode ? "auto" : "none"
        }}
      />

      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 z-10 max-w-[calc(100%-2rem)] sm:max-w-none">
        <img
          src="/icane.svg"
          alt={t("caneViewer.logoAlt")}
          className="h-6 w-auto shrink-0"
        />
        <span className="text-black/70 text-[9px] tracking-[0.22em] uppercase font-medium leading-none">
          {t("caneViewer.brandLine")}
        </span>
      </div>

      {isMobile ? (
        <div className="absolute top-14 left-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 text-[#111111] transition-all duration-300"
            style={{
              borderColor: "rgba(255,255,255,0.4)",
              boxShadow: "0 10px 24px rgba(91,141,239,0.16)"
            }}
            aria-label={t("caneViewer.controls.resetAria")}
            title={t("caneViewer.controls.resetTitle")}
          >
            <Icon icon="mdi:restore" className="text-[18px]" />
          </button>

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
            {isInteractMode
              ? t("caneViewer.controls.exit3d")
              : t("caneViewer.controls.explore3d")}
          </button>
        </div>
      ) : (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/90 text-[#111111] transition-all duration-300 cursor-pointer hover:bg-white"
            style={{
              borderColor: "rgba(255,255,255,0.4)",
              boxShadow: "0 10px 24px rgba(91,141,239,0.16)"
            }}
            aria-label={t("caneViewer.controls.resetAria")}
            title={t("caneViewer.controls.resetTitle")}
          >
            <Icon icon="mdi:restore" className="text-[20px]" />
          </button>

          <button
            type="button"
            onClick={() => setIsInteractMode((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] tracking-[0.14em] font-semibold uppercase transition-all duration-300 cursor-pointer"
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
            {isInteractMode
              ? t("caneViewer.controls.exit3d")
              : t("caneViewer.controls.explore3d")}
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
                {isInteractMode
                  ? t("caneViewer.mobile.dragHint")
                  : t("caneViewer.mobile.tapHint")}
              </span>
            </div>

            <h2 className="text-white text-xl font-bold mt-2 leading-snug">
              {ad.headline}
            </h2>
            <p className="text-white/85 text-sm mt-1 leading-relaxed">
              {ad.sub}
            </p>

            <div className="mt-3 flex justify-center gap-2">
              {localizedAds.map((_, i) => (
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
          {localizedAds.map((_, i) => (
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
