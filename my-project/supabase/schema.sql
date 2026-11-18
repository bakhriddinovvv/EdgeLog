-- EdgeLog: Supabase SQL Editor'ga to'liq nusxalab, "Run" bosing.

-- 1) Har bir foydalanuvchining ma'lumotlari (trades / certificates / purchases)
create table if not exists public.user_data (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb       not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

-- Yangi Supabase loyihalarida jadval Data API'ga avtomatik ochilmaydi, shuning uchun aniq ruxsat beramiz
-- (qaysi qatorlarni ko'rishni baribir quyidagi RLS qoidalari belgilaydi)
grant select, insert, update, delete on table public.user_data to authenticated;

-- Foydalanuvchi faqat o'z qatorlarini ko'radi va o'zgartiradi
create policy "user_data: select own" on public.user_data
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "user_data: insert own" on public.user_data
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "user_data: update own" on public.user_data
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_data: delete own" on public.user_data
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 2) Rasmlar uchun bucket (maks. 2 MB, faqat JPEG)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

-- Faqat o'z papkasiga (images/<user_id>/...) yuklash va o'chirish mumkin
create policy "images: upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "images: delete own files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
