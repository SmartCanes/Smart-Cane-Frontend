import { Icon } from "@iconify/react";

const GuardianNetwork = () => {
  const guardians = [
    {
      name: "Sarah Johnson",
      role: "Primary Guardian",
      status: "Active",
      imageUrl: "https://i.pravatar.cc/150?img=1" // Placeholder image
    },
    {
      name: "Dr. Emma Wilson",
      role: "Healthcare Provider",
      status: "Offline",
      imageUrl: "https://i.pravatar.cc/150?img=2" // Placeholder image
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Guardian Network
        </h3>
        <button className="bg-[#1E3A8A] text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors">
          <Icon icon="ph:plus-bold" className="text-base" />
          <span>Add Guardian</span>
        </button>
      </div>

      {/* Guardian List */}
      <div className="space-y-3">
        {guardians.map((guardian, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
          >
            <img
              src={guardian.imageUrl}
              alt={guardian.name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">{guardian.name}</p>
              <p className="text-gray-500 text-sm">{guardian.role}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${guardian.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                ></span>
                <p
                  className={`text-xs font-medium ${guardian.status === "Active" ? "text-green-600" : "text-gray-500"}`}
                >
                  {guardian.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardianNetwork;
