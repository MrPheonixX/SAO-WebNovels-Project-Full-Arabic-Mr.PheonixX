import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import { resolveWork } from "@/lib/readerRoutes";

// Old entry point of the library pages (/reader/<kind>/<id>).
// It used to show generated placeholder pages; now it opens the real PDF in
// the PDF reader, or says honestly that the book has no file yet.
export default function BookReader() {
  const { series, volumeId } = useParams();
  const navigate = useNavigate();
  const work = resolveWork(series, volumeId);

  if (work) {
    return <Navigate to={`/pdf-reader/${work.id}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-black/40 border-blue-500/30 backdrop-blur-xl">
        <CardContent className="p-8 text-center space-y-4">
          <BookOpen className="w-14 h-14 mx-auto text-blue-400" />
          <h1 className="text-xl font-bold">هذا العمل غير متوفر للقراءة بعد</h1>
          <p className="text-gray-300 text-sm">
            لم تتم إضافة ملف هذا العمل بعد. سيظهر هنا بمجرد إضافته.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-gray-500 text-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              رجوع
            </Button>
            <Button onClick={() => navigate("/pdf-works")}>مكتبة الملفات</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
