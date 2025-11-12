import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import icaneLogo from "@/assets/images/smartcane-logo-blue.png";
import heroBackground from "@/assets/images/background.png";
import gpsCardArrow from "@/assets/images/gps-card-arrow.png";
import dangerTriangle from "@/assets/images/danger-triangle.svg";
import SwitchFilled from "@/assets/images/SwitchFilled.png";
import Cloud from "@/assets/images/Cloud.png";
import Document from "@/assets/images/document.png";
import icaneLogoWhite from "@/assets/images/icane-logo-white.png";
import icaneLabel from "@/assets/images/icane-label.png";
import facebookIcon from "@/assets/images/facebook-icon.png";
import twitterIcon from "@/assets/images/twitter-icon.png";
import instagramIcon from "@/assets/images/instagram-icon.png";
import FeatureCard from "@/ui/components/FeatureCard";

const FEATURE_CARD_ACTIVE_CLASS =
  "opacity-100 scale-100 sm:scale-[1.02] shadow-[0_40px_80px_rgba(9,20,46,0.45)]";
const FEATURE_CARD_INACTIVE_CLASS = "opacity-40 sm:opacity-60 scale-[0.92]";

const featureCards = [
  {
    id: "gps",
    icon: "solar:map-arrow-up-bold",
    title: "GPS",
    description:
      "With real-time GPS tracking, guardians can easily monitor the user’s location through the connected web app, ensuring safety and peace of mind wherever they go.",
    backgroundImage: gpsCardArrow,
    backgroundImageOpacity: 1,
    backgroundImagePosition: "center",
    backgroundImageSize: "130%",
    backgroundImageClassName: "translate-y-[18px] scale-105",
    backgroundColor: "#122550"
  },

  {
    id: "emergency-sos",
    icon: "jam:triangle-danger-f",
    title: "SOS",
    description:
      "During emergencies, iCane automatically sends an SOS alert with the user's exact location to registered guardians, enabling quick response and immediate assistance.",
    backgroundImage: dangerTriangle,

    // --- ITO ANG MGA TAMANG SETTINGS ---

    // 1. Naka-set sa 0.12 para "faint" lang at kita ang text
    backgroundImageOpacity: 0.12,

    backgroundImagePosition: "center",
    backgroundImageSize: "794.2px 719.75px",

    // 2. TINANGGAL LAHAT maliban sa 'transform'
    backgroundImageStyle: {
      transform: "rotate(-33.82deg)"
    },

    // 3. Ibinalik sa puti, tulad ng design
    backgroundColor: "#FDFCFA",

    // --- WAKAS NG MGA PAGBABAGO ---

    textColor: "#11285A",
    descriptionColor: "#1C253C",
    iconWrapperClassName: "bg-transparent shadow-none text-[#11285A]",
    iconWrapperWidth: "187.86px",
    iconWrapperHeight: "172.9px",
    iconClassName: "text-[160px]",
    inactiveClassName: FEATURE_CARD_INACTIVE_CLASS,
    activeClassName: FEATURE_CARD_ACTIVE_CLASS,
    outlineColor: "#11285A26"
    // TANDAAN: Tinanggal ko ang 'overlayGradient: false'
  },

  {
    id: "iot-connectivity",
    icon: "mdi:toggle-switch",
    title: "IOT Connectivity",
    description:
      "iCane's IoT integration links the device to a companion web application that provides live updates on battery level, connectivity, and user location for continuous monitoring.",
    backgroundImage: SwitchFilled,
    backgroundImageOpacity: 0.12,
    backgroundImagePosition: "center bottom",
    backgroundImageSize: "700px",
    backgroundImageStyle: {
      transform: "rotate(-35deg) translateY(300px)"
    },
    backgroundColor: "#122550",
    iconWrapperClassName:
      "bg-transparent shadow-none text-white overflow-visible",
    iconWrapperWidth: "187.86px",
    iconWrapperHeight: "172.9px",
    iconClassName: "text-[160px]",
    inactiveClassName: FEATURE_CARD_INACTIVE_CLASS,
    activeClassName: FEATURE_CARD_ACTIVE_CLASS,
    overlayGradient: false
  },

  {
    id: "weather",
    icon: "f7:cloud-sun-fill",
    title: "Weather Notifications",
    description:
      "Stay one step ahead of the weather. iCane delivers instant weather alerts to help users prepare for outdoor conditions and ensure safer navigation.",
    backgroundImage: Cloud,
    backgroundImageOpacity: 0.3,
    backgroundImagePosition: "top left",
    backgroundImageSize: "500px",
    backgroundImageStyle: {
      transform: "rotate(-15deg) translateY(-80px) translateX(-100px)"
    },
    backgroundColor: "#FFFFFF",
    textColor: "#11285A",
    descriptionColor: "#1C253C",
    iconWrapperClassName:
      "bg-transparent shadow-none text-[#11285A] overflow-visible",
    iconWrapperWidth: "187.86px",
    iconWrapperHeight: "172.9px",
    iconClassName: "text-[160px]",
    inactiveClassName: FEATURE_CARD_INACTIVE_CLASS,
    activeClassName: FEATURE_CARD_ACTIVE_CLASS,
    overlayGradient: false
  },

  {
    id: "document",
    icon: "ion:document-text",
    title: "Shared Notes & Reminders",
    description:
      "Through the shared notes feature, guardians can send text messages that iCane reads aloud via its AI assistant — keeping users informed, reminded, and connected anytime.",
    backgroundImage: Document,
    backgroundImageOpacity: 0.5,
    backgroundImagePosition: "top",
    backgroundImageSize: "500px",
    backgroundImageStyle: {
      transform: "rotate(33.82deg) translateY(5px) translateX(99px)"
    },
    backgroundColor: "#122550",
    textColor: "#FFFFFF",
    descriptionColor: "rgba(255,255,255,0.85)",
    iconWrapperClassName:
      "bg-transparent shadow-none text-white overflow-visible",
    iconWrapperWidth: "187.86px",
    iconWrapperHeight: "172.9px",
    iconClassName: "text-[160px]",
    inactiveClassName: FEATURE_CARD_INACTIVE_CLASS,
    activeClassName: FEATURE_CARD_ACTIVE_CLASS,
    overlayGradient: false
  }
];

