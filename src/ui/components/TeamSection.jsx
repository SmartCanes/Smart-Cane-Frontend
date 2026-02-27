import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { HoverIcon, ScaleIn, SlideUp } from "@/wrapper/MotionWrapper";

// Team member data structure
const teamMembers = [
  {
    id: 1,
    name: "Christine D. Africa",
    role: "Lead Product Designer & UI/UX Specialist",
    bio: "Passionate about creating inclusive designs that empower people with disabilities. Alex brings 8+ years of UX expertise to iCane.",
    image: "@/assets/images/team/africa.jpg",
    social: {
      linkedin: "https://linkedin.com/in/alexrivera",
      twitter: "https://twitter.com/alexrivera",
      github: "https://github.com/alexrivera"
    },
    expertise: ["UI/UX", "Accessibility", "User Research"],
    color: "#122550"
  },
  {
    id: 2,
    name: "Jestro Marcus T. Arrojo",
    role: "Head Documentation & Research Specialist",
    bio: "Specializes in computer vision and machine learning. Sarah leads the development of iCane's visual recognition system.",
    image: "@/assets/images/team/arrojo.jpg",
    social: {
      linkedin: "https://linkedin.com/in/sarahchen",
      twitter: "https://twitter.com/sarahchen",
      github: "https://github.com/sarahchen"
    },
    expertise: ["AI/ML", "Computer Vision", "IoT"],
    color: "#1C253C"
  },
  {
    id: 3,
    name: "Luigi B. Barba",
    role: "Web & UI Engineer",
    bio: "Expert in embedded systems and sensor integration. Marcus ensures iCane's hardware is reliable, durable, and user-friendly.",
    image: "@/assets/images/team/barba.jpg",
    social: {
      linkedin: "https://linkedin.com/in/marcusthompson",
      twitter: "https://twitter.com/marcusthompson",
      github: "https://github.com/marcusthompson"
    },
    expertise: ["Embedded Systems", "Sensors", "IoT"],
    color: "#122550"
  },
  {
    id: 4,
    name: "Ma. Eloisa B. Belas",
    role: "Assistant Documentation & Product Manager",
    bio: "Works directly with visually impaired communities to ensure iCane meets real-world needs. Elena advocates for inclusive technology.",
    image: "@/assets/images/team/belas.jpg",
    social: {
      linkedin: "https://linkedin.com/in/elenarodriguez",
      twitter: "https://twitter.com/elenarodriguez",
      github: "https://github.com/elenarodriguez"
    },
    expertise: ["Accessibility", "User Testing", "Community"],
    color: "#1C253C"
  },
  {
    id: 5,
    name: "Ryan C. Casipe",
    role: "Web Developer & Hardware Engineer",
    bio: "Builds the companion web app and backend services. David focuses on creating seamless connectivity between iCane and guardians.",
    image: "@/assets/images/team/casipe.jpg",
    social: {
      linkedin: "https://linkedin.com/in/davidkim",
      twitter: "https://twitter.com/davidkim",
      github: "https://github.com/davidkim"
    },
    expertise: ["React", "Node.js", "Cloud", "IoT"],
    color: "#122550"
  },
  {
    id: 6,
    name: "John Mark G. Dela Cruz",
    role: "Full Stack Web Developer & Visually Impaired User",
    bio: "Provides medical expertise on visual impairment. Dr. Patel ensures iCane's features align with clinical needs and best practices.",
    image: "@/assets/images/team/delacruz.jpg",
    social: {
      linkedin: "https://linkedin.com/in/mayapatel",
      twitter: "https://twitter.com/mayapatel",
      github: "https://github.com/mayapatel"
    },
    expertise: ["Ophthalmology", "Research", "Medical Ethics"],
    color: "#1C253C"
  },
  {
    id: 7,
    name: "Zimon L. Diola",
    role: "UI/UX Designer & Layout Specialist",
    bio: "Focuses on real-time connectivity and middleware integrations to keep iCane data flowing reliably from device to cloud to web.",
    image: "@/assets/images/team/diola.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["WebSockets", "APIs", "Cloud Integration"],
    color: "#122550"
  },
  {
    id: 8,
    name: "Gil Andrei Paul B. Ibañez",
    role: "Researcher & Documentation Specialist",
    bio: "Works on object detection performance and edge deployment to ensure fast, accurate recognition on the Raspberry Pi.",
    image: "@/assets/images/team/ibañez.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["YOLO", "Edge AI", "Optimization"],
    color: "#1C253C"
  },
  {
    id: 9,
    name: "Ralph Christian P. Mabato",
    role: "Project Manager & Quality Assurance",
    bio: "Builds robust ESP32 firmware and device communication flows for reliable sensor capture and telemetry.",
    image: "@/assets/images/team/mabato.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["ESP32", "Firmware", "Serial Comms"],
    color: "#122550"
  },
  {
    id: 10,
    name: "Jomari O. Madriaga",
    role: "Graphic Designer & UI/UX Designer",
    bio: "Ensures iCane works smoothly through systematic testing, validation, and real-world scenario checks.",
    image: "@/assets/images/team/madriaga.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["Testing", "Validation", "Bug Triage"],
    color: "#1C253C"
  },
  {
    id: 11,
    name: "Herlyn Morre",
    role: "Project Coordinator",
    bio: "Coordinates timelines, documentation, and team alignment to keep iCane deliverables on track.",
    image: "@/assets/images/team/morre.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["Planning", "Documentation", "Coordination"],
    color: "#122550"
  },
  {
    id: 12,
    name: "Adrian V. Patacsil",
    role: "Researcher & Documentation Specialist",
    bio: "Builds responsive UI experiences and ensures iCane looks great and works well across devices, especially mobile.",
    image: "@/assets/images/team/patacsil.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["React", "Responsive UI", "UX Implementation"],
    color: "#1C253C"
  },
  {
    id: 13,
    name: "Valerine Anne S. Perez",
    role: "Researcher & Technical Writer",
    bio: "Conducts user research and testing to make sure iCane stays human-centered and accessibility-first.",
    image: "@/assets/images/team/perez.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["User Research", "Accessibility", "Prototyping"],
    color: "#122550"
  },
  {
    id: 14,
    name: "Ivan Ren M. Villamora",
    role: "Lead Developer",
    bio: "Leads full-stack development and system architecture for iCane, focusing on secure, scalable, real-time features.",
    image: "@/assets/images/team/villamora.jpg",
    social: { linkedin: "", twitter: "", github: "" },
    expertise: ["System Design", "Full Stack", "Cloud"],
    color: "#1C253C"
  }
];

