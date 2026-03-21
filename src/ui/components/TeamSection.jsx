import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { SlideUp } from "@/wrapper/MotionWrapper";
import { useTranslation } from "react-i18next";
import africaImg from "@/assets/images/team/africa.jpg";
import arrojoImg from "@/assets/images/team/arrojo.jpg";
import barbaImg from "@/assets/images/team/barba.jpg";
import belasImg from "@/assets/images/team/belas.jpg";
import casipeImg from "@/assets/images/team/casipe.jpg";
import delacruzImg from "@/assets/images/team/delacruz.jpg";
import diolaImg from "@/assets/images/team/diola.jpg";
import ibanezImg from "@/assets/images/team/ibañez.jpg";
import mabatoImg from "@/assets/images/team/mabato.jpg";
import madriagaImg from "@/assets/images/team/madriaga.jpg";
import morreImg from "@/assets/images/team/morre.jpg";
import patacsilImg from "@/assets/images/team/patacsil.jpg";
import perezImg from "@/assets/images/team/perez.jpg";
import villamoraImg from "@/assets/images/team/villamora.jpg";

const teamMembers = [
  {
    id: 1,
    name: "Christine D. Africa",
    role: "Lead Product Designer & UI/UX Specialist",
    bio: "Leads iCane’s product experience from concept to prototype, translating user needs into accessible, intuitive interfaces and consistent design systems.",
    image: africaImg,
    social: {
      facebook: "",
      linkedin: "",
      github: ""
    },
    expertise: [
      "UI/UX Design",
      "Prototyping",
      "Workflow Management",
      "Branding",
      "Project Coordination",
      "Graphic Design"
    ],
    color: "#122550"
  },
  {
    id: 2,
    name: "Jestro Marcus T. Arrojo",
    role: "Head Documentation & Research Specialist",
    bio: "Leads research and documentation for iCane, consolidating technical findings into clear reports, diagrams, and annotated visuals to support development and evaluation.",
    image: arrojoImg,
    social: {
      linkedin: "https://www.linkedin.com/in/arrojo-jestro-marcus-t-6080433b4",
      facebook: "https://www.facebook.com/jestr.arrojo",
      instagram: "https://www.instagram.com/marcusxcz?igsh=MWhwc2ZwOXR6cnp4eg=="
    },
    expertise: [
      "Technical Writing",
      "Research Methods",
      "Documentation Standards",
      "Workflow Management",
      "Citation/Formatting",
      "Project Coordination",
      "Research",
      "Requirements Gathering"
    ],
    color: "#1C253C"
  },
  {
    id: 3,
    name: "Luigi B. Barba",
    role: "Web & UI Engineer",
    bio: "Builds iCane’s web UI with a focus on clean components, responsive layouts, and smooth user interactions for both users and guardians.",
    image: barbaImg,
    social: {
      facebook: "https://www.facebook.com/BarbaLuigi14/",
      github: "https://github.com/Barbaluigi"
    },
    expertise: [
      "Responsive UI",
      "Component Architecture",
      "Frontend Development",
      "Developer"
    ],
    color: "#122550"
  },
  {
    id: 4,
    name: "Ma. Eloisa B. Belas",
    role: "Assistant Documentation & Product Manager",
    bio: "Supports product planning and documentation by coordinating requirements, keeping progress aligned, and ensuring deliverables are clearly written and well-structured.",
    image: belasImg,
    social: {
      facebook: "https://www.facebook.com/share/1Ay2JtRxr2/",
      linkedin: "https://www.linkedin.com/in/eloisa-belas-a249843b5",
      twitter: "https://x.com/Eloy_sa"
    },
    expertise: [
      "Branding",
      "Requirements Gathering",
      "Project Coordination",
      "Documentation",
      "Prototyping",
      "Stakeholder Communication",
      "Workflow Management",
      "Research Methods",
      "Research",
      "Graphic Design"
    ],
    color: "#1C253C"
  },
  {
    id: 5,
    name: "Ryan C. Casipe",
    role: "Web Developer & Hardware Engineer",
    bio: "Bridges software and hardware by developing web features while helping integrate sensors and device components for reliable end-to-end functionality.",
    image: casipeImg,
    social: {
      facebook: "https://www.facebook.com/share/14ZWaCSLntW/",
      instagram: "https://www.instagram.com/defc.ry?igsh=bWNwMGllYndjMW1w",
      github: "https://github.com/casixx"
    },
    expertise: [
      "Web Development",
      "Frontend Development",
      "Hardware Engineering",
      "Troubleshooting",
      "Developer",
      "Responsive UI",
      "Component Architecture"
    ],
    color: "#122550"
  },
  {
    id: 6,
    name: "John Mark G. Dela Cruz",
    role: "Full Stack Web Developer & Visually Impaired User",
    bio: "Develops full-stack features while providing direct user perspective, helping validate flows, feedback, and accessibility decisions from real-world usage.",
    image: delacruzImg,
    social: {
      facebook: "",
      linkedin: "",
      twitter: "",
      github: ""
    },
    expertise: [
      "Web Development",
      "Frontend Development",
      "Backend Development",
      "Developer",
      "UI/UX Design",
      "Responsive UI",
      "Component Architecture"
    ],
    color: "#1C253C"
  },
  {
    id: 7,
    name: "Zimon L. Diola",
    role: "UI/UX Designer & Layout Specialist",
    bio: "Designs layouts and presentation materials for iCane, ensuring screens, reports, and visuals communicate information clearly and consistently.",
    image: diolaImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: [
      "UI/UX Design",
      "Layout Design",
      "Technical Writing",
      "Graphic Design"
    ],
    color: "#122550"
  },
  {
    id: 8,
    name: "Gil Andrei Paul B. Ibañez",
    role: "Researcher & Documentation Specialist",
    bio: "Supports iCane research and testing, documenting experiments, results, and implementation notes to keep the team aligned and the project reproducible.",
    image: ibanezImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: [
      "Requirements Gathering",
      "Research",
      "Report Writing",
      "Citation/Formatting"
    ],
    color: "#1C253C"
  },
  {
    id: 9,
    name: "Ralph Christian P. Mabato",
    role: "Project Manager & Quality Assurance",
    bio: "Leads planning and quality assurance for iCane, organizing tasks, tracking progress, and verifying features through structured testing and validation.",
    image: mabatoImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: [
      "Requirements Gathering",
      "Research",
      "Stakeholder Communication",
      "Quality Assurance Testing",
      "Workflow Management",
      "Project Coordination"
    ],
    color: "#122550"
  },
  {
    id: 10,
    name: "Jomari O. Madriaga",
    role: "Graphic Designer & UI/UX Designer",
    bio: "Creates iCane’s visual assets and UI polish, combining branding, graphic design, and interface design to produce a cohesive look and feel.",
    image: madriagaImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: ["Graphic Design", "Visual Assets"],
    color: "#1C253C"
  },
  {
    id: 11,
    name: "Herlyn Morre",
    role: "Researcher & Documentation Specialist",
    bio: "Coordinates documentation and research tasks, keeping project notes organized and ensuring outputs are clear, consistent, and ready for submission.",
    image: morreImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: ["Citation/Formatting", "Requirements Gathering", "Research"],
    color: "#122550"
  },
  {
    id: 12,
    name: "Adrian V. Patacsil",
    role: "Researcher & Documentation Specialist",
    bio: "Assists in research and documentation, translating technical work into understandable write-ups and maintaining clear records of implementation decisions.",
    image: patacsilImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: [
      "Technical Writing",
      "Requirements Gathering",

      "Citation/Formatting",
      "Stakeholder Communication",
      "Research"
    ],
    color: "#1C253C"
  },
  {
    id: 13,
    name: "Valerine Anne S. Perez",
    role: "Researcher & Technical Writer",
    bio: "Writes and edits iCane’s technical content, ensuring the paper, captions, and documentation are readable, consistent, and properly structured.",
    image: perezImg,
    social: { facebook: "", linkedin: "", github: "" },
    expertise: [
      "Technical Writing",
      "Documentation",
      "Citation/Formatting",

      "Stakeholder Communication",
      "Research"
    ],
    color: "#122550"
  },
  {
    id: 14,
    name: "Ivan Ren M. Villamora",
    role: "Lead Developer",
    bio: "Leads system architecture and implementation, bringing components together into a reliable, secure, and scalable real-time solution.",
    image: villamoraImg,
    social: {
      facebook: "https://www.facebook.com/ivrnren/",
      linkedin: "https://www.linkedin.com/in/ivan-ren-villamora-589a06365",
      github: "https://github.com/ivrnDev"
    },
    expertise: ["System Architecture", "IoT/Edge Systems", "Developer"],
    color: "#1C253C"
  }
];

