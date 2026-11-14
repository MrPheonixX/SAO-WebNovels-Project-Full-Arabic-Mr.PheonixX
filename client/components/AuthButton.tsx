import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cloudEnabled, signOut } from "@/lib/cloud";
import { useAuthUser } from "@/lib/useAuthUser";

// Shows "تسجيل دخول" for visitors and the reader's name (with a sign-out button)
// once signed in, so the login is visible on every page that uses it.
export default function AuthButton({ className = "" }: { className?: string }) {
  const user = useAuthUser();
  const navigate = useNavigate();
  if (!cloudEnabled) return null;

  if (!user) {
    return (
      <Button
        variant="outline"
        className={`border-blue-500 text-blue-400 hover:bg-blue-500/10 ${className}`}
        onClick={() => navigate("/login")}
      >
        تسجيل دخول
      </Button>
    );
  }
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        className="border-green-500 text-green-400 hover:bg-green-500/10"
        onClick={() => navigate("/profile")}
        aria-label="ملفي الشخصي"
      >
        👤 {user.name}
      </Button>
      <Button
        variant="ghost"
        className="text-gray-300 hover:text-red-400"
        onClick={() => void signOut()}
      >
        خروج
      </Button>
    </div>
  );
}
