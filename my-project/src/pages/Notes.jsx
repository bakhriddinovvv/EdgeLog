import { useState } from "react";
import { Plus, X, Trash2, ImagePlus } from "lucide-react";
import { useData } from "../context/DataContext";
import usePasswordGuard from "../hooks/usePasswordGuard";
import { uploadImage } from "../utils/image";
import { useApp } from "../context/AppContext";

// "2026-11-18 12:34" ko'rinishida (trade sanalari bilan bir xil format)
const formatDate = (iso) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-CA");
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
};

export default function Notes() {
  const { t } = useApp();
  const { ask, modal } = usePasswordGuard();
  const [notes, setNotes] = useData("notes");

  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [show, setShow] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(null);

  const onImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      setImage(await uploadImage(file, 1400));
    } catch {
      alert(t("errUpload"));
    } finally {
      setUploading(false);
    }
  };

  const add = (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return setError(t("errNoteEmpty"));

    setNotes((prev) => [
      { id: crypto.randomUUID(), text: text.trim(), image, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setText("");
    setImage("");
    setError("");
    setShow(false);
  };

  const remove = (id) =>
    ask(t("confirmDeleteNote"), () => setNotes((prev) => prev.filter((n) => n.id !== id)));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("notes")}</h1>
          <p className="mt-1 text-sm text-neutral-400">{t("notesCount", { n: notes.length })}</p>
        </div>
        <button
          onClick={() => setShow((v) => !v)}
          className="group flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl bg-linear-to-b from-brand to-brand-dark pl-3 pr-5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(247,138,29,0.35)] ring-1 ring-white/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(247,138,29,0.5)] active:translate-y-0 active:scale-95"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 transition-transform duration-200 group-hover:rotate-90">
            {show ? <X size={14} strokeWidth={2.8} /> : <Plus size={14} strokeWidth={2.8} />}
          </span>
          {show ? t("close") : t("addNote")}
        </button>
      </div>

      {show && (
        <form onSubmit={add} className="mt-6 grid gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("noteText")}
            rows={5}
            className="w-full resize-y rounded-lg border border-ink-600 bg-ink-900 p-3 text-sm outline-none focus:border-brand"
          />

          <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-600 px-3 text-sm text-neutral-400 hover:border-brand">
            <ImagePlus size={18} className="shrink-0" />
            <span className="truncate">
              {uploading ? t("uploading") : image ? t("imageChosen") : t("noteImage")}
            </span>
            <input type="file" accept="image/*" onChange={onImage} className="hidden" />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            disabled={uploading}
            className="h-11 rounded-lg bg-brand text-sm font-semibold transition hover:bg-brand-dark disabled:opacity-60"
          >
            {t("save")}
          </button>
        </form>
      )}

      {notes.length === 0 && (
        <p className="mt-6 rounded-2xl border border-ink-700 bg-ink-800 p-8 text-center text-neutral-400">
          {t("noNotes")}
        </p>
      )}

      <div className="mt-6 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((n) => (
          <article key={n.id} className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800">
            {n.image && (
              <img
                src={n.image}
                alt=""
                onClick={() => setZoom(n.image)}
                className="h-48 w-full cursor-zoom-in object-cover"
              />
            )}
            <div className="p-4">
              {n.text && <p className="whitespace-pre-wrap break-words text-sm">{n.text}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">{formatDate(n.createdAt)}</span>
                <button
                  onClick={() => remove(n.id)}
                  className="text-neutral-500 hover:text-red-500"
                  aria-label={t("delete")}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/80 p-4">
          <img src={zoom} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}

      {modal}
    </>
  );
}
