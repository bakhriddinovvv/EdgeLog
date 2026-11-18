import { useState } from "react";
import { Plus, X, Trash2, ImagePlus } from "lucide-react";
import { useData } from "../context/DataContext";
import usePasswordGuard from "../hooks/usePasswordGuard";
import { uploadImage } from "../utils/image";
import { useApp } from "../context/AppContext";

const field =
  "h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm outline-none focus:border-brand";
const empty = { firm: "", title: "", date: "", image: "" };

export default function Certificates() {
  const { t } = useApp();
  const { ask, modal } = usePasswordGuard();
  const [items, setItems] = useData("certificates");
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState(null);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 1400);
      setForm((p) => ({ ...p, image: url }));
    } catch {
      alert(t("errUpload"));
    } finally {
      setUploading(false);
    }
  };

  const add = (e) => {
    e.preventDefault();
    setItems((prev) => [{ ...form, id: crypto.randomUUID() }, ...prev]);
    setForm(empty);
    setShow(false);
  };

  const remove = (id) =>
    ask(t("confirmDeleteCert"), () => setItems((prev) => prev.filter((i) => i.id !== id)));

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("certificates")}</h1>
        <button
          onClick={() => setShow((v) => !v)}
          className="flex h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold transition hover:bg-brand-dark"
        >
          {show ? <X size={16} /> : <Plus size={16} />} {show ? t("close") : t("addCert")}
        </button>
      </div>

      {show && (
        <form onSubmit={add} className="mt-6 grid gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <input required placeholder={t("firmName")} value={form.firm} onChange={set("firm")} className={field} />
          <input required placeholder={t("certTitle")} value={form.title} onChange={set("title")} className={field} />
          <input required type="date" value={form.date} onChange={set("date")} className={field} />
          <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-600 px-3 text-sm text-neutral-400 hover:border-brand">
            <ImagePlus size={18} /> {uploading ? t("uploading") : form.image ? t("imageChosen") : t("certImage")}
            <input type="file" accept="image/*" onChange={onImage} className="hidden" />
          </label>
          <button disabled={uploading} className="h-11 rounded-lg bg-brand text-sm font-semibold transition hover:bg-brand-dark disabled:opacity-60 sm:col-span-2 lg:col-span-4">
            {t("save")}
          </button>
        </form>
      )}

      {items.length === 0 && (
        <p className="mt-6 rounded-2xl border border-ink-700 bg-ink-800 p-8 text-center text-neutral-400">
          {t("noCerts")}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800">
            {c.image ? (
              <img src={c.image} alt="" onClick={() => setZoom(c.image)} className="h-80 w-full cursor-zoom-in object-cover" />
            ) : (
              <div className="grid h-48 place-items-center bg-ink-700 text-neutral-500"><ImagePlus size={32} /></div>
            )}
            <div className="flex items-start justify-between p-4">
              <div>
                <h3 className="font-semibold">{c.firm}</h3>
                <p className="text-sm text-neutral-400">{c.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{c.date}</p>
              </div>
              <button onClick={() => remove(c.id)} className="text-neutral-500 hover:text-red-500" aria-label={t("delete")}>
                <Trash2 size={18} />
              </button>
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