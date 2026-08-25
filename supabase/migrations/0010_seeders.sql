-- ============================================================
-- akimax pet — Migración 0010: Seeders consolidados (idempotentes)
-- Se ejecuta automáticamente con `supabase db push` o el script npm.
-- ============================================================

-- ---- Roles y permisos ----
insert into public.roles (name, slug, description, permissions) values
  ('Administrador', 'administrador', 'Acceso completo al sistema.', array['dashboard:view','catalog:view','catalog:manage','appointments:view','appointments:manage','patients:view','patients:manage','cash:view','cash:manage','sales:view','sales:manage','customers:view','customers:manage','users:manage','roles:manage','reports:view','inventory:manage']),
  ('Veterinario', 'veterinario', 'Agenda, pacientes e historias clínicas.', array['dashboard:view','appointments:view','appointments:manage','patients:view','patients:manage','catalog:view','reports:view']),
  ('Caja', 'caja', 'Ventas, caja y facturación.', array['dashboard:view','cash:view','cash:manage','sales:view','sales:manage','customers:view','customers:manage','catalog:view','reports:view']),
  ('Cliente', 'cliente', 'Panel personal, citas y mascotas.', array['dashboard:view','appointments:view','patients:view'])
on conflict (name) do nothing;

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

-- ---- Clientes ----
insert into public.customers (name, email, phone, document, address, status) values
  ('María Fernanda Soto', 'maria@email.com', '+58 424 000 2188', 'V-25487123', 'Las Mercedes, Caracas', 'Activo'),
  ('Jorge Villalba', 'jorge@email.com', '+58 412 000 7712', 'V-19845320', 'Chacao, Caracas', 'Activo'),
  ('Valentina Díaz', 'valentina@email.com', '+58 426 000 4431', 'V-30125478', 'El Hatillo, Caracas', 'Activo'),
  ('Carolina Silva', 'carolina@email.com', '+58 414 000 9901', 'V-17896547', 'Baruta, Caracas', 'Activo'),
  ('Pedro González', 'pedro@email.com', '+58 416 000 3345', 'V-22145087', 'La Florida, Caracas', 'Activo');

-- ---- Mascotas ----
insert into public.pets (customer_id, name, species, breed, birth_date, weight_kg, color) values
  (1, 'Luna', 'Golden Retriever', 'Golden Retriever', '2020-05-12', 18.5, 'bg-[#e7f0df]'),
  (1, 'Simón', 'Gato mestizo', 'Mestizo', '2022-08-03', 4.2, 'bg-[#e9e6f1]'),
  (2, 'Max', 'Pastor Alemán', 'Pastor Alemán', '2019-02-20', 28.0, 'bg-[#f1eee7]'),
  (3, 'Nina', 'Bulldog Francés', 'Bulldog Francés', '2021-11-15', 11.3, 'bg-[#e8eef4]'),
  (4, 'Toby', 'Beagle', 'Beagle', '2023-01-08', 9.8, 'bg-[#f4ede6]');

-- ---- Historias clínicas ----
insert into public.medical_records (pet_id, date, title, detail, type) values
  (1, '2025-06-12', 'Control anual', 'Todo en orden. Peso saludable y energía excelente.', 'Control'),
  (1, '2025-04-03', 'Vacuna séxtuple', 'Aplicación registrada. Próxima dosis en 2026.', 'Vacuna'),
  (1, '2025-01-18', 'Desparasitación', 'Tratamiento oral administrado en consulta.', 'Desparasitación'),
  (2, '2025-04-03', 'Vacuna triple', 'Aplicación registrada. Próxima dosis en 2026.', 'Vacuna');

-- ---- Citas ----
insert into public.appointments (customer_id, pet_id, service_id, date, time, status, notes) values
  (1, 1, 1, '2026-06-19', '09:00', 'Confirmada', 'Control anual de Luna'),
  (2, 3, 2, '2026-06-19', '10:30', 'En espera', 'Baño y corte'),
  (1, 2, 3, '2026-06-20', '11:00', 'Confirmada', 'Vacuna de refuerzo'),
  (4, 5, 1, '2026-06-19', '12:00', 'Confirmada', 'Consulta general'),
  (3, 4, 5, '2026-06-21', '15:00', 'En espera', 'Valoración quirúrgica');

-- ---- Ventas demo ----
insert into public.sales (customer_id, subtotal_usd, total_usd, total_ves, payment_method, status) values
  (1, 37.40, 37.40, 3700.00, 'Efectivo USD', 'Pagada'),
  (2, 18.00, 18.00, 1800.00, 'Tarjeta', 'Pagada'),
  (3, 24.90, 24.90, 2490.00, 'Pago móvil', 'Pagada');

insert into public.sale_items (sale_id, item_id, name, kind, price, quantity) values
  (1, 'p-1', 'Alimento VitalCan Adulto', 'Producto', 24.90, 1),
  (1, 'p-5', 'Snacks Dentales', 'Producto', 6.40, 1),
  (2, 's-2', 'Peluquería esencial', 'Servicio', 18.00, 1),
  (3, 'p-1', 'Alimento VitalCan Adulto', 'Producto', 24.90, 1);

-- ---- Tasa de cambio inicial ----
insert into public.exchange_rates (currency, rate, source) values ('USD', 131.42, 'manual');