
INSERT INTO public.categories (slug, name_ar, icon, sort_order) VALUES
  ('decor', 'الديكور والكوش', 'Flower2', 9),
  ('music', 'الفرق والموسيقى', 'Music', 10),
  ('cake', 'كيك الأفراح', 'Cake', 11),
  ('gifts', 'هدايا وتوزيعات', 'PartyPopper', 12)
ON CONFLICT (slug) DO NOTHING;

WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.vendors (category_id, name, city, image_url, price_from, rating, reviews_count, description, capacity, area_m2, parking)
SELECT c.id, v.name, v.city, v.image_url, v.price_from, v.rating, v.reviews_count, v.description, v.capacity, v.area_m2, v.parking
FROM c JOIN (VALUES
  ('halls','قاعة الأميرة','الرياض - الملقا','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80', 28000, 4.9, 184, 'قاعة ملكية بتصميم كلاسيكي فاخر، إضاءة ذهبية وثريات كريستالية.', 700, 950, 150),
  ('halls','قاعة لافندر','جدة - الشاطئ','https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1400&q=80', 26500, 4.7, 132, 'إطلالة بحرية ساحرة مع ديكور رومانسي بألوان اللافندر.', 500, 700, 100),
  ('halls','قاعة كريستال','الدمام','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&q=80', 21000, 4.6, 88, 'قاعة عصرية بلمسات كريستالية مميزة.', 450, 650, 90),
  ('dresses','أتيليه روزا','الرياض - العليا','https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=1400&q=80', 12000, 4.8, 198, 'تصاميم حصرية بقصات معاصرة وأقمشة فاخرة.', NULL, NULL, NULL),
  ('dresses','فستان الأحلام','جدة','https://images.unsplash.com/photo-1496440737103-cd596325d314?w=1400&q=80', 9500, 4.6, 76, 'مجموعة واسعة من فساتين السهرة والزفاف.', NULL, NULL, NULL),
  ('photo','عدسة الذكريات','الرياض','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&q=80', 7500, 4.9, 245, 'استوديو احترافي مع باقات تصوير وفيديو متكاملة.', NULL, NULL, NULL),
  ('photo','استوديو بريق','جدة','https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1400&q=80', 6000, 4.7, 134, 'تصوير مناسبات بأسلوب فني راقي.', NULL, NULL, NULL),
  ('catering','مذاق الفخامة','الرياض','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80', 18000, 4.8, 142, 'ضيافة عالمية مع شيفات معتمدين.', NULL, NULL, NULL),
  ('catering','بوفيه الذواقة','الدمام','https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=1400&q=80', 14500, 4.6, 89, 'تشكيلة متنوعة من الأطباق الشرقية والعالمية.', NULL, NULL, NULL),
  ('jewelry','مجوهرات الماس','جدة','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80', 22000, 4.9, 167, 'مجوهرات حصرية بأحجار كريمة معتمدة.', NULL, NULL, NULL),
  ('jewelry','بيت الذهب','الرياض','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1400&q=80', 18000, 4.7, 112, 'تشكيلة عريقة من المجوهرات الذهبية والألماس.', NULL, NULL, NULL),
  ('beauty','صالون ميلانو','الرياض','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80', 4500, 4.9, 198, 'خبراء مكياج عالميون ومنتجات فاخرة.', NULL, NULL, NULL),
  ('beauty','مركز جمال','جدة','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80', 3800, 4.7, 145, 'عناية كاملة بالعروس قبل اليوم الكبير.', NULL, NULL, NULL),
  ('cars','رولز رويس للأفراح','الرياض','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=80', 4500, 4.8, 87, 'سيارات رولز رويس وبنتلي للمناسبات الفاخرة.', NULL, NULL, NULL),
  ('cars','موكب الأحلام','جدة','https://images.unsplash.com/photo-1542362567-b07e54358753?w=1400&q=80', 3200, 4.6, 65, 'مواكب فاخرة منسقة بزهور طبيعية.', NULL, NULL, NULL),
  ('invites','دعوات الورد','الرياض','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80', 2200, 4.9, 156, 'دعوات بطباعة فاخرة وتصاميم حصرية.', NULL, NULL, NULL),
  ('invites','بطاقات أنيقة','جدة','https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1400&q=80', 1800, 4.7, 94, 'دعوات رقمية ومطبوعة بأسعار مناسبة.', NULL, NULL, NULL),
  ('decor','كوش وردة','الرياض','https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1400&q=80', 15000, 4.9, 178, 'تصاميم كوش فاخرة بأنامل فنانين متخصصين.', NULL, NULL, NULL),
  ('decor','ديكور لمسة','جدة','https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=80', 12500, 4.7, 132, 'تنسيق كامل لقاعات الأفراح بأرقى الورود.', NULL, NULL, NULL),
  ('decor','بلوسوم ديكور','الدمام','https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1400&q=80', 11000, 4.6, 98, 'كوش رومانسية بالورد الطبيعي والإضاءة.', NULL, NULL, NULL),
  ('music','فرقة الفن','الرياض','https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&q=80', 8500, 4.8, 124, 'فرقة موسيقية احترافية للأفراح الكبرى.', NULL, NULL, NULL),
  ('music','DJ ستار','جدة','https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1400&q=80', 5500, 4.7, 89, 'منسق أغاني محترف مع نظام صوت وإضاءة.', NULL, NULL, NULL),
  ('cake','حلويات ماري','الرياض','https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1400&q=80', 3500, 4.9, 234, 'كيكات أفراح بتصاميم فنية وطعم لا يُنسى.', NULL, NULL, NULL),
  ('cake','أتيليه السكر','جدة','https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=1400&q=80', 4200, 4.8, 178, 'تصاميم كيك زفاف مخصصة بمكونات فاخرة.', NULL, NULL, NULL),
  ('gifts','توزيعات الفل','الرياض','https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&q=80', 1200, 4.8, 156, 'توزيعات أنيقة للضيوف بتغليف راقي.', NULL, NULL, NULL),
  ('gifts','هدايا الياسمين','جدة','https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80', 1500, 4.7, 112, 'توزيعات مخصصة بأسماء العروسين.', NULL, NULL, NULL)
) AS v(slug, name, city, image_url, price_from, rating, reviews_count, description, capacity, area_m2, parking)
ON c.slug = v.slug;

