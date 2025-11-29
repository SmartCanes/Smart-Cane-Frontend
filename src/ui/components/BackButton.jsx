const BackButton = ({ onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-poppins w-full text-center text-[18px] mt-3 text-gray-600 hover:text-gray-800 transition-colors ${className}`}
    >
      Back
    </button>
  );
};

export default BackButton;
