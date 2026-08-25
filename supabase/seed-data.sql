-- ============================================================
-- akimax pet — Seed: Clientes, mascotas, citas y ventas demo
-- ============================================================

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