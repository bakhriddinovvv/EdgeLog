# EdgeLog: Supabase'ni ulash (bir martalik sozlash)

Endi ma'lumotlar brauzerda emas, Supabase'da email hisobingiz ostida saqlanadi.
Istalgan qurilmadan shu email bilan kirsangiz, trade'laringiz o'sha yerda turadi.

## 1. Loyiha yaratish
1. https://supabase.com ga kiring va **New project** yarating.
2. Loyiha tayyor bo'lguncha kuting (1-2 daqiqa).

## 2. Jadval va rasm joyini yaratish
1. Chap menyudan **SQL Editor** ni oching.
2. `supabase/schema.sql` faylining hammasini nusxalab joylang va **Run** bosing.
   - `user_data` jadvali yaratiladi. Har bir foydalanuvchi faqat o'z qatorlarini ko'radi (RLS).
   - Jadvalga `authenticated` roli uchun `grant` beriladi (yangi loyihalarda bu qo'lda kerak).
   - `images` bucket'i yaratiladi (rasmlar uchun, maks. 2 MB).

## 3. Kalitlarni olish
1. Loyiha sahifasida **Connect** tugmasini (yoki Project Settings, API bo'limini) oching.
2. **Project URL** va **Publishable key** (`sb_publishable_...`) ni nusxalang.
   Eski loyihalarda bu "anon key" deb ataladi, u ham ishlaydi.
3. Loyiha papkasida `.env.example` ni `.env.local` nomi bilan nusxalang va to'ldiring:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
   ```
   `.env.local` git'ga tushmaydi (`*.local` ignore qilingan).

## 4. Paket o'rnatish
```
npm install @supabase/supabase-js
```

## 5. Email sozlamalari
Supabase'da email tasdiqlash odatda yoqilgan, va tasdiqlash havolasi **Site URL** ga olib boradi
(standart qiymati `localhost:3000`, Vite esa `5173` da ishlaydi).

**Authentication, URL Configuration** bo'limida:
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**: `http://localhost:5173` ni qo'shing (keyin deploy qilsangiz, haqiqiy domenni ham qo'shing)

Sinab ko'rish paytida osonroq bo'lishi uchun **Authentication, Sign In / Providers, Email** ichida
**Confirm email** ni vaqtincha o'chirib qo'yishingiz mumkin. Shunda ro'yxatdan o'tgan zahoti kirib ketasiz.
(Supabase'ning o'z email xizmati soatiga juda oz xat yuboradi, shuning uchun test paytida bu qulay.)

## 6. Ishga tushirish
```
npm run dev
```
`.env.local` ni o'zgartirgandan keyin dev serverni to'xtatib, qaytadan ishga tushiring.

## Eski ma'lumotlar
Brauzerda (localStorage) turgan eski trade, sertifikat va xaridlar **birinchi marta kirgan akkauntga**
avtomatik ko'chiriladi. Keyingi akkauntlar bo'sh boshlanadi.

## Cheklovlar (hozircha)
- Rasmlar ochiq bucket'da, taxmin qilib bo'lmaydigan nom bilan saqlanadi. Havolani bilgan kishi ko'ra oladi.
- Trade o'chirilganda uning rasmi Storage'da qolib ketadi.
- Bir vaqtda ikki qurilmadan tahrirlasangiz, oxirgi saqlagan yutadi (har bir ro'yxat butunicha yoziladi).
- Parolni tiklash ("Parolni unutdim") hali qo'shilmagan.
- Tahrirlash/o'chirish paroli (`22FSskdj@`) hamon faqat interfeys himoyasi. Haqiqiy himoya Supabase login va RLS'da.
