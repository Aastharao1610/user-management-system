// hooks/useRouteAccess.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useRouteAccess(requiredPermission) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();

        if (!data.user.permissions.includes(requiredPermission)) {
          router.replace("/user"); // quiet redirect
        }
      } catch (err) {
        router.replace("/user"); // redirect on error too
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [requiredPermission, router]);

  return loading;
}
