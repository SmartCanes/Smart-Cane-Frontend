const DefaultProfile = ({ userInitial, bgColor = "bg-white" }) => {
  return (
    <div
      className={`w-full h-full ${bgColor} hover:bg-gray-100 text-primary-100 ${bgColor === "bg-white" ? "text-primary-100" : "text-white"}
             flex items-center justify-center font-poppins font-semibold
             text-sm sm:text-base`}
    >
      {userInitial}
    </div>
  );
};

export default DefaultProfile;
