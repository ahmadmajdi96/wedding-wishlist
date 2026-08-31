import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const mediaUrl = (path: string) => `/api/public/media/${path}`;

export async function uploadMedia(file: File, folder = "uploads") {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return mediaUrl(path);
}

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "الصورة",
  className = "",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function pick(file?: File) {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return toast.error("حجم الملف أكبر من 15 ميجابايت");
    setBusy(true);
    try {
      onChange(await uploadMedia(file, folder));
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`text-xs ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/50 grid place-items-center">
          {value ? (
            <>
              <img src={value} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-0.5 left-0.5 size-5 rounded-full bg-card/90 grid place-items-center text-destructive"
              >
                <X className="size-3" />
              </button>
            </>
          ) : (
            <Upload className="size-4 text-muted-foreground" />
          )}
        </div>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="rounded-full app-pill px-3 py-2 flex items-center gap-1.5 disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {busy ? "جارِ الرفع..." : "رفع صورة"}
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void pick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
