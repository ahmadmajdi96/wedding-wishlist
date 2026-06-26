
-- Extend profiles with style preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS style_preferences text[] NOT NULL DEFAULT '{}';

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  icon text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- VENDORS
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  city text NOT NULL,
  image_url text NOT NULL,
  price_from numeric NOT NULL,
  rating numeric NOT NULL DEFAULT 4.5,
  reviews_count int NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  capacity int,
  area_m2 int,
  parking int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors are public" ON public.vendors FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX vendors_category_idx ON public.vendors(category_id);

-- VENDOR PACKAGES
CREATE TABLE public.vendor_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL,
  includes text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.vendor_packages TO anon, authenticated;
GRANT ALL ON public.vendor_packages TO service_role;
ALTER TABLE public.vendor_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor packages are public" ON public.vendor_packages FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX vendor_packages_vendor_idx ON public.vendor_packages(vendor_id);

-- FAVORITES
CREATE TABLE public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, vendor_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  package_id uuid REFERENCES public.vendor_packages(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own bookings" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WEDDING TASKS
CREATE TABLE public.wedding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'todo',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_tasks TO authenticated;
GRANT ALL ON public.wedding_tasks TO service_role;
ALTER TABLE public.wedding_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own tasks" ON public.wedding_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own tasks" ON public.wedding_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own tasks" ON public.wedding_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own tasks" ON public.wedding_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);

-- Updated_at trigger on profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default tasks on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wedding_tasks (user_id, title, sort_order) VALUES
    (NEW.id, 'حجز القاعة', 1),
    (NEW.id, 'حجز المصور', 2),
    (NEW.id, 'اختيار الفستان', 3),
    (NEW.id, 'تجربة المكياج', 4),
    (NEW.id, 'إرسال الدعوات', 5),
    (NEW.id, 'تنسيق الزهور', 6),
    (NEW.id, 'حجز السيارة', 7),
    (NEW.id, 'تأكيد قائمة الضيوف', 8);

  INSERT INTO public.notifications (user_id, title, body, kind) VALUES
    (NEW.id, 'مرحباً بكِ في يلا نجهّز', 'ابدئي بتجهيز يومكِ المثالي معنا — استكشفي القاعات والموردين.', 'welcome');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed categories
INSERT INTO public.categories (slug, name_ar, icon, sort_order) VALUES
  ('halls', 'القاعات', 'Building2', 1),
  ('dresses', 'الفساتين', 'Sparkles', 2),
  ('photo', 'المصورون', 'Camera', 3),
  ('catering', 'الضيافة', 'Gift', 4),
  ('jewelry', 'المجوهرات', 'Gem', 5),
  ('beauty', 'التجميل والعناية', 'Heart', 6),
  ('cars', 'السيارات', 'Car', 7),
  ('invites', 'الدعوات', 'Mail', 8);

-- Seed vendors
WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.vendors (category_id, name, city, image_url, price_from, rating, reviews_count, description, capacity, area_m2, parking)
SELECT c.id, v.name, v.city, v.image_url, v.price_from, v.rating, v.reviews_count, v.description, v.capacity, v.area_m2, v.parking
FROM c JOIN (VALUES
  ('halls','قاعة ليان','الرياض - العليا','https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 25000, 4.8, 120, 'قاعة فاخرة بتصميم عصري وموقع مميز في قلب الرياض، مثالية لحفلات الزفاف والمناسبات الكبرى.', 600, 800, 120),
  ('halls','قاعة روز','الرياض - السليمانية','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', 18500, 4.7, 98, 'قاعة بطابع رومانسي وإضاءة دافئة، مناسبة لحفلات الزفاف المتوسطة الحجم.', 400, 600, 80),
  ('halls','قاعة بلوم','الرياض - النخيل','https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80', 22000, 4.6, 76, 'تصميم مودرن وخدمة راقية مع مساحات خارجية للجلسات.', 500, 700, 100),
  ('halls','قصر المملكة','جدة','https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80', 32000, 4.9, 210, 'قصر فاخر يطل على الواجهة البحرية مع قاعات متعددة.', 800, 1100, 200),
  ('dresses','أتيليه نور','الرياض','https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=1200&q=80', 8500, 4.9, 156, 'تشكيلة واسعة من فساتين الزفاف من أرقى المصممين.', NULL, NULL, NULL),
  ('dresses','بيت العروس','جدة','https://images.unsplash.com/photo-1604782206219-3b9576575203?w=1200&q=80', 6500, 4.7, 89, 'فساتين عصرية وكلاسيكية بتفصيل دقيق.', NULL, NULL, NULL),
  ('photo','استوديو لمسة','الرياض','https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80', 6500, 4.8, 142, 'فريق تصوير محترف لحفلات الزفاف بأسلوب سينمائي.', NULL, NULL, NULL),
  ('photo','مصور نور','الرياض','https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 5500, 4.9, 210, 'تصوير فوتوغرافي وفيديو عالي الجودة.', NULL, NULL, NULL),
  ('catering','ضيافة الذوق','الرياض','https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80', 12000, 4.6, 67, 'بوفيهات راقية وعالمية مع طاقم خدمة محترف.', NULL, NULL, NULL),
  ('jewelry','مجوهرات لؤلؤة','الرياض','https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80', 15000, 4.8, 95, 'تشكيلة فاخرة من خواتم ومجوهرات الزفاف.', NULL, NULL, NULL),
  ('beauty','صالون أنيق','الرياض','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80', 3500, 4.7, 134, 'مكياج وتسريحات احترافية للعرائس.', NULL, NULL, NULL),
  ('cars','سيارات الفخامة','الرياض','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', 2500, 4.5, 54, 'سيارات فاخرة مزينة لنقل العروسين.', NULL, NULL, NULL),
  ('invites','دعوات الياسمين','الرياض','https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=80', 1500, 4.8, 78, 'تصاميم دعوات مطبوعة ورقمية أنيقة.', NULL, NULL, NULL)
) AS v(slug, name, city, image_url, price_from, rating, reviews_count, description, capacity, area_m2, parking)
ON c.slug = v.slug;

-- Seed packages for the first hall
INSERT INTO public.vendor_packages (vendor_id, name, price, includes, sort_order)
SELECT id, 'الباقة الذهبية', 25000, 'قاعة + ضيافة + ديكور أساسي', 1 FROM public.vendors WHERE name = 'قاعة ليان'
UNION ALL
SELECT id, 'الباقة الماسية', 38000, 'قاعة + ضيافة فاخرة + ديكور كامل + DJ', 2 FROM public.vendors WHERE name = 'قاعة ليان'
UNION ALL
SELECT id, 'الباقة الأساسية', 18500, 'قاعة + ديكور بسيط', 1 FROM public.vendors WHERE name = 'قاعة روز'
UNION ALL
SELECT id, 'الباقة المميزة', 28000, 'قاعة + ضيافة + ديكور + تصوير', 2 FROM public.vendors WHERE name = 'قاعة روز';
