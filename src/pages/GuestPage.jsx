import { memo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import icaneLogo from "@/assets/images/smartcane-logo-blue.png";
import heroBackground from "@/assets/images/background.png";
import gpsCardArrow from "@/assets/images/gps-card-arrow.png";
import SwitchFilled from "@/assets/images/SwitchFilled.png";
import Document from "@/assets/images/document.png";
import icaneLogoWhite from "@/assets/images/icane-logo-white.png";
import icaneLabel from "@/assets/images/icane-label.png";
import facebookIcon from "@/assets/images/facebook-icon.png";
import instagramIcon from "@/assets/images/instagram-icon.png";
import callIcon from "@/assets/images/call-icon.png";
import emailIcon from "@/assets/images/email-icon.png";
import teamPhoto from "@/assets/images/team-photo.jpg";
import FAQItem from "@/ui/components/FAQItem";
import CaneViewer from "@/ui/components/CaneViewer";
import { motion, AnimatePresence } from "framer-motion";

import {
  FadeIn,
  HoverIcon,
  HoverNavEffect,
  ScaleIn,
  SlideInFromLeft,
  SlideInFromRight,
  SlideUp,
  TextFade,
  TextReveal
} from "@/wrapper/MotionWrapper";
import TeamSection from "@/ui/components/TeamSection";
import FeatureCarousel from "@/ui/components/FeatureCarousel";
import ConcernComposer from "@/ui/components/ConcernComposer";

const FEATURE_CARD_ACTIVE_CLASS = "opacity-100 scale-100 sm:scale-[1.02]";
const FEATURE_CARD_INACTIVE_CLASS = "opacity-40 sm:opacity-60 scale-[0.92]";

const rawFeatureCards = [
  {
    id: "Visual-Recognition",
    icon: "tdesign:visual-recognition-filled",
    title: "AI-Based Visual Recognition",
    description:
      "Through AI-powered visual recognition, the Smart Cane identifies objects and surroundings, giving users instant audio descriptions that enhance awareness and support safer decision-making during travel.",
    backgroundImageOpacity: 0.5,
    backgroundImagePosition: "center",
    backgroundImageSize: "130%",
    backgroundImageClassName: "translate-y-[18px] scale-105",
    backgroundColor: "#122550",
    backgroundIcon: "tdesign:visual-recognition-filled",
    backgroundIconProps: { width: 950, height: 950 },
    backgroundIconStyle: {
      color: "rgba(255,255,255,0.14)",
      transform: "rotate(33.82deg)"
    },
    backgroundIconContainerStyle: {
      overflow: "hidden"
    },
    iconWrapperRounded: false,
    iconWrapperShadow: false,
    iconWrapperClassName: "bg-transparent text-white",
    iconWrapperWidth: "auto",
    iconWrapperHeight: "auto",
    iconClassName: "text-[140px]",
    overlayGradient: true
  },

  {
    id: "route-navigation",
    icon: "tdesign:map-route-planning-filled",
    title: "Route Navigation",
    description:
      "The Smart Cane's route navigation feature provides guided directions through real-time voice prompts, helping users move confidently and safely toward their destination without relying solely on tactile cues.",
    backgroundColor: "#FDFCFA",
    textColor: "oklch(0.2914 0.0947 263.19)",
    descriptionColor: "#1C253C",
    iconWrapperClassName: "bg-transparent shadow-none text-[#1C253C]",
    iconWrapperWidth: "187.86px",
    iconWrapperHeight: "172.9px",
    iconClassName: "text-[160px]",
    backgroundIcon: "tdesign:map-route-planning-filled",
    backgroundIconProps: { width: 1100, height: 1300 },
    backgroundIconStyle: {
      color: "rgba(0, 0, 0, 0.04)",
      transform: "rotate(35.85deg) translateY(-95px)"
    },
    backgroundIconContainerStyle: {
      overflow: "hidden"
    },
    inactiveClassName: FEATURE_CARD_INACTIVE_CLASS,
    activeClassName: FEATURE_CARD_ACTIVE_CLASS,
    outlineColor: "#11285A26"
  },

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
    backgroundColor: "#FDFCFA",
    textColor: "#11285A",
    descriptionColor: "#1C253C",
    iconWrapperClassName: "bg-transparent shadow-none text-[#11285A]",
    iconWrapperWidth: "187.86px",
    iconWrapperHeight: "172.9px",
    iconClassName: "text-[160px]",
    backgroundIcon: "jam:triangle-danger",
    backgroundIconProps: { width: 1500, height: 1500 },
    backgroundIconStyle: {
      color: "rgba(0, 0, 0, 0.03)",
      transform: "rotate(33.82deg) translateY(-90px) translateX(20px)"
    },
    backgroundIconContainerStyle: {
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    inactiveClassName: FEATURE_CARD_INACTIVE_CLASS,
    activeClassName: FEATURE_CARD_ACTIVE_CLASS,
    outlineColor: "#11285A26"
  },

  {
    id: "iot-connectivity",
    icon: "mdi:toggle-switch",
    title: "IOT Connectivity",
    description:
      "iCane’s IoT integration links the device to a companion web application that provides connectivity, fall detection, emergency alerts, and user location for continuous monitoring.",
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
    overlayGradient: false,
    backgroundIcon: "bi:cloud-sun",
    backgroundIconProps: { width: 1200, height: 1200 },
    backgroundIconStyle: {
      color: "rgba(0, 0, 0, 0.03)",
      transform: "rotate(15deg) translateY(-50px) translateX(20px)"
    },
    backgroundIconContainerStyle: {
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
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

const featureCards = rawFeatureCards.filter((card, index, arr) => {
  // Prevent duplicated cards when the source data accidentally repeats an id
  return arr.findIndex((item) => item.id === card.id) === index;
});

const MemoFeatureCarousel = memo(FeatureCarousel);
const MemoCaneViewer = memo(CaneViewer);
const MemoTeamSection = memo(TeamSection);

const faqs = [
  {
    question: "What is SmartCane?",
    answer:
      "SmartCane (iCane) is an intelligent walking cane designed for visually impaired individuals. It combines IoT technology, AI-based object detection, and navigation tools to help users travel safely and independently. The cane can detect obstacles, provide route guidance, and send alerts to guardians during emergencies."
  },

  {
    question: "How do I create an account and log in?",
    answer:
      "To get started, visit www.smartcane.com and click “Sign Up”. Enter the required information such as your name, email, and password. After registering, you can log in using your email and password. Once logged in, you will be able to access your dashboard and manage your SmartCane features."
  },

  {
    question: "How do I use the SmartCane website?",
    answer: `After logging in, you can access several features such as:
      <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
        <li><strong>User Profile</strong> – update personal details</li>
        <li><strong>SmartCane Status</strong> – view devices, location, and alerts</li>
        <li><strong>Navigation Tools</strong> – set destinations and routes</li>
        <li><strong>Notifications</strong> – receive warnings or updates</li>
        <li><strong>Guardian & VIP Management</strong> – manage connected users</li>
      </ul>
      The interface is designed to be simple and easy to navigate for all users.`
  },

  {
    question: "How do guardians and VIP users work?",
    answer:
      "Guardians are trusted contacts who can monitor and assist visually impaired persons (VIPs). Through the website, you can add guardians or VIP users by entering their details. Once connected, guardians can receive alerts, monitor the SmartCane’s location, and assist when necessary."
  },

  {
    question: "What features does the SmartCane provide for safety?",
    answer:
      "The SmartCane provides several safety features such as obstacle detection, vibration or voice alerts, real-time GPS tracking, and emergency SOS notifications. When the cane detects obstacles or hazards, it notifies the user through vibration, sound, or voice feedback."
  },

  {
    question: "How do I charge and maintain the SmartCane?",
    answer:
      "The SmartCane can be charged using a USB charging cable connected to the cane’s charging port. A full charge usually takes about 2–3 hours and can last around 1-2 hours depending on usage. The cane is also water-resistant, meaning it can handle light rain but should not be submerged in water."
  }
];

const GuestPage = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false); // md breakpoint
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const ScrollLink = ({ targetId, children, className, onClick }) => {
    const handleClick = () => {
      onClick?.();

      setTimeout(() => {
        const el = document.getElementById(targetId);
        const header = document.querySelector("header");

        if (!el) return;

        const headerHeight = header ? header.offsetHeight : 0;
        const elementTop = el.getBoundingClientRect().top + window.scrollY;
        const scrollPosition = elementTop - headerHeight;

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth"
        });
      }, 250);
    };

    return (
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFCF9] text-[#1C253C] overflow-x-hidden">
      {/* Navigation */}
      <header
        id="header"
        className="w-full bg-white/95 md:backdrop-blur shadow-sm fixed top-0 z-20"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-4 relative">
          <div className="flex items-center">
            {/* LEFT: Logo (fixed width) */}
            <div className="flex items-center gap-3 w-[220px]">
              <ScrollLink
                targetId="home"
                className="inline-flex items-center  cursor-pointer"
              >
                {/* <BlinkingIcon
                  src={icaneLogo}
                  alt="iCane logo"
                  className="h-11 w-11"
                /> */}
                <img src={icaneLogo} alt="iCane logo" className="h-11 w-11" />
              </ScrollLink>
            </div>

            {/* CENTER: Desktop nav (true centered) */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-10 font-montserrat text-sm tracking-wide">
              <ScrollLink
                targetId="home"
                className="hover:text-[#11285A] transition-colors duration-200"
              >
                <HoverNavEffect>Home</HoverNavEffect>
              </ScrollLink>

              <ScrollLink
                targetId="iCane"
                className="hover:text-[#11285A] transition-colors duration-200"
              >
                <HoverNavEffect>iCane</HoverNavEffect>
              </ScrollLink>

              <ScrollLink
                targetId="about"
                className="hover:text-[#11285A] transition-colors duration-200 text-nowrap"
              >
                <HoverNavEffect>About Us</HoverNavEffect>
              </ScrollLink>
              <ScrollLink
                targetId="faq"
                className="hover:text-[#11285A] transition-colors duration-200 text-nowrap"
              >
                <HoverNavEffect>FAQs</HoverNavEffect>
              </ScrollLink>

              <ScrollLink
                targetId="contact"
                className="hover:text-[#11285A] transition-colors duration-200 text-nowrap"
              >
                <HoverNavEffect>Contact Us</HoverNavEffect>
              </ScrollLink>
            </nav>

            {/* RIGHT: Desktop CTA (fixed width) */}
            {/* <div className="hidden md:flex justify-end w-[220px]">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center rounded-[10px] bg-[#1C253C] px-10 py-3 text-base font-regular text-white transition-colors duration-200 hover:bg-[#0d1c3f] cursor-pointer"
              >
                Log In
              </button>
            </div> */}

            {/* MOBILE: burger */}
            <div className="md:hidden ml-auto flex items-center">
              <button
                type="button"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1C253C]
                     transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2"
              >
                <AnimatePresence initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ opacity: 0, rotate: -90, scale: 0.92 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.92 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute"
                    >
                      <Icon icon="mingcute:close-line" className="text-2xl" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ opacity: 0, rotate: 90, scale: 0.92 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.92 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute"
                    >
                      <Icon icon="mingcute:menu-line" className="text-2xl" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* MOBILE DROPDOWN (Framer Motion) */}
          <AnimatePresence initial={false}>
            {isMobileMenuOpen && (
              <motion.div
                id="mobile-menu"
                key="mobile-menu"
                initial={{ opacity: 0, y: -8, scaleY: 0.98 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="md:hidden absolute left-0 right-0 top-full border-t border-black/10 bg-white px-4 sm:px-6 py-3 shadow-lg origin-top"
              >
                <div className="flex flex-col gap-2 font-montserrat text-sm">
                  <ScrollLink
                    targetId="home"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-black/5 transition"
                  >
                    Home
                  </ScrollLink>

                  <ScrollLink
                    targetId="iCane"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-black/5 transition"
                  >
                    iCane
                  </ScrollLink>

                  <ScrollLink
                    targetId="about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-black/5 transition"
                  >
                    About Us
                  </ScrollLink>

                  <ScrollLink
                    targetId="faq"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-black/5 transition"
                  >
                    FAQs
                  </ScrollLink>

                  <ScrollLink
                    targetId="contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-black/5 transition"
                  >
                    Contact Us
                  </ScrollLink>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/login");
                      }}
                      className="w-full rounded-xl bg-[#1C253C] px-4 py-3 text-white font-medium hover:bg-[#0d1c3f] transition cursor-pointer"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          loading="eager"
          fetchPriority="high"
          decoding="async"
          src={heroBackground}
          alt="Group of people walking with canes"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
        <div className="relative mx-auto max-w-5xl px-4 text-center text-white space-y-6 sm:px-6 z-10">
          <TextFade delay={0.3} once={false}>
            <h1 className="font-poppins text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              The iCane That Sees Ahead.
            </h1>
          </TextFade>

          <TextReveal delay={0.6} once={false}>
            <h2 className="font-poppins text-xl font-medium md:text-2xl lg:text-3xl text-white/90">
              SmartCane: Redefining Mobility with AI-Powered Safety.
            </h2>
          </TextReveal>

          <TextFade
            delay={1}
            once={false}
            className="font-poppins text-[16px] md:text-lg lg:text-xl
            text-white/90 pr-2"
          >
            <p className="font-poppins text-[16px] md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto">
              iCane uses advanced sensor technology and AI to detect obstacles,
              analyze terrain, and guide you with real-time feedback. Gain
              confidence and independence with a device built for your journey.
            </p>
          </TextFade>

          {/* <ScaleIn delay={1.3} once={false}>
            <div className="mx-auto max-w-xs pt-4 sm:max-w-none">
              <Link
                to="/get-started"
                className="mx-auto w-full rounded-[10px] bg-white px-6 py-3 text-[#11285A] font-semibold shadow-[0_12px_25px_rgba(0,0,0,0.15)] hover:bg-[#F0F4FF] sm:w-[170px]"
              >
                Get Started
              </Link>
            </div>
          </ScaleIn> */}
        </div>
      </section>
      {/* Feature carousel */}
      <MemoFeatureCarousel
        cards={featureCards}
        autoScroll
        autoScrollMs={5000}
      />
      {/* Section divider for iCane */}
      <div className="relative mx-auto flex w-full items-center justify-center py-12 md:py-16">
        <div className="h-px w-full bg-[#bfcef0]" aria-hidden="true" />
        <h3 className="absolute bg-[#FDFCF9] px-12 text-[14px] font-semibold tracking-[0.5em] text-[#11285A] sm:px-20">
          iCane
        </h3>
      </div>

      {/* iCane 3d placeholder */}
      <div id="iCane" className="mx-auto w-full h-[85vh] bg-[#dfdfdf]">
        <MemoCaneViewer />
      </div>

      {/* Section divider for About */}
      <div
        id="about"
        className="relative mx-auto flex w-full items-center justify-center py-12 md:py-16"
      >
        <div className="h-px w-full bg-[#bfcef0]" aria-hidden="true" />
        <h3 className="absolute bg-[#FDFCF9] px-12 text-[14px] font-semibold tracking-[0.5em] text-[#11285A] sm:px-20">
          ABOUT US
        </h3>
      </div>
      {/* About placeholder */}
      <section
        aria-label="Placeholder for About Us section"
        className="px-4 sm:px-6"
      >
        <ScaleIn delay={0.2}>
          <div className="flex justify-center rounded-2xl bg-[#dfdfdf] overflow-hidden">
            <img
              loading="lazy"
              decoding="async"
              src={teamPhoto}
              alt="Team Photo"
              className="w-full h-full object-contain object-center rounded-2xl"
            />
          </div>
        </ScaleIn>
      </section>
      <SlideUp delay={0.4}>
        <p className="mx-auto mt-10 max-w-7xl px-4 text-center font-poppins text-xs leading-relaxed tracking-[0.12em] text-[#373F51] sm:px-6 sm:text-sm">
          At iCane, we believe technology should make life easier for everyone.
          Our smart cane is designed to help people with visual impairments move
          safely and confidently every day.
        </p>

        <p className="mx-auto mt-6 max-w-7xl px-4 text-center font-poppins text-xs leading-relaxed tracking-[0.12em] text-[#373F51] sm:px-6 sm:text-sm">
          The iCane uses smart sensors and simple feedback to guide users and
          prevent obstacles. It’s built to be reliable, easy to use, and
          supportive of greater independence.
        </p>

        <p className="mx-auto mt-6 max-w-7xl px-4 text-center font-poppins text-xs leading-relaxed tracking-[0.12em] text-[#373F51] sm:px-6 sm:text-sm pb-16">
          Our team is passionate about creating tools that truly make a
          difference. We listen to our users, learn from their experiences, and
          keep improving to make iCane even better.
        </p>
      </SlideUp>

      <MemoTeamSection />

      <div
        id="faq"
        className="relative mx-auto flex w-full items-center justify-center py-12 md:py-16"
      >
        <div className="h-px  w-full bg-[#bfcef0]" aria-hidden="true" />

        <h3 className="absolute bg-[#FDFCF9] px-12 sm:px-20 text-[14px] font-semibold tracking-[0.5em] text-[#11285A]">
          FAQ
        </h3>
      </div>

      <FadeIn delay={0.2}>
        <p className="mx-auto px-4 max-w-7xl text-center font-poppins text-[12px] md:text-sm leading-relaxed tracking-[0.12em] text-card-100 font-bold">
          Frequently Asked Question
        </p>
      </FadeIn>

      <div className="mx-auto mt-8 w-full max-w-7xl px-4 text-center sm:px-6 md:px-8">
        <SlideInFromRight delay={0.4} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 text-left">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === index}
                onToggle={() =>
                  setOpenFaqIndex((prev) => (prev === index ? null : index))
                }
              />
            ))}
          </div>
        </SlideInFromRight>
      </div>

      {/* start of contact us section van */}
      <div
        id="contact"
        className="relative mx-auto flex w-full items-center justify-center py-12 md:py-12"
      >
        <div className="h-px w-full bg-[#bfcef0]" aria-hidden="true" />
        <h3 className="absolute bg-[#FDFCF9] px-12 sm:px-20 text-[14px] font-semibold tracking-[0.5em] text-[#11285A]">
          CONTACT US
        </h3>
      </div>

      <FadeIn delay={0.2}>
        <p className="mx-auto mt-1 px-4 max-w-7xl text-center text-[12px] md:text-sm leading-relaxed tracking-[0.12em] text-[#373F51] font-poppins">
          <strong className="text-card-100">Welcome to iCane</strong> — we’re
          here to help.
        </p>
      </FadeIn>

      <FadeIn delay={0.4}>
        <p className="mx-auto max-w-7xl px-4 pb-8 text-center font-poppins text-[12px] leading-relaxed tracking-[0.12em] text-[#373F51] md:text-sm">
          Whether you have questions, need support, or want to share your
          experience, our team is ready to assist. Your feedback helps us
          improve and deliver technology that enhances mobility, safety, and
          independence.
        </p>
      </FadeIn>

      {/* Reusable concern composer (guest inline mode) */}
      {/* <SlideUp delay={0.6} className="mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ConcernComposer
            mode="inline"
            sourceKey="guest-landing"
            title="Send us a message"
            subtitle="Tell us what you need and our team will get back to you quickly."
          />
        </div>
      </SlideUp> */}

      <div className="mx-auto mt-12 max-w-7xl px-4 text-center text-[12px] sm:px-6 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-y-10 text-center text-[12px] sm:grid-cols-2 sm:items-stretch sm:gap-x-12 sm:text-left">
          {/* LEFT - Call */}
          <div>
            <SlideInFromLeft
              delay={0.8}
              className="flex h-full flex-col items-center sm:items-start sm:justify-between"
            >
              <div className="flex flex-col items-center gap-3 sm:items-start">
                <h3 className="text-lg font-semibold text-card-100">Call Us</h3>
                <p className="max-w-md text-sm">
                  We’re just a call away for any questions or support you need.
                </p>
              </div>
              <div className="mx-auto mt-4 flex w-[230px] items-center justify-start gap-3 sm:mx-0 sm:w-auto">
                <a
                  href="tel:09696273011"
                  className="flex h-10 w-10 items-center justify-center"
                >
                  <HoverIcon src={callIcon} alt="Call" size={40} />
                </a>
                <p className="leading-none text-sm">+63-969-627-3011</p>
              </div>
            </SlideInFromLeft>
          </div>

          {/* RIGHT - Email*/}
          <div>
            <SlideInFromRight
              delay={0.8}
              className="flex h-full flex-col items-center sm:items-start sm:justify-between"
            >
              <div className="flex flex-col items-center gap-3 sm:items-start">
                <h3 className="text-lg font-semibold text-card-100">
                  Email Us
                </h3>
                <p className="max-w-md text-sm">
                  Send us an email and we’ll get back to you as soon as
                  possible.
                </p>
              </div>
              <div className="mx-auto mt-4 flex w-[230px] items-center justify-start gap-3 sm:mx-0 sm:w-auto">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=iCane@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center"
                >
                  <HoverIcon src={emailIcon} alt="Email" size={40} />
                </a>
                <p className="leading-none text-sm">iCane@gmail.com</p>
              </div>
            </SlideInFromRight>
          </div>
        </div>
      </div>
      {/* end of contact section van*/}

      {/* Footer */}
      <footer className="mt-8 bg-[#11285A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-12">
          <div className=" border-white/15 pt-10 grid gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 ">
                {/* <BlinkIcon src={icaneLogoWhite} alt="iCane emblem" size={12} /> */}
                <img src={icaneLogoWhite} alt="iCane emblem" size={12} />
                <img
                  loading="lazy"
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
                <ScrollLink
                  targetId="home"
                  className="hover:text-white transition-colors duration-200 block cursor-pointer"
                >
                  <HoverNavEffect direction="right">Home</HoverNavEffect>
                </ScrollLink>
                <ScrollLink
                  targetId="features"
                  className="hover:text-white transition-colors duration-200 block cursor-pointer"
                >
                  <HoverNavEffect direction="right">iCane</HoverNavEffect>
                </ScrollLink>
                <ScrollLink
                  targetId="about"
                  className="hover:text-white transition-colors duration-200 block cursor-pointer"
                >
                  <HoverNavEffect direction="right">About Us</HoverNavEffect>
                </ScrollLink>
                <ScrollLink
                  targetId="faq"
                  className="hover:text-white transition-colors duration-200 block cursor-pointer"
                >
                  <HoverNavEffect direction="right">FAQs</HoverNavEffect>
                </ScrollLink>
                <ScrollLink
                  targetId="contact"
                  className="hover:text-white transition-colors duration-200 block cursor-pointer"
                >
                  <HoverNavEffect direction="right">Contact Us</HoverNavEffect>
                </ScrollLink>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-montserrat text-sm font-semibold tracking-[0.2em] text-white/80">
                Contact Info
              </h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>09696273011</li>
                <li>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=iCane@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-200"
                  >
                    iCane@gmail.com
                  </a>
                </li>
                <li>Quezon City University</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-montserrat text-sm font-semibold tracking-[0.2em] text-white/80">
                Social Media
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61583597618139&rdid=FklUw1PMZ8WdboYJ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1WUW3U1mRm%2F#"
                  aria-label="Visit the iCane Facebook page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <HoverIcon
                    src={facebookIcon}
                    alt="Facebook icon"
                    hoverRotate={-10}
                  />
                </a>
                {/* <a
                  href="!"
                  aria-label="Visit the iCane Twitter page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <HoverIcon
                    src={twitterIcon}
                    alt="Twitter icon"
                    hoverRotate={0}
                  />
                </a> */}
                <a
                  href="https://www.instagram.com/icane2026/?fbclid=IwY2xjawQs9ClleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEe0xIuhJdggoHbkaqJJx_C0EVzoQ9ynYHYH_orCG56DphgCPIrGTau2z6bjX8_aem_k_ng0MyQaG6nbDLTpbUg8Q"
                  aria-label="Visit the iCane Instagram page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <HoverIcon
                    src={instagramIcon}
                    alt="Instagram icon"
                    hoverRotate={10}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className=" w-full h-[0.5px] bg-[#dfdfdf]" />

        <div className="pt-6 text-center text-xs tracking-[0.3em] pb-6 text-white/60">
          © 2026 iCane · All Rights Reserved
        </div>
      </footer>

      <button
        type="button"
        aria-label="Back to top"
        onClick={() => {
          const el = document.getElementById("home");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className={[
          "fixed bottom-6 right-6 z-50",
          "h-12 w-12 rounded-full",
          "bg-[#11285A] text-white shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-105 hover:bg-[#0d1c3f]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2 cursor-pointer",
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-3"
        ].join(" ")}
      >
        <Icon icon="mingcute:arrow-up-line" className="text-2xl " />
      </button>
    </div>
  );
};

export default GuestPage;
