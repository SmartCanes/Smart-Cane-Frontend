import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "../ui/components/PrimaryButton.jsx";
import smartcaneLogo from "../assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper.jsx";

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-[#11285A] min-h-screen h-full w-full flex items-center justify-center flex-col relative font-poppins px-4 py-8 overflow-hidden">
      <img
        src={smartcaneLogo}
        alt="Smart Cane Logo"
        className="absolute opacity-5 select-none z-0 pointer-events-none w-[500px] sm:w-[600px] md:w-[720px]"
      />

      <Link to="/" className="z-10">
        <BlinkingIcon
          src={smartcaneLogo}
          alt="Smart Cane Logo"
          className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[290px]"
        />
      </Link>

      <p className="font-poppins text-white max-w-[490px] py-8 sm:py-12 md:py-16 text-center text-[16px] sm:text-[18px] md:text-[20px] z-10 leading-relaxed">
        Bringing independence closer through a cane that's more than just
        support — it's smart.
      </p>
      <PrimaryButton
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-1/4 py-3 md:py-4 text-lg md:text-[20px] "
        text="Get Started"
        variant="primary"
        bgColor="bg-white"
        textColor="text-[#1C253C]"
        hoverColor="hover:bg-gray-200"
        onClick={handleGetStarted}
      />
    </div>
  );
};

export default Welcome;
