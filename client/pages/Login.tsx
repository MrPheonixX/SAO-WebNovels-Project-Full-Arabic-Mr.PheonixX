import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthUser } from "@/lib/useAuthUser";
import {
  cloudEnabled,
  parseRecoveryHash,
  recoverPassword,
  signIn,
  signUp,
  syncProgress,
  updatePassword,
  type CloudUser,
} from "@/lib/cloud";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sword,
  Star,
  Crown,
  ArrowLeft,
  Shield,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  joinDate: string;
  avatar: string;
  badge: string;
  readingStreak: number;
  totalPagesRead: number;
  favoriteCharacter: string;
  readingPreferences: {
    theme: string;
    fontSize: number;
    readingMode: string;
  };
}

// The Profile page reads "user-profile"; fill it from the real account and keep
// anything the user already edited there (avatar, favourite character, ...).
function storeProfile(user: CloudUser) {
  let existing: Partial<UserProfile> = {};
  try {
    const raw = JSON.parse(localStorage.getItem("user-profile") ?? "null");
    if (raw && raw.id === user.id) existing = raw;
  } catch {
    /* ignore */
  }
  const profile: UserProfile = {
    id: user.id,
    username: user.name,
    email: user.email,
    level: 1,
    xp: 0,
    joinDate: new Date().toISOString().slice(0, 10),
    avatar: "⚔️",
    badge: "Reader",
    readingStreak: 0,
    totalPagesRead: 0,
    favoriteCharacter: "",
    readingPreferences: { theme: "dark", fontSize: 16, readingMode: "scroll" },
    ...existing,
  };
  profile.username = user.name;
  profile.email = user.email;
  localStorage.setItem("user-profile", JSON.stringify(profile));
  localStorage.removeItem("auth-token");
}

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const authUser = useAuthUser();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Already signed in (and not resetting a password): nothing to do here
  useEffect(() => {
    if (authUser && !resetToken && !window.location.hash.includes("type=recovery")) {
      navigate("/profile", { replace: true });
    }
  }, [authUser, resetToken, navigate]);

  // Arriving from the password-reset e-mail: ask for a new password.
  useEffect(() => {
    const token = parseRecoveryHash(window.location.hash);
    if (token) {
      setResetToken(token);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Base profile for guests (every counter is overwritten with zero below)
  const mockUser: UserProfile = {
    id: "user123",
    username: "SAOFan2024",
    email: "user@example.com",
    level: 15,
    xp: 2450,
    joinDate: "2024-01-15",
    avatar: "⚔️",
    badge: "Knight of Aincrad",
    readingStreak: 7,
    totalPagesRead: 1250,
    favoriteCharacter: "Asuna",
    readingPreferences: {
      theme: "dark",
      fontSize: 16,
      readingMode: "scroll",
    },
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = "اسم المستخدم مطلوب";
      } else if (formData.username.trim().length < 3) {
        newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
      } else if (formData.username.trim().length > 40) {
        newErrors.username = "اسم المستخدم طويل جدًا";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password.trim()) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!cloudEnabled) {
      setErrors({ form: "الحسابات غير متاحة حاليًا. يمكنك الدخول كضيف." });
      return;
    }

    setIsLoading(true);
    const result = isLogin
      ? await signIn(formData.email, formData.password)
      : await signUp(formData.email, formData.password, formData.username);
    setIsLoading(false);

    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    if (result.data === null) {
      // Project requires e-mail confirmation: no session yet.
      setIsLogin(true);
      setErrors({
        form: "تم إنشاء الحساب. افتح رسالة التأكيد في بريدك ثم سجّل الدخول.",
      });
      return;
    }
    storeProfile(result.data);
    void syncProgress();
    navigate("/profile");
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || !/\S+@\S+\.\S+/.test(recoveryEmail)) {
      setRecoveryMessage("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoading(true);
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login`;
    const result = await recoverPassword(recoveryEmail, redirectTo);
    setIsLoading(false);

    if (!result.ok) {
      setRecoveryMessage(result.error);
      return;
    }
    // Same wording whether or not the address exists.
    setRecoveryMessage(
      "تم إرسال رابط الاستعادة إذا كان البريد مسجّلًا لدينا. تحقق من بريدك.",
    );
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    if (newPassword.length < 6) {
      setRecoveryMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setIsLoading(true);
    const result = await updatePassword(resetToken, newPassword);
    setIsLoading(false);
    if (!result.ok) {
      setRecoveryMessage(result.error);
      return;
    }
    setResetToken(null);
    setNewPassword("");
    setRecoveryMessage("");
    setIsLogin(true);
    setErrors({ form: "تم تغيير كلمة المرور. سجّل الدخول بالكلمة الجديدة." });
  };

  const handleGuestLogin = () => {
    const guestUser = {
      ...mockUser,
      id: "guest",
      email: "",
      favoriteCharacter: "",
      joinDate: new Date().toISOString().slice(0, 10),
      username: "ضيف_" + Math.floor(Math.random() * 1000),
      level: 1,
      xp: 0,
      badge: "Guest Reader",
      readingStreak: 0,
      totalPagesRead: 0,
    };

    localStorage.setItem("user-profile", JSON.stringify(guestUser));
    localStorage.setItem("auth-token", "guest-token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Floating particles */}
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-blue-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للرئيسية
            </Button>

            <div className="flex items-center space-x-3">
              <Sword className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-blue-400">
                MrPheonixX Team
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md relative z-10">
          {/* Login/Register Card */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>

              <CardTitle className="text-2xl text-blue-400">
                {resetToken
                  ? "كلمة مرور جديدة"
                  : isRecoveryMode
                  ? "استعادة كلمة المرور"
                  : isLogin
                    ? "تسجيل الدخول"
                    : "إنشاء حساب جديد"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {resetToken
                  ? "اختر كلمة مرور جديدة لحسابك"
                  : isRecoveryMode
                  ? "أدخل بريدك الإلكتروني لاستعادة كلمة المرور"
                  : isLogin
                    ? "ادخل إلى مكتبة ساو العربية الحصرية"
                    : "انضم إلى مجتمع قراء ساو العربي"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Set a new password (opened from the reset e-mail) */}
              {resetToken ? (
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                      placeholder="6 أحرف على الأقل"
                      dir="ltr"
                      autoComplete="new-password"
                    />
                  </div>
                  {recoveryMessage && (
                    <div className="p-3 rounded-md text-sm bg-red-500/20 text-red-400 border border-red-500/30">
                      {recoveryMessage}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-lg font-semibold"
                  >
                    {isLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                  </Button>
                </form>
              ) : isRecoveryMode ? (
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                        placeholder="أدخل بريدك الإلكتروني"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {recoveryMessage && (
                    <div
                      className={`p-3 rounded-md text-sm ${
                        recoveryMessage.includes("تم")
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {recoveryMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      "إرسال رابط الاستعادة"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryMode(false);
                        setRecoveryMessage("");
                        setRecoveryEmail("");
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      العودة لتسجيل الدخول
                    </button>
                  </div>
                </form>
              ) : (
                /* Normal Login/Register Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username (register only) */}
                  {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      اسم المستخدم
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                        placeholder="اختر اسم المستخدم"
                        dir="rtl"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.username}
                      </p>
                    )}
                  </div>
                  )}

                  {/* Email */}
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                          placeholder="البريد الإلكتروني"
                          dir="ltr"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                        placeholder="كلمة المرور"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password (Register only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                          placeholder="تأكيد كلمة المرور"
                          dir="ltr"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {errors.form && (
                    <div
                      role="alert"
                      className={`p-3 rounded-md text-sm ${
                        errors.form.startsWith("تم")
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {errors.form}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>جاري المعالجة...</span>
                      </div>
                    ) : isLogin ? (
                      "تسجيل الدخول"
                    ) : (
                      "إنشاء الحساب"
                    )}
                  </Button>

                  {/* Switch between Login/Register */}
                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-blue-400 hover:text-blue-300 text-sm block w-full"
                    >
                      {isLogin
                        ? "ليس لديك حساب؟ أنشئ حساباً جديداً"
                        : "لديك حساب بالفعل؟ سجل دخولك"}
                    </button>

                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsRecoveryMode(true)}
                        className="text-gray-400 hover:text-gray-300 text-xs"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>

                  {/* Guest Login */}
                  <div className="border-t border-gray-600 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGuestLogin}
                      className="w-full border-gray-500 text-gray-300 hover:bg-gray-500/10"
                    >
                      <User className="w-4 h-4 mr-2" />
                      دخول كضيف
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Card className="bg-black/30 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-blue-300">
                  حماية متقدمة
                </h4>
                <p className="text-xs text-gray-400">محتوى محمي ومشفر</p>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-purple-300">
                  مكتبة ضخمة
                </h4>
                <p className="text-xs text-gray-400">37+ مجلد مترجم</p>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-green-300">
                  نظام إنجازات
                </h4>
                <p className="text-xs text-gray-400">اكسب نقاط ومكافآت</p>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-yellow-300">
                  قراءة متقدمة
                </h4>
                <p className="text-xs text-gray-400">3 أنماط قراءة مختلفة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
