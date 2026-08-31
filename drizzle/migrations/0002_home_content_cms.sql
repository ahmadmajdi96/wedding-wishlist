-- Hero slides
CREATE TABLE public.home_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_slug text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_slides TO anon, authenticated;
GRANT ALL ON public.home_slides TO service_role;
ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home slides public read" ON public.home_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage home slides" ON public.home_slides FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
GRANT INSERT, UPDATE, DELETE ON public.home_slides TO authenticated;

-- Generic home sections (titles, visibility, order, promo content)
CREATE TABLE public.home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_slug text NOT NULL DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.home_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.home_sections TO authenticated;
GRANT ALL ON public.home_sections TO service_role;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home sections public read" ON public.home_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage home sections" ON public.home_sections FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  quote text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Trust badges / features strip
CREATE TABLE public.home_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'ShieldCheck',
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.home_features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.home_features TO authenticated;
GRANT ALL ON public.home_features TO service_role;
ALTER TABLE public.home_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home features public read" ON public.home_features FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage home features" ON public.home_features FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Seed current hard-coded home content
INSERT INTO public.home_slides (title, subtitle, cta_label, cta_slug, image_url, sort_order) VALUES
 ('احجزي قاعتكِ المثالية ليوم لا يُنسى','أرقى قاعات الأفراح بعروض حصرية','اكتشفي القاعات','halls','https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80',1),
 ('كوش وديكور بأنامل فنانين','تصاميم رومانسية بالورد الطبيعي','تصفّحي الكوش','decor','https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1600&q=80',2),
 ('تصوير سينمائي لذكرياتكِ','خصم 20٪ على باقات التصوير هذا الشهر','احجزي مصوّر','photo','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=80',3);

INSERT INTO public.home_sections (key, title, subtitle, body, image_url, cta_label, cta_slug, sort_order) VALUES
 ('categories','التصنيفات','','','','عرض الكل','',1),
 ('promo','احصلي على خصم 25٪ على باقات التجهيز الكامل','باقة العروس الذهبية','','','اطلبي الباقة','halls',2),
 ('featured','مميزون لكِ','اخترناهم بعناية حسب ذوقكِ','','','الكل','',3),
 ('popular','الأكثر طلباً','','','','عرض الكل','',4),
 ('plan','عدّاد العد التنازلي','خطة فرحكِ','تابعي مهامكِ، ميزانيتكِ، وموعدكِ المنتظر','','','',5),
 ('new','وصل حديثاً','','','','','',6),
 ('testimonials','قالوا عنّا','','','','','',7),
 ('trust','لماذا يلا نجهّز','','','','','',8);

INSERT INTO public.testimonials (name, avatar_url, rating, quote, sort_order) VALUES
 ('سارة المطيري','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80',5,'يلا نجهّز خلّى كل تفاصيل فرحي سهلة ومنظمة. لقيت كل اللي أحتاجه بمكان واحد وبأسعار ممتازة!',1);

INSERT INTO public.home_features (icon, label, sort_order) VALUES
 ('ShieldCheck','مزوّدون موثوقون',1),
 ('Headphones','دعم 24/7',2),
 ('Crown','أسعار حصرية',3);