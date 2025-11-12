const SidebarContent = ({ className = "" }) => {
  return (
    <div
      className={`w-full h-full min-h-screen sm:h-screen bg-primary-100 flex items-center justify-center flex-col relative ${className}`}
    >
      <img
        src="src/assets/images/smartcane-logo.png"
        alt="Sidebar Image"
        className="opacity-5"
      />
      <div className="absolute top-1/2 -translate-y-1/2 flex items-center flex-col gap-y-24">
        <img
          src="src/assets/images/smartcane-logo.png"
          alt="Sidebar Image"
          width={290}
          className=""
        />
        <h1 className="font-gabriela text-h1 text-[#FDFCFA]">icane</h1>
        <p className="font-poppins text-paragraph text-[#FDFCFA] text-center max-w-nigga">
          Bringing independence closer through a cane that’s more than just
          support — it’s smart.
        </p>
      </div>
    </div>
  );
};

export default SidebarContent;
