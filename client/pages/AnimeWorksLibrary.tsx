import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// No anime works have been added yet: an honest page instead of demo cards.
export default function AnimeWorksLibrary() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold">أعمال الأنمي</h1>
        <p className="text-gray-300 leading-relaxed">لم تُضف أعمال في هذا القسم بعد. ستظهر هنا فور رفعها من لوحة الإدارة.</p>
        <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
      </div>
    </div>
  );
}
