import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "../ui/components/PrimaryButton.jsx";
import smartcaneLogo from "../assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper.jsx";

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className=" bg-[#11285A] h-screen flex items-center justify-center flex-col relative font-poppins">
      <img
        src={smartcaneLogo}
        alt="Smart Cane Logo"
        width={720}
        className="absolute opacity-5 select-none z-0 pointer-events-none"
      />

      <Link to="/">
        <BlinkingIcon
          src={smartcaneLogo}
          alt="Smart Cane Logo"
          className="z-10 w-[290px]"
        />
      </Link>

      <p className="font-poppins text-white max-w-[490px] py-16 text-center text-[20px] z-10">
        Bringing independence closer through a cane that's more than just
        support — it's smart.
      </p>
      <PrimaryButton
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-1/4 mx-4 py-3 md:py-4 hover:bg-gray-400 hover:text-white hover:cursor-pointer text-lg md:text-[20px] z-10"
        text="Get Started"
        textColor="text-[#11285A]"
        bgColor="bg-white"
        onClick={handleGetStarted}
      />
    </div>
  );
};

export default Welcome;
