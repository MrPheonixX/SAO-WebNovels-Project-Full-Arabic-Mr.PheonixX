import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cloudEnabled,
  deleteReview,
  fetchReviews,
  getSessionUser,
  isAdmin,
  submitReview,
  summarizeReviews,
  type Review,
} from "@/lib/cloud";

function Stars({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
        />
      ))}
    </span>
  );
}

// Readers' ratings and comments for one work. Anyone can read them; writing
// needs an account. The author's name is set by the database, and the author
// (or an admin) can delete a review.
export default function WorkReviews({ workId }: { workId: string }) {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const r = await fetchReviews(workId);
    if (r.ok) {
      setReviews(r.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  }, [workId]);

  useEffect(() => {
    if (!cloudEnabled) return;
    void load();
    void isAdmin().then(setAdmin);
  }, [load]);

  const mine = useMemo(
    () => reviews?.find((r) => r.userId === user?.id),
    [reviews, user?.id],
  );
  // start the form from the reader's existing review, once
  useEffect(() => {
    if (mine) {
      setStars(mine.stars);
      setComment(mine.comment);
    }
  }, [mine?.id]);

  if (!cloudEnabled) return null;
  const summary = summarizeReviews(reviews ?? []);

  const handleSubmit = async () => {
    if (stars < 1) {
      setMessage("اختر عدد النجوم أولاً");
      return;
    }
    setBusy(true);
    setMessage("");
    const r = await submitReview(workId, stars, comment);
    setBusy(false);
    if (!r.ok) {
      setMessage(r.status === 403 ? "لا يمكنك إضافة تقييم حالياً" : r.error);
      return;
    }
    setMessage(mine ? "تم تحديث تقييمك" : "شكراً لتقييمك!");
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف هذا التقييم؟")) return;
    const r = await deleteReview(id);
    if (!r.ok) {
      setMessage(r.error);
      return;
    }
    if (id === mine?.id) {
      setStars(0);
      setComment("");
    }
    await load();
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-lg text-yellow-400 flex items-center justify-between gap-3">
          <span>تقييمات القرّاء</span>
          {summary.count > 0 && (
            <span className="flex items-center gap-2 text-sm text-gray-200">
              <Stars value={summary.average} />
              {summary.average} ({summary.count})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1" role="radiogroup" aria-label="تقييمك">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} نجوم`}
                  onClick={() => setStars(n)}
                >
                  <Star className={`w-7 h-7 ${n <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`} />
                </button>
              ))}
            </div>
            <textarea
              aria-label="تعليقك"
              maxLength={1000}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب رأيك في العمل (اختياري)"
              className="w-full px-3 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSubmit} disabled={busy} className="bg-yellow-600 hover:bg-yellow-700">
                {busy ? "جاري الحفظ..." : mine ? "تحديث تقييمي" : "إرسال التقييم"}
              </Button>
              {mine && (
                <Button variant="outline" onClick={() => handleDelete(mine.id)} className="border-red-500/40 text-red-400">
                  حذف تقييمي
                </Button>
              )}
            </div>
            {message && (
              <p className="text-sm text-gray-200" role="status">
                {message}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-300">
            لإضافة تقييم{" "}
            <button type="button" onClick={() => navigate("/login")} className="text-yellow-400 underline">
              سجّل الدخول
            </button>{" "}
            بحسابك.
          </p>
        )}

        <div className="border-t border-white/10 pt-4 space-y-4">
          {loadError && <p className="text-sm text-red-400">تعذر تحميل التقييمات.</p>}
          {!loadError && reviews === null && <p className="text-sm text-gray-400">جاري التحميل...</p>}
          {reviews?.length === 0 && <p className="text-sm text-gray-400">لا توجد تقييمات بعد. كن أول من يقيّم هذا العمل.</p>}
          {reviews?.map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{r.author}</span>
                  <Stars value={r.stars} size="w-3.5 h-3.5" />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                {(admin || r.userId === user?.id) && (
                  <button
                    type="button"
                    aria-label="حذف التقييم"
                    onClick={() => handleDelete(r.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {r.comment && <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{r.comment}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