const TeamMemberCard = ({ member, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Main Card */}
      <div
        className={`
          relative bg-white rounded-2xl overflow-hidden
          transition-all duration-500 ease-out cursor-pointer
          ${isExpanded ? "shadow-2xl scale-105 z-10" : "shadow-lg hover:shadow-xl"}
        `}
        style={{
          boxShadow: isExpanded
            ? `0 25px 50px -12px ${member.color}40`
            : "0 10px 25px -5px rgba(0,0,0,0.1)"
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${member.color} 0%, transparent 50%)`
          }}
        />

        {/* Card Content */}
        <div className="relative p-6">
          {/* Profile Image Container */}
          <div className="relative mb-6 overflow-hidden rounded-xl">
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
              className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative"
            >
              {/* Placeholder for actual image - replace with <img> when you have real images */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon
                  icon="ph:user-circle-fill"
                  className="w-20 h-20 text-gray-400"
                />
              </div>

              {/* Overlay gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${member.color} 0%, transparent 100%)`
                }}
              />
            </motion.div>

            {/* Expertise Tags - Floating on image */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2"
            >
              {member.expertise.slice(0, 2).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
                  style={{ color: member.color }}
                >
                  {skill}
                </span>
              ))}
              {member.expertise.length > 2 && (
                <span className="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-600">
                  +{member.expertise.length - 2}
                </span>
              )}
            </motion.div>
          </div>

          {/* Member Info */}
          <div className="space-y-3">
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

            {/* Bio - Expanded/Collapsed */}
            <AnimatePresence mode="wait">
              <motion.p
                key={isExpanded ? "expanded" : "collapsed"}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: isExpanded ? "auto" : "4.5rem"
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-sm text-gray-600 leading-relaxed ${
                  !isExpanded && "line-clamp-3"
                }`}
              >
                {member.bio}
              </motion.p>
            </AnimatePresence>

            {/* Social Links */}
            <motion.div
              className="flex items-center gap-3 pt-3"
              animate={{ opacity: isExpanded || isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {Object.entries(member.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#11285A] transition-colors duration-200 group-hover/social:bg-[#11285A]"
                  >
                    <Icon
                      icon={
                        platform === "linkedin"
                          ? "mdi:linkedin"
                          : platform === "twitter"
                            ? "mdi:twitter"
                            : "mdi:github"
                      }
                      className="w-4 h-4 text-gray-600 group-hover/social:text-white transition-colors duration-200"
                    />
                  </motion.div>
                </a>
              ))}
            </motion.div>

            {/* Expand/Collapse Indicator */}
            <motion.div
              className="flex justify-center pt-2"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon icon="mdi:chevron-down" className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Decorative Corner */}
        <motion.div
          className="absolute top-0 right-0 w-16 h-16 overflow-hidden"
          animate={{
            opacity: isHovered ? 1 : 0.3,
            scale: isHovered ? 1.1 : 1
          }}
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
  const [filter, setFilter] = useState("all");

  // Get unique expertise areas for filtering
  const allExpertise = [...new Set(teamMembers.flatMap((m) => m.expertise))];

  const filteredMembers =
    filter === "all"
      ? teamMembers
      : teamMembers.filter((m) => m.expertise.includes(filter));

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <SlideUp delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C253C] mb-4">
              Meet the <span className="text-[#11285A]">Team</span>
            </h2>
          </SlideUp>

          <SlideUp delay={0.3}>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Passionate experts dedicated to redefining mobility through
              innovative technology and inclusive design.
            </p>
          </SlideUp>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter("all")}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                filter === "all"
                  ? "bg-[#11285A] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow"
              }
            `}
          >
            All
          </motion.button>

          {allExpertise.map((skill, index) => (
            <motion.button
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(skill)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  filter === skill
                    ? "bg-[#11285A] text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                }
              `}
            >
              {skill}
            </motion.button>
          ))}
        </div>

        {/* Team Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <AnimatePresence mode="wait">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
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
              No team members found with this expertise.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 px-6 py-2 bg-[#11285A] text-white rounded-lg hover:bg-[#0a1a38] transition-colors"
            >
              View All Members
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
