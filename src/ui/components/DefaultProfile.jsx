const DefaultProfile = ({
  userInitial,
  bgColor = "bg-white",
  hover = "hover:bg-gray-100"
}) => {
  return (
    <div
      className={`w-full h-full ${bgColor} ${hover} text-primary-100 rounded-full ${bgColor === "bg-white" ? "text-primary-100" : "text-white"}
             flex items-center justify-center font-poppins font-semibold
             text-sm sm:text-base`}
    >
      {userInitial}
    </div>
  );
};

export default DefaultProfile;
