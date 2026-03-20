import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect to the new Live Tracking page
export default function PropertyLookup() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/track", { replace: true });
  }, [navigate]);
  
  return null;
}
