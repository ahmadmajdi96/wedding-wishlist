
function ReviewsPanel({ vendorId }: { vendorId: string }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const reviews = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => listReviews({ data: { vendorId } }),
  });

  const save = useMutation({
    mutationFn: () => upsertMyReview({ data: { vendor_id: vendorId, rating, comment } }),
    onSuccess: () => {
      toast.success("شكراً لتقييمك");
      setComment("");
      qc.invalidateQueries({ queryKey: ["reviews", vendorId] });
      qc.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteMyReview({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", vendorId] });
      qc.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="app-section rounded-2xl p-3">
        <p className="text-sm font-display font-bold mb-2">شاركينا تجربتك</p>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} نجوم`}>
              <Star className={`size-5 ${n <= rating ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتبي رأيك…"
          className="w-full rounded-2xl bg-[color:var(--color-muted)]/70 p-3 text-sm outline-none h-20"
        />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="mt-2 rounded-full gradient-pink text-white px-5 py-2 text-sm font-bold disabled:opacity-60"
        >
          نشر التقييم
        </button>
      </div>

      {(reviews.data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد — كوني الأولى!</p>
      )}
      {(reviews.data ?? []).map((r: any) => (
        <div key={r.id} className="app-section rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`size-3.5 ${n <= r.rating ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "text-muted-foreground"}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("ar-EG")}
              </span>
              <button onClick={() => del.mutate(r.id)} className="text-muted-foreground hover:text-destructive" aria-label="حذف">
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
          {r.comment && <p className="text-sm mt-1.5 leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}
