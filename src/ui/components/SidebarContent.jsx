import { Link } from "react-router-dom";
import SmartCaneLogo from "@/assets/images/smartcane-logo.png";

const SidebarContent = () => {
  return (
    <>
      <div
        className={`hidden sm:flex sm:flex-1 min-h-screen bg-primary-100 items-center justify-center flex-col relative`}
      >
        <img src={SmartCaneLogo} alt="Sidebar Image" className="opacity-5" />
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center flex-col gap-y-24">
          <Link to="/">
            <img
              src={SmartCaneLogo}
              alt="Sidebar Image"
              className="w-[290px]"
            />
          </Link>

          <h1 className="font-gabriela text-h1 text-[#FDFCFA]">icane</h1>
          <p className="font-poppins text-paragraph text-[#FDFCFA] text-center max-w-nigga">
            Bringing independence closer through a cane that’s more than just
            support — it’s smart.
          </p>
        </div>
      </div>
    </>
  );
};

export default SidebarContent;
