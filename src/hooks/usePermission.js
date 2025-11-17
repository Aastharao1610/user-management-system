import { useState, useEffect } from "react";
import axios from "axios";

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.status === 200) {
          const userData = res.data.user;
          setUser(userData);
          setPermissions(userData.permissions || []);
          setRole(userData.role);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  return { loading, permissions, user, role };
};