const GuestPage = () => {
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const navigate = useNavigate();
  const autoScrollEnabled = true;
  const isProgrammaticScrollRef = useRef(false);

  const updateActiveCard = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;

    const container = carouselRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    if (scrollLeft < 10) {
      setActiveCardIndex(0);
      return;
    }

    if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth) {
      setActiveCardIndex(featureCards.length - 1);
      return;
    }

    const { left, width } = container.getBoundingClientRect();
    const containerCenter = left + width / 2;

    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveCardIndex(closestIndex);
  }, [featureCards.length]);

  useEffect(() => {
    updateActiveCard();
    window.addEventListener("resize", updateActiveCard);
    return () => window.removeEventListener("resize", updateActiveCard);
  }, [updateActiveCard]);

  const scrollToCard = useCallback(
    (index) => {
      const container = carouselRef.current;
      if (!container) return;

      isProgrammaticScrollRef.current = true;

      const clampedIndex = Math.max(
        0,
        Math.min(index, featureCards.length - 1)
      );
      const targetCard = cardRefs.current[clampedIndex];
      if (!targetCard) {
        isProgrammaticScrollRef.current = false;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const cardRect = targetCard.getBoundingClientRect();

      const scrollLeft = container.scrollLeft;
      const cardOffset = cardRect.left - containerRect.left;
      const centerOffset = (containerRect.width - cardRect.width) / 2;

      const targetScrollPosition = scrollLeft + cardOffset - centerOffset;

      container.scrollTo({
        left: targetScrollPosition,
        behavior: "smooth"
      });

      setTimeout(() => {
        setActiveCardIndex(clampedIndex);

        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 100);
      }, 400);
    },
    [featureCards.length]
  );

  const handleCarouselScroll = (direction) => {
    let targetIndex = activeCardIndex + direction;

    if (targetIndex < 0) {
      targetIndex = featureCards.length - 1;
    } else if (targetIndex >= featureCards.length) {
      targetIndex = 0;
    }

    scrollToCard(targetIndex);
  };

  cardRefs.current = cardRefs.current.slice(0, featureCards.length);

  useEffect(() => {
    if (!autoScrollEnabled) return undefined;

    const intervalId = setInterval(() => {
      scrollToCard(
        activeCardIndex === featureCards.length - 1 ? 0 : activeCardIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [autoScrollEnabled, activeCardIndex, scrollToCard]);

  const isFirstCardActive = activeCardIndex === 0;
  const isLastCardActive = activeCardIndex === featureCards.length - 1;

  return (
    <div className="min-h-screen w-full bg-[#FDFCF9] text-[#1C253C] font-poppins">
      {/* Navigation */}
      <header className="w-full bg-white/95 backdrop-blur shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <img
              src={icaneLogo}
              alt="iCane logo"
              className="h-11 w-11 object-contain"
            />
          </div>

          <nav className="hidden md:flex items-center gap-10 font-montserrat text-sm  tracking-wide">
            <a
              href="#home"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              iCane
            </a>
            <a
              href="#about"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="#contact"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              Contact Us
            </a>
          </nav>

          <button
            onClick={() => navigate("/welcome")}
            className="flex items-center justify-center rounded-[10px] bg-[#1C253C] px-10 py-3 text-base font-regular text-white transition-colors duration-200 hover:bg-[#0d1c3f] sm:px-10 sm:py-3.5"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative w-full overflow-hidden min-h-[calc(100vh-72px)] flex items-center justify-center py-16 sm:py-20 md:py-24"
      >
        {" "}
        {/* Hero section //Background Image */}
        <img
          src={heroBackground}
          alt="Group of people walking with canes"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
        <div className="relative mx-auto max-w-5xl px-4 text-center text-white space-y-6 sm:px-6 z-10">
          <h1 className="font-poppins text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight">
            The Smart Cane That Sees Ahead.
          </h1>
          <h2 className="font-poppins text-xl font-medium md:text-2xl lg:text-3xl text-white/90">
            iCane: Redefining Mobility with AI-Powered Safety.
          </h2>
          <p className="font-poppins text-[16px] md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto">
            iCane uses advanced sensor technology and AI to detect obstacles,
            analyze terrain, and guide you with real-time feedback. Gain
            confidence and independence with a device built for your journey.
          </p>
          <div className="mx-auto max-w-xs pt-4 sm:max-w-none">
            <button className="mx-auto w-full rounded-[10px] bg-white px-6 py-3 text-[#11285A] font-semibold shadow-[0_12px_25px_rgba(0,0,0,0.15)] transition-colors duration-200 hover:bg-[#F0F4FF] sm:w-[170px]">
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Feature carousel */}
      <section
        id="features"
        aria-label="iCane feature carousel"
        className="px-4 sm:px-6"
      >
        <div className="relative mt-12">
          <button
            type="button"
            onClick={() => handleCarouselScroll(-1)}
            className="group absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center text-black transition-all duration-200 hover:text-gray-600 md:flex z-10"
            aria-label="Show previous feature"
          >
            <Icon
              icon="mingcute:left-line"
              className="text-5xl transition-transform duration-200 group-hover:-translate-x-0.5"
            />
          </button>

          <div
            ref={carouselRef}
            onScroll={updateActiveCard}
            className="flex snap-x snap-proximity gap-6 overflow-x-auto pb-6 pt-4 scroll-smooth sm:gap-8 lg:gap-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              scrollPaddingLeft: "min(10%, 72px)",
              scrollPaddingRight: "min(10%, 72px)"
            }}
          >
            {featureCards.map((card, index) => (
              <FeatureCard
                key={card.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                icon={card.icon}
                title={card.title}
                description={card.description}
                mainImage={card.mainImage}
                mainImageAlt={card.mainImageAlt}
                backgroundColor={card.backgroundColor}
                textColor={card.textColor}
                descriptionColor={card.descriptionColor}
                backgroundImage={card.backgroundImage}
                backgroundImageOpacity={card.backgroundImageOpacity}
                backgroundImagePosition={card.backgroundImagePosition}
                backgroundImageSize={card.backgroundImageSize}
                backgroundImageClassName={card.backgroundImageClassName}
                backgroundImageStyle={card.backgroundImageStyle}
                overlayGradient={card.overlayGradient ?? true}
                iconWrapperClassName={card.iconWrapperClassName}
                iconWrapperWidth={card.iconWrapperWidth}
                iconWrapperHeight={card.iconWrapperHeight}
                iconClassName={card.iconClassName}
                badge={card.badge}
                badgeClassName={card.badgeClassName}
                footer={card.footer}
                footerClassName={card.footerClassName}
                isActive={activeCardIndex === index}
                className={`w-[90vw] sm:w-80 md:w-96 flex-shrink-0 snap-center transition-all duration-300 ease-out ${card.className ?? ""}`}
                activeClassName={
                  card.activeClassName ?? FEATURE_CARD_ACTIVE_CLASS
                }
                inactiveClassName={
                  card.inactiveClassName ?? FEATURE_CARD_INACTIVE_CLASS
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleCarouselScroll(1)}
            className="group absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center text-black transition-all duration-200 hover:text-gray-600 md:flex z-10"
            aria-label="Show next feature"
          >
            <Icon
              icon="mingcute:right-line"
              className="text-5xl transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2 sm:gap-3">
          {featureCards.map((card, index) => (
            <button
              key={`${card.id}-indicator`}
              type="button"
              onClick={() => scrollToCard(index)}
              className={`h-2.5 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2 ${
                activeCardIndex === index
                  ? "w-8 bg-[#11285A]"
                  : "w-2.5 bg-[#d7dde9]"
              }`}
              aria-label={`Show ${card.title} feature`}
              aria-pressed={activeCardIndex === index}
            />
          ))}
        </div>
      </section>

      {/* Section divider for iCane */}

      <div className="relative mx-auto flex w-full items-center justify-center py-12 md:py-16">
        <div className="h-px w-full bg-[#bfcef0]" aria-hidden="true" />
        <h3 className="absolute bg-[#FDFCF9] px-12 text-[10px] font-semibold tracking-[0.5em] text-[#11285A] sm:px-20">
          iCane
        </h3>
      </div>

      {/* iCane placeholder */}

      <div className="mx-auto flex w-full  h-[500px] bg-[#dfdfdf] px-4 py-10 sm:min-h-[200px] sm:px-8 md:min-h-[240px] md:px-12"></div>

      {/* Section divider for About */}

      <div className="relative mx-auto flex w-full items-center justify-center py-12 md:py-16">
        <div className="h-px w-full bg-[#bfcef0]" aria-hidden="true" />
        <h3 className="absolute bg-[#FDFCF9] px-12 text-[10px] font-semibold tracking-[0.5em] text-[#11285A] sm:px-20">
          ABOUT US
        </h3>
      </div>

      {/* About placeholder */}
      <section
        aria-label="Placeholder for About Us section"
        className="px-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-5xl min-h-[160px] rounded-2xl bg-[#dfdfdf] px-4 py-10 sm:min-h-[200px] sm:px-8 md:min-h-[240px]" />
      </section>

      <p className="mx-auto mt-10 max-w-4xl px-4 text-center font-montserrat text-xs leading-relaxed tracking-[0.12em] text-[#373F51] sm:px-6 sm:text-sm">
        “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.”
      </p>

      <div className="relative flex items-center justify-center py-16">
        <div className="h-px w-full bg-[#bfcef0]" aria-hidden="true" />
        <h3 className="absolute bg-[#FDFCF9] px-20 text-[10px] font-semibold tracking-[0.5em] text-[#11285A]">
          CONTACT US
        </h3>
      </div>

      <p className="mx-auto mt-20 max-w-4xl text-center font-montserrat text-[12px] md:text-sm leading-relaxed tracking-[0.12em] text-[#373F51] pb-16">
        “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.”
      </p>

      {/* Footer */}
      <footer className="bg-[#11285A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-12">
          <div className=" border-white/15 pt-10 grid gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={icaneLogoWhite}
                  alt="iCane emblem"
                  className="h-12 w-12 object-contain"
                />
                <img
                  src={icaneLabel}
                  alt="iCane wordmark"
                  className="h-6 object-contain"
                />
              </div>
              <p className="text-sm leading-relaxed text-white/70">
                A smart mobility cane empowering the visually impaired with
                safety, guidance, and connectivity.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-montserrat text-sm font-semibold tracking-[0.2em] text-white/80">
                Category
              </h4>
              <nav className="space-y-3 text-sm text-white/70">
                <a
                  href="#home"
                  className="block hover:text-white transition-colors duration-200"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="block hover:text-white transition-colors duration-200"
                >
                  iCane
                </a>
                <a
                  href="#about"
                  className="block hover:text-white transition-colors duration-200"
                >
                  About Us
                </a>
                <a
                  href="#contact"
                  className="block hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-montserrat text-sm font-semibold tracking-[0.2em] text-white/80">
                Contact Info
              </h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>09XXXXXXXXX</li>
                <li>iCane@gmail.com</li>
                <li>Quezon City University</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-montserrat text-sm font-semibold tracking-[0.2em] text-white/80">
                Social Media
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#!"
                  aria-label="Visit the iCane Facebook page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <img
                    src={facebookIcon}
                    alt="Facebook icon"
                    className="h-10 w-10 object-contain"
                  />
                </a>
                <a
                  href="#!"
                  aria-label="Visit the iCane Twitter page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <img
                    src={twitterIcon}
                    alt="Twitter icon"
                    className="h-10 w-10 object-contain"
                  />
                </a>
                <a
                  href="#!"
                  aria-label="Visit the iCane Instagram page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <img
                    src={instagramIcon}
                    alt="Instagram icon"
                    className="h-10 w-10 object-contain"
                  />
                </a>
              </div>
              <a
                href="#faq"
                className="block text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                FAQ
              </a>
            </div>
          </div>
        </div>

        <div className=" w-full h-[0.5px] bg-[#dfdfdf]" />

        <div className="pt-6 text-center text-xs tracking-[0.3em] pb-6 text-white/60">
          © 2025 iCane · All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default GuestPage;
