import { useRef, useState, useCallback, useEffect } from "react";
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
import twitterIcon from "@/assets/images/twitter-icon.png";
import instagramIcon from "@/assets/images/instagram-icon.png";
import callIcon from "@/assets/images/call-icon.png";
import emailIcon from "@/assets/images/email-icon.png";
import teamPhoto from "@/assets/images/team-photo.png";
import FeatureCard from "@/ui/components/FeatureCard";
import FAQItem from "@/ui/components/FAQItem";
import {
  BlinkIcon,
  BlinkingIcon,
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
      "iCane’s IoT integration links the device to a companion web application that provides live updates on battery level, connectivity, and user location for continuous monitoring.",
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

const faqs = [
  {
    question: "What is a SmartCane?",
    answer:
      "The SmartCane (iCane) is an advanced walking cane designed for visually impaired individuals. It uses IoT technology, AI-based visual recognition, and route navigation to help users travel safely and independently. The cane can detect obstacles, identify objects, guide the user to destinations, and send alerts to guardians in case of emergencies."
  },
  {
    question: "How to sign up?",
    answer:
      "To create an account, go to www.smartcane.com. Click “Sign Up” and fill out the required information such as your name, email, and password. After submitting, verify your email if required. Once done, you can now log in and start using the SmartCane services. The process is simple and designed to guide beginners step-by-step."
  },
  {
    question: "How to log in?",
    answer:
      "Visit www.smartcane.com and click “Log In”. Enter your registered email and password. After logging in successfully, you will be taken to your dashboard, where you can access your SmartCane data, settings, and connected devices."
  },
  {
    question: "How to use the SmartCane Website?",
    answer: `Once logged in, the website dashboard will show key features such as:
      <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
        <li><strong>User Profile</strong> – update your information</li>
        <li><strong>SmartCane Status</strong> – check battery, location, and alerts</li>
        <li><strong>Navigation Tools</strong> – set destinations or routes</li>
        <li><strong>Notifications</strong> – view recent alerts, warnings, or updates</li>
        <li><strong>Guardian & VIP Management</strong> – add or manage users</li>
      </ul>
      All menus are labeled clearly so users can easily explore each feature.`
  },

  {
    question: "How to use the SmartCane Application?",
    answer: `Download and open the iCane mobile app.
 Sign in using your account. The app allows you to:
      <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
        <li>Track the real-time location of the SmartCane</li>
        <li>Receive emergency alerts</li>
        <li>View obstacle and route updates</li>
        <li>Manage guardians or VIP users</li>
        <li>Adjust cane settings (volume, sensitivity, alerts)</li>
      </ul>
      The app is designed with a simple layout to help both new and experienced users.`
  },

  {
    question: "How to add a guardian?",
    answer: `On the website or app, go to “Guardian Management”.
 Click “Add Guardian”, then enter the guardian’s name, phone number, and email address.
 Once added, the guardian will receive notifications and alerts whenever the visually impaired person needs assistance.`
  },

  {
    question: "How to add a VIP (Visually Impaired Person)?",
    answer: `Go to “VIP Management” on the website or mobile app.
 Click “Add VIP” and input their details such as name, age, contact information, and SmartCane ID.
 After saving, the VIP will be linked to your account, allowing you to monitor their cane’s status and receive alerts.`
  },

  {
    question: "How do I charge the SmartCane?",
    answer: `The SmartCane comes with a USB charging cable. Simply connect the cable to the charging port on the cane and plug it into a power source. The LED indicator will show the charging status. A full charge usually takes 2–3 hours.`
  },

  {
    question: "How long does the battery last?",
    answer: `Under normal use, the SmartCane's battery lasts 8–12 hours. Battery life may vary depending on how often obstacle detection, GPS, and AI recognition features are used.`
  },

  {
    question: "What happens if the SmartCane detects an obstacle?",
    answer: `When an obstacle is detected, the cane provides vibration feedback, beeping sounds, or voice alerts depending on your settings. This helps the user avoid hazards like walls, steps, or objects in their path.`
  },

  {
    question: "What if I forget my password?",
    answer: `Go to the login page on www.smartcane.com and click “Forgot Password”.
 Enter your email address and follow the instructions to reset your password.`
  },

  {
    question: "How does the emergency alert (SOS) work?",
    answer: `The SmartCane has a built-in emergency trigger. When activated, it sends an alert to registered guardians, showing the VIP’s exact location. The guardian will receive the alert through the iCane mobile app.`
  },

  {
    question: "Can multiple guardians be added for one VIP?",
    answer: `Yes. You can add multiple guardians in the Guardian Management section. Each guardian will receive notifications and emergency alerts.`
  },

  {
    question: "Can I track the location of the SmartCane?",
    answer: `Yes. The SmartCane’s real-time GPS location can be viewed using the mobile app or the website dashboard. This helps guardians ensure the safety of the VIP at all times.`
  },

  {
    question: "Does the SmartCane work without an internet connection?",
    answer: `Basic features like vibration and obstacle detection will still work.
 However, advanced features, such as AI recognition, route navigation, and GPS tracking, require an internet connection.`
  },

  {
    question: "How do I update the SmartCane firmware?",
    answer: `Firmware updates will be shown on the mobile app. Simply click “Update Now” when a new version is available to keep the SmartCane running smoothly.`
  },

  {
    question: "Is the SmartCane water-resistant?",
    answer: `The SmartCane is designed to be water-resistant, meaning it can handle light rain or splashes. However, avoid submerging it in water.`
  },

  {
    question: "Who should use the SmartCane?",
    answer: `The SmartCane is ideal for visually impaired individuals(VIPs), seniors who need assistance walking, or anyone who wants enhanced mobility and safety features.`
  },

  {
    question: "Can I customize the alerts and settings?",
    answer: `Yes. The iCane app allows you to adjust:
      <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
        <li>Vibration strength</li>
        <li>Voice volume</li>
        <li>Emergency contact list</li>
      </ul>`
  }
];

const GuestPage = () => {
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const navigate = useNavigate();
  const autoScrollEnabled = true;
  const isProgrammaticScrollRef = useRef(false);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);

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
    if (!autoScrollEnabled || !isCarouselVisible) return;

    const intervalId = setInterval(() => {
      scrollToCard(
        activeCardIndex === featureCards.length - 1 ? 0 : activeCardIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [autoScrollEnabled, activeCardIndex, scrollToCard, isCarouselVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCarouselVisible(entry.isIntersecting);
      },
      { threshold: 0.3 } // triggers when 30% visible
    );

    if (carouselRef.current) observer.observe(carouselRef.current);

    return () => {
      if (carouselRef.current) observer.unobserve(carouselRef.current);
    };
  }, []);

  const isFirstCardActive = activeCardIndex === 0;
  const isLastCardActive = activeCardIndex === featureCards.length - 1;

  const ScrollLink = ({ targetId, children, className }) => {
    const handleClick = () => {
      const el = document.getElementById(targetId);
      const header = document.querySelector("header"); // get sticky header
      if (el) {
        const headerHeight = header ? header.offsetHeight : 0;
        const elementTop = el.getBoundingClientRect().top + window.scrollY;
        const scrollPosition = elementTop - headerHeight;
        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      }
    };

    return (
      <button onClick={handleClick} className={className}>
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFCF9] text-[#1C253C] overflow-x-hidden">
      {/* Navigation */}
      <header className="w-full bg-white/95 backdrop-blur shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <ScrollLink targetId="home">
              <BlinkingIcon
                src={icaneLogo}
                alt="iCane logo"
                className="h-11 w-11"
              />
            </ScrollLink>
          </div>

          <nav className="hidden md:flex items-center gap-10 font-montserrat text-sm tracking-wide">
            <ScrollLink
              targetId="home"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              <HoverNavEffect>Home</HoverNavEffect>
            </ScrollLink>
            <ScrollLink
              targetId="features"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              <HoverNavEffect>iCane</HoverNavEffect>
            </ScrollLink>
            <ScrollLink
              targetId="about"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              <HoverNavEffect>About Us</HoverNavEffect>
            </ScrollLink>
            <ScrollLink
              targetId="contact"
              className="hover:text-[#11285A] transition-colors duration-200"
            >
              <HoverNavEffect>Contact Us</HoverNavEffect>
            </ScrollLink>
          </nav>

          <button
            onClick={() => navigate("/get-started")}
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
          <TextFade delay={0.3}>
            <h1 className="font-poppins text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              The iCane That Sees Ahead.
            </h1>
          </TextFade>

          <TextReveal delay={0.6}>
            <h2 className="font-poppins text-xl font-medium md:text-2xl lg:text-3xl text-white/90">
              SmartCane: Redefining Mobility with AI-Powered Safety.
            </h2>
          </TextReveal>

          <TextFade
            delay={1}
            className="font-poppins text-[16px] md:text-lg lg:text-xl
            text-white/90 pr-2"
          >
            <p className="font-poppins text-[16px] md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto">
              iCane uses advanced sensor technology and AI to detect obstacles,
              analyze terrain, and guide you with real-time feedback. Gain
              confidence and independence with a device built for your journey.
            </p>
          </TextFade>

          <ScaleIn delay={1.3}>
            <div className="mx-auto max-w-xs pt-4 sm:max-w-none">
              <Link
                to="/welcome"
                className="mx-auto w-full rounded-[10px] bg-white px-6 py-3 text-[#11285A] font-semibold shadow-[0_12px_25px_rgba(0,0,0,0.15)] hover:bg-[#F0F4FF] sm:w-[170px]"
              >
                Get Started
              </Link>
            </div>
          </ScaleIn>
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
            className="flex snap-x snap-proximity gap-6 overflow-x-auto pb-6 pt-4 px-2 scroll-smooth sm:gap-8 lg:gap-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                backgroundIcon={card.backgroundIcon}
                backgroundIconProps={card.backgroundIconProps}
                backgroundIconClassName={card.backgroundIconClassName}
                backgroundIconStyle={card.backgroundIconStyle}
                backgroundIconContainerClassName={
                  card.backgroundIconContainerClassName
                }
                backgroundIconContainerStyle={card.backgroundIconContainerStyle}
                overlayGradient={card.overlayGradient ?? true}
                iconWrapperClassName={card.iconWrapperClassName}
                iconWrapperWidth={card.iconWrapperWidth}
                iconWrapperHeight={card.iconWrapperHeight}
                iconWrapperRounded={card.iconWrapperRounded}
                iconWrapperShadow={card.iconWrapperShadow}
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
        <h3 className="absolute bg-[#FDFCF9] px-12 text-[14px] font-semibold tracking-[0.5em] text-[#11285A] sm:px-20">
          iCane
        </h3>
      </div>
      {/* iCane placeholder */}
      <div className="mx-auto flex w-full  h-[500px] bg-[#dfdfdf] px-4 py-10 sm:min-h-[200px] sm:px-8 md:min-h-[240px] md:px-12"></div>
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
          <div className="flex justify-center rounded-2xl bg-[#dfdfdf] min-h-36 w-full overflow-hidden sm:min-h-[200px] md:min-h-[240px]">
            <img
              src={teamPhoto}
              alt="Team Photo"
              className="object-cover w-full rounded-2xl"
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
              />
            ))}
          </div>
        </SlideInFromRight>
      </div>

      <div
        id="contact"
        className="relative mx-auto flex w-full items-center justify-center py-12 md:py-12"
      >
        {/* Section divider for Contact Us */}

        <div className="h-px  w-full bg-[#bfcef0]" aria-hidden="true" />

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

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-y-10 px-4 text-center text-[12px] sm:grid-cols-2 sm:text-left">
        <SlideInFromLeft
          delay={0.6}
          className="flex flex-col items-center gap-3 sm:items-start"
        >
          <h3 className="text-[14px] mt-1 font-semibold  text-card-100">Call Us</h3>
          <p className="mt-2">We’re just a call away for any questions or support you need.</p>
          
          <div className="flex min-w-40 mt-3 items-center justify-start gap-3">
            <HoverIcon src={callIcon} alt="Call" size={10} />
            <p>09696273011</p>
          </div>
        </SlideInFromLeft>

        <SlideInFromRight
          delay={0.6}
          className="flex flex-col items-center gap-3 sm:items-start"
        >
          <h3 className="text-[14px] font-semibold  text-card-100">Email Us</h3>
          <p>Send us an email and we’ll get back to you as soon as possible.</p>
          
          <div className="flex min-w-36 items-center justify-start gap-3">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=iCane@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HoverIcon src={emailIcon} alt="Email" size={10} />
            </a>
            <p>iCane@gmail.com</p>
          </div>
        </SlideInFromRight>
      </div>

      {/* Footer */}
      <footer className="mt-8 bg-[#11285A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-12">
          <div className=" border-white/15 pt-10 grid gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 ">
                <BlinkIcon src={icaneLogoWhite} alt="iCane emblem" size={12} />
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
                <a
                  href="!"
                  aria-label="Visit the iCane Twitter page"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <HoverIcon
                    src={twitterIcon}
                    alt="Twitter icon"
                    hoverRotate={0}
                  />
                </a>
                <a
                  href="#!"
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
    </div>
  );
};

export default GuestPage;
