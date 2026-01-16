import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyGuardianInvite } from "@/api/backendService";

const GuardianInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // get token from URL
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying invitation...");

  useEffect(() => {
    if (!token) {
      setStatus("Invalid invitation link");
      return;
    }

    const verifyInvite = async () => {
      try {
        const response = await verifyGuardianInvite(token);

        if (response.data.success) {
          setStatus("Invitation verified! You can now register.");
          navigate(`/register?invite_token=${token}`);
        } else {
          setStatus("Invalid or expired invitation link.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Failed to verify invitation. Please try again.");
      }
    };

    verifyInvite();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">{status}</p>
    </div>
  );
};

export default GuardianInvite;
