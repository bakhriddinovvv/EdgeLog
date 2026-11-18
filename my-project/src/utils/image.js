import { supabase } from "../lib/supabase";

// Rasmni kichraytirib JPEG blob'ga aylantiradi
function compress(file, maxW) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", 0.7);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Rasmni Supabase Storage'dagi `images/<user_id>/...` papkasiga yuklab, URL qaytaradi.
// Ma'lumot ichida katta base64 o'rniga faqat shu qisqa URL saqlanadi.
export async function uploadImage(file, maxW = 1000) {
  const blob = await compress(file, maxW);
  const { data } = await supabase.auth.getSession();
  const userId = data.session.user.id;

  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from("images")
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;

  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}
