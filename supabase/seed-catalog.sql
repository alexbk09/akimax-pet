-- ============================================================
-- akimax pet — Seed: Categorías, productos y servicios
-- ============================================================

-- ---- Categorías ----
insert into public.categories (name, slug, type, status) values
  ('Alimentos', 'alimentos', 'Producto', 'Visible'),
  ('Accesorios', 'accesorios', 'Producto', 'Visible'),
  ('Cuidado', 'cuidado', 'Producto', 'Visible'),
  ('Consultas', 'consultas', 'Servicio', 'Visible'),
  ('Estética', 'estetica', 'Servicio', 'Visible'),
  ('Preventivo', 'preventivo', 'Servicio', 'Visible'),
  ('Especializado', 'especializado', 'Servicio', 'Visible')
on conflict (slug) do nothing;

-- ---- Productos ----
insert into public.products (name, slug, category_id, price, stock, weight, sku, description, status, tone, icon) values
  ('Alimento VitalCan Adulto', 'alimento-vitalcan-adulto', 1, 24.90, 12, '15 kg', 'VIT-001', 'Alimento balanceado para perros adultos.', 'Activo', 'bg-[#e8f3ef]', 'bag'),
  ('Collar Soft Touch', 'collar-soft-touch', 2, 12.50, 8, '120 g', 'COL-002', 'Collar acolchado ajustable.', 'Activo', 'bg-[#f1eee7]', 'collar'),
  ('Pipeta Antipulgas', 'pipeta-antipulgas', 3, 8.75, 4, '10 ml', 'CUI-003', 'Protección mensual contra pulgas y garrapatas.', 'Borrador', 'bg-[#e8eef4]', 'drop'),
  ('Cama Nube Mediana', 'cama-nube-mediana', 2, 39.00, 7, '2 kg', 'ACC-004', 'Cama acolchada para descanso profundo.', 'Activo', 'bg-[#edf0e7]', 'bed'),
  ('Snacks Dentales', 'snacks-dentales', 1, 6.40, 20, '250 g', 'ALI-005', 'Snacks que cuidan la salud dental.', 'Activo', 'bg-[#f4ede6]', 'bone'),
  ('Shampoo Dermoprotector', 'shampoo-dermoprotector', 3, 15.20, 9, '500 ml', 'CUI-006', 'Limpieza suave para piel sensible.', 'Activo', 'bg-[#e8f0f0]', 'bottle')
on conflict (slug) do nothing;

-- ---- Servicios ----
insert into public.services (name, slug, category_id, area, duration, description, status, tone, icon) values
  ('Consulta general', 'consulta-general', 4, 'Veterinaria', '30 min', 'Evaluación preventiva y diagnóstico.', 'Activo', 'bg-[#e7f1eb]', 'stethoscope'),
  ('Peluquería esencial', 'peluqueria-esencial', 5, 'Peluquería', '60 min', 'Baño, secado, cepillado y perfume hipoalergénico.', 'Activo', 'bg-[#f2ede5]', 'sparkles'),
  ('Vacunación preventiva', 'vacunacion-preventiva', 6, 'Veterinaria', '20 min', 'Esquema guiado según edad y especie.', 'Activo', 'bg-[#e6eef2]', 'syringe'),
  ('Peluquería premium', 'peluqueria-premium', 5, 'Peluquería', '90 min', 'Corte personalizado y spa de almohadillas.', 'Activo', 'bg-[#f3e8e2]', 'sparkles'),
  ('Cirugía especializada', 'cirugia-especializada', 7, 'Veterinaria', 'Según procedimiento', 'Procedimientos con seguimiento.', 'Activo', 'bg-[#e8e9f0]', 'syringe'),
  ('Odontología preventiva', 'odontologia-preventiva', 6, 'Veterinaria', '45 min', 'Revisión dental y limpieza.', 'Activo', 'bg-[#e5f0eb]', 'stethoscope')
on conflict (slug) do nothing;

-- ---- Tarifas de servicios ----
insert into public.service_prices (service_id, label, price) values
  (1, 'Perro pequeño · $25', 25.00),
  (1, 'Perro grande · $30', 30.00),
  (1, 'Gato · $25', 25.00),
  (2, 'Pequeño · $18', 18.00),
  (2, 'Mediano · $25', 25.00),
  (2, 'Grande · $35', 35.00),
  (3, 'Esquema base · $22', 22.00),
  (4, 'Pequeño · $32', 32.00),
  (4, 'Grande · $45', 45.00),
  (5, 'Desde · $120', 120.00),
  (6, 'Revisión + limpieza · $40', 40.00);