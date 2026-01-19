import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { verifyGuardianInvite } from "@/api/backendService";
import { useUserStore } from "@/stores/useStore";

const STATUS_ICON_MAP = {
  processing: { icon: "svg-spinners:90-ring-with-bg", color: "text-blue-500" },
  auto_accepted_login: {
    icon: "material-symbols:check-circle-rounded",
    color: "text-green-500"
  },
  auto_accepted_dashboard: {
    icon: "material-symbols:check-circle-rounded",
    color: "text-green-500"
  },
  register_required: {
    icon: "material-symbols:person-add-rounded",
    color: "text-blue-500"
  },
  expired: {
    icon: "material-symbols:error-outline-rounded",
    color: "text-amber-500"
  },
  invalid_token: {
    icon: "material-symbols:error-rounded",
    color: "text-red-500"
  },
  error: { icon: "material-symbols:error-rounded", color: "text-red-500" }
};

const STATUS_TITLE_MAP = {
  processing: "Processing Invitation",
  auto_accepted_login: "Invitation Accepted!",
  auto_accepted_dashboard: "Invitation Accepted!",
  register_required: "Become a Guardian",
  expired: "Invitation Expired",
  invalid_token: "Invalid Invitation",
  error: "Processing Failed"
};

const GuardianInvite = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your invitation...");
  const [userData, setUserData] = useState({
    email: null,
    userExists: false,
    redirectTo: null,
    token: null
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const { user } = useUserStore();

  const redirectTimerRef = useRef(null);
  const countdownRef = useRef(10);
  const countdownElementRef = useRef(null);

  const startRedirectTimer = (redirectCallback) => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
    }

    countdownRef.current = 10;
    setShowCountdown(true);

    if (countdownElementRef.current) {
      countdownElementRef.current.textContent = `Redirecting in ${countdownRef.current} seconds...`;
    }

    redirectTimerRef.current = setInterval(() => {
      countdownRef.current -= 1;

      if (countdownElementRef.current) {
        const seconds = countdownRef.current;
        countdownElementRef.current.textContent = `Redirecting in ${seconds} second${seconds !== 1 ? "s" : ""}...`;
      }

      if (countdownRef.current <= 0) {
        clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
        setShowCountdown(false);
        redirectCallback();
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("invalid_token");
      setMessage("Invalid invitation link - token missing");
      return;
    }

    const processInvite = async () => {
      try {
        const response = await verifyGuardianInvite(token);
        console.log(response);

        if (!response.success) throw new Error("Failed to verify invitation");

        const { userExists, email, redirectTo } = response.data;

        setUserData({
          email,
          userExists,
          redirectTo,
          token: response.data.token
        });

        if (userExists && user) {
          setStatus("auto_accepted_dashboard");
          setMessage(
            `You're all set! Your guardian invitation has been accepted. Redirecting to dashboard...`
          );
          startRedirectTimer(() => navigate("/dashboard"));
          return;
        }

        if (userExists && !user) {
          setStatus("auto_accepted_login");
          setMessage(
            `Congratulations, ${email}! Your invitation has been accepted. Redirecting to login...`
          );

          startRedirectTimer(() => {
            if (redirectTo === "dashboard") navigate("/dashboard");
            else navigate("/login");
          });
          return;
        }

        setStatus("register_required");
        setMessage(`Welcome! You've been invited to become a guardian.`);
        startRedirectTimer(() =>
          navigate(`/register?invite_token=${encodeURIComponent(token)}`)
        );
      } catch (err) {
        handleError(err.response);
      }
    };

    const timer = setTimeout(processInvite, 300);
    return () => clearTimeout(timer);
  }, [token, navigate, user]);

  const handleError = (err) => {
    console.error("Invitation processing error:", err);
    if (!err) return;
    if ([404, 400].includes(err.status)) setStatus("invalid_token");
    else if (err.status === 410) setStatus("expired");
    else setStatus("error");

    setMessage(
      err?.data?.message ||
        "An unexpected error occurred while processing your invitation."
    );
  };

  const StatusIcon = ({ status }) => {
    const { icon, color } = STATUS_ICON_MAP[status] || {};
    if (!icon) return null;
    return <Icon icon={icon} className={`h-12 w-12 ${color}`} />;
  };

  const ActionButtons = ({ status }) => {
    switch (status) {
      case "auto_accepted_dashboard":
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Go to Dashboard Now
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:underline text-sm"
            >
              Return to Homepage
            </button>
          </div>
        );
      case "auto_accepted_login":
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() =>
                navigate("/login", {
                  state: {
                    message: "Invitation accepted!",
                    email: userData?.email,
                    autoInviteAccepted: true
                  }
                })
              }
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Go to Login Now
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:underline text-sm"
            >
              Return to Homepage
            </button>
          </div>
        );
      case "register_required":
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() =>
                navigate(`/register?invite_token=${encodeURIComponent(token)}`)
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Register Now
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:underline text-sm"
            >
              Already have an account? Login
            </button>
          </div>
        );
      case "expired":
      case "invalid_token":
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              Contact Support
            </button>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:underline text-sm"
            >
              Go to Homepage
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <StatusIcon status={status} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {STATUS_TITLE_MAP[status]}
        </h1>

        <div className="mb-6">
          <p className="text-gray-600">{message}</p>

          {userData?.email && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Invitation for:</span>{" "}
                {userData.email}
              </p>
            </div>
          )}

          {showCountdown && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p ref={countdownElementRef} className="text-sm text-gray-600">
                {/* Initial text will be set by startRedirectTimer */}
                Redirecting in {countdownRef.current} seconds...
              </p>
            </div>
          )}
        </div>

        <ActionButtons status={status} />
      </div>
    </div>
  );
};

export default GuardianInvite;