const TEAM_FILTERS = [
  { id: "all" },
  { id: "developers" },
  { id: "designers" },
  { id: "documentation" }
];

const FILTER_KEYWORDS = {
  developers: [
    "developer",
    "engineer",
    "frontend",
    "backend",
    "web",
    "system architecture",
    "component architecture",
    "hardware",
    "iot",
    "troubleshooting"
  ],
  designers: [
    "design",
    "ui/ux",
    "graphic",
    "branding",
    "layout",
    "prototype",
    "visual assets"
  ],
  documentation: [
    "documentation",
    "technical writing",
    "research",
    "citation",
    "report writing",
    "requirements",
    "stakeholder communication"
  ]
};

const memberMatchesFilter = (member, filterId) => {
  if (filterId === "all") return true;
  const searchable = `${member.role} ${member.expertise.join(" ")}`
    .toLowerCase()
    .replace(/\s+/g, " ");
  return FILTER_KEYWORDS[filterId].some((keyword) =>
    searchable.includes(keyword)
  );
};

const TeamMemberCard = ({ member, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const collapsedSkills = member.expertise.slice(0, 2);
  const hiddenSkills = member.expertise.slice(2);

  const visibleSocials = Object.entries(member.social).filter(([, url]) =>
    Boolean(url)
  );

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative group h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`
          relative bg-white rounded-2xl overflow-hidden cursor-pointer
          h-full min-h-[620px] flex flex-col
          transition-[box-shadow] duration-300
          ${isExpanded ? "shadow-2xl ring-1 ring-black/5" : "shadow-lg hover:shadow-xl"}
        `}
        style={{
          boxShadow: isExpanded
            ? `0 25px 50px -12px ${member.color}40`
            : "0 10px 25px -5px rgba(0,0,0,0.1)"
        }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${member.color} 0%, transparent 50%)`
          }}
        />

        {/* Fixed image section */}
        <div className="relative p-6 pb-0">
          <div className="relative overflow-hidden rounded-xl">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              <motion.div
                animate={{ scale: isExpanded ? 1.08 : isHovered ? 1.03 : 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {member.image ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      icon="ph:user-circle-fill"
                      className="w-20 h-20 text-gray-400"
                    />
                  </div>
                )}
              </motion.div>

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${member.color} 0%, transparent 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Content area fills remaining height */}
        <div className="relative p-6 pt-5 flex-1 flex flex-col min-h-0">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <div>
              <h3 className="text-xl font-semibold text-[#1C253C]">
                {member.name}
              </h3>
              <p
                className="text-sm font-medium mt-1"
                style={{ color: member.color }}
              >
                {member.role}
              </p>
            </div>

            {/* Scroll-safe content container */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto pr-1 space-y-3">
                {/* BIO */}
                <div className="overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? "auto" : "4.5rem"
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {member.bio}
                    </p>
                  </motion.div>

                  {!isExpanded && (
                    <div className="pointer-events-none relative -mt-6 h-6 bg-gradient-to-t from-white to-transparent" />
                  )}
                </div>

                {/* EXPERTISE */}
                <div className="mt-1">
                  <div className="flex flex-wrap gap-2">
                    {collapsedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-gray-100"
                        style={{ color: member.color }}
                      >
                        {skill}
                      </span>
                    ))}

                    {!isExpanded && hiddenSkills.length > 0 && (
                      <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-gray-100 text-gray-600">
                        +{hiddenSkills.length}
                      </span>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && hiddenSkills.length > 0 && (
                      <motion.div
                        key="extra-skills"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-2 pt-2">
                          {hiddenSkills.map((skill) => (
                            <motion.span
                              key={skill}
                              initial={{ opacity: 0, y: 8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.96 }}
                              transition={{ duration: 0.2 }}
                              className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-gray-100"
                              style={{ color: member.color }}
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Socials pinned lower */}
            {visibleSocials.length > 0 && (
              <motion.div
                className="flex items-center gap-3 pt-3"
                animate={{ opacity: isExpanded || isHovered ? 1 : 0.65 }}
                transition={{ duration: 0.2 }}
              >
                {visibleSocials.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#11285A] transition-colors duration-200 group-hover/social:bg-[#11285A]"
                    >
                      <Icon
                        icon={
                          platform === "linkedin"
                            ? "mdi:linkedin"
                            : platform === "facebook"
                              ? "mdi:facebook"
                              : platform === "instagram"
                                ? "mdi:instagram"
                                : platform === "github"
                                  ? "mdi:github"
                                  : "mdi:link"
                        }
                        className="w-4 h-4 text-gray-600 group-hover/social:text-white transition-colors duration-200"
                      />
                    </motion.div>
                  </a>
                ))}
              </motion.div>
            )}

            {/* Expand icon pinned bottom */}
            <motion.div
              className="flex justify-center pt-2"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Icon icon="mdi:chevron-down" className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Decorative Corner */}
        <motion.div
          className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none"
          animate={{
            opacity: isHovered ? 1 : 0.3,
            scale: isHovered ? 1.06 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rotate-45 translate-x-16 -translate-y-16"
            style={{
              background: `linear-gradient(135deg, ${member.color} 0%, transparent 100%)`,
              opacity: 0.1
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Main Team Grid Component
const TeamSection = () => {
  const { t } = useTranslation("guestPage");
  const [filter, setFilter] = useState("all");
  const teamGridRef = useRef(null);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => memberMatchesFilter(member, filter));
  }, [filter]);

  const localizedMembers = useMemo(
    () =>
      filteredMembers.map((member) => ({
        ...member,
        role: t(`team.members.${member.id}.role`, { defaultValue: member.role }),
        bio: t(`team.members.${member.id}.bio`, { defaultValue: member.bio })
      })),
    [filteredMembers, t]
  );

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <SlideUp delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C253C] mb-4">
              {t("team.heading.prefix", { defaultValue: "Meet the" })}{" "}
              <span className="text-[#11285A]">
                {t("team.heading.highlight", { defaultValue: "Team" })}
              </span>
            </h2>
          </SlideUp>

          <SlideUp delay={0.3}>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              {t("team.subtitle", {
                defaultValue:
                  "Passionate experts dedicated to redefining mobility through innovative technology and inclusive design."
              })}
            </p>
          </SlideUp>
        </div>

        {/* Filter Chips */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            {TEAM_FILTERS.map((chip, index) => (
              <motion.button
                key={chip.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange(chip.id)}
                className={`
                  w-[calc(50%-0.25rem)] sm:w-auto px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    filter === chip.id
                      ? "bg-[#11285A] text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                  }
                `}
              >
                {t(`team.filters.${chip.id}`, {
                  defaultValue:
                    chip.id.charAt(0).toUpperCase() + chip.id.slice(1)
                })}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <motion.div
          ref={teamGridRef}
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
        >
          <AnimatePresence>
            {localizedMembers.map((member, index) => (
              <motion.div
                key={member.id}
                layout="position"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <TeamMemberCard member={member} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Icon
              icon="mdi:account-search"
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
            />
            <p className="text-gray-500">
              {t("team.empty.message", {
                defaultValue: "No team members found in this category."
              })}
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 px-6 py-2 bg-[#11285A] text-white rounded-lg hover:bg-[#0a1a38] transition-colors"
            >
              {t("team.empty.showAll", { defaultValue: "Show All" })}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