INSERT INTO public.vendor_packages (vendor_id, name, price, includes, sort_order)
SELECT id, 'باقة العروس الأساسية', 4500, 'مكياج عروس + تسريحة + جلسة تجربة', 1 FROM public.vendors WHERE name = 'صالون ميلانو'
UNION ALL
SELECT id, 'باقة العروس الذهبية', 7500, 'مكياج + تسريحة + عناية كاملة + جلسة تجربة + مكياج الأم', 2 FROM public.vendors WHERE name = 'صالون ميلانو'
UNION ALL
SELECT id, 'باقة التصوير الفضية', 7500, 'تصوير 6 ساعات + ألبوم + 100 صورة معدلة', 1 FROM public.vendors WHERE name = 'عدسة الذكريات'
UNION ALL
SELECT id, 'باقة التصوير الذهبية', 12000, 'تصوير كامل + فيديو سينمائي + ألبوم فاخر', 2 FROM public.vendors WHERE name = 'عدسة الذكريات'
UNION ALL
SELECT id, 'كوشة كلاسيكية', 15000, 'كوشة + ممر + ورد طبيعي + إضاءة', 1 FROM public.vendors WHERE name = 'كوش وردة'
UNION ALL
SELECT id, 'كوشة ملكية', 25000, 'كوشة فاخرة + ممر مزدوج + ثريات + ورد أوركيد', 2 FROM public.vendors WHERE name = 'كوش وردة';
