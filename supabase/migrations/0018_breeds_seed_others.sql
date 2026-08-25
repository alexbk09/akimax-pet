-- ============================================================
-- akimax pet — Migración 0018: Seed razas resto de especies
-- ============================================================

-- RAZAS DE AVE (species_id 3)
insert into public.breeds (species_id, name, slug) values
  (3, 'Periquito Australiano', 'periquito'),
  (3, 'Cacatúa', 'cacatua'),
  (3, 'Loro (Papagayo)', 'loro'),
  (3, 'Guacamayo', 'guacamayo'),
  (3, 'Canario', 'canario'),
  (3, 'Agapornis (Inseparable)', 'agapornis'),
  (3, 'Cotorra Argentina', 'cotorra'),
  (3, 'Yaco (Loro Gris Africano)', 'yaco'),
  (3, 'Ninfa (Carolina)', 'ninfa'),
  (3, 'Diamante Mandarín', 'diamante'),
  (3, 'Jilguero', 'jilguero'),
  (3, 'Pavo Real', 'pavo-real'),
  (3, 'Otra raza', 'otra')
on conflict (species_id, name) do nothing;

-- RAZAS DE CONEJO (species_id 4)
insert into public.breeds (species_id, name, slug) values
  (4, 'Conejo Enano', 'enano'),
  (4, 'Angora', 'angora'),
  (4, 'Holland Lop', 'holland-lop'),
  (4, 'Mini Lop', 'mini-lop'),
  (4, 'Rex', 'rex'),
  (4, 'Flandes', 'flandes'),
  (4, 'Belier', 'belier'),
  (4, 'Californiano', 'californiano'),
  (4, 'Nueva Zelanda', 'nueva-zelanda'),
  (4, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE ROEDOR (species_id 5)
insert into public.breeds (species_id, name, slug) values
  (5, 'Hámster Ruso', 'hamster-ruso'),
  (5, 'Hámster Sirio', 'hamster-sirio'),
  (5, 'Hámster Chino', 'hamster-chino'),
  (5, 'Cobaya (Cuy)', 'cobaya'),
  (5, 'Rata Doméstica', 'rata'),
  (5, 'Ratón Doméstico', 'raton'),
  (5, 'Jerbo', 'jerbo'),
  (5, 'Degú', 'degu'),
  (5, 'Chinchilla', 'chinchilla'),
  (5, 'Ardilla', 'ardilla'),
  (5, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE REPTIL (species_id 6)
insert into public.breeds (species_id, name, slug) values
  (6, 'Tortuga de Tierra', 'tortuga-tierra'),
  (6, 'Tortuga de Agua', 'tortuga-agua'),
  (6, 'Gecko Leopardo', 'gecko'),
  (6, 'Camaleón', 'camaleon'),
  (6, 'Iguana Verde', 'iguana'),
  (6, 'Serpiente del Maíz', 'serpiente'),
  (6, 'Pitón Real', 'piton'),
  (6, 'Dragón Barbudo', 'dragon-barbudo'),
  (6, 'Lagarto Tejú', 'lagarto'),
  (6, 'Anolis', 'anolis'),
  (6, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE PEZ (species_id 7)
insert into public.breeds (species_id, name, slug) values
  (7, 'Goldfish (Carpín Dorado)', 'goldfish'),
  (7, 'Betta', 'betta'),
  (7, 'Guppy', 'guppy'),
  (7, 'Neón Chino', 'neon'),
  (7, 'Molly', 'molly'),
  (7, 'Platy', 'platy'),
  (7, 'Tetra', 'tetra'),
  (7, 'Disco', 'disco'),
  (7, 'Escalar (Pez Ángel)', 'escalar'),
  (7, 'Carpa Koi', 'koi'),
  (7, 'Pez Globo', 'pez-globo'),
  (7, 'Pez Cirujano', 'cirujano'),
  (7, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE EQUINO (species_id 8)
insert into public.breeds (species_id, name, slug) values
  (8, 'Caballo Pura Sangre', 'pura-sangre'),
  (8, 'Caballo Cuarto de Milla', 'cuarto-milla'),
  (8, 'Poni Shetland', 'shetland'),
  (8, 'Caballo Árabe', 'arabe'),
  (8, 'Caballo Frisón', 'frison'),
  (8, 'Caballo Criollo Venezolano', 'criollo'),
  (8, 'Caballo Appaloosa', 'appaloosa'),
  (8, 'Caballo Andaluz', 'andaluz'),
  (8, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE HURÓN (species_id 9)
insert into public.breeds (species_id, name, slug) values
  (9, 'Hurón Sable', 'sable'),
  (9, 'Hurón Albino', 'albino'),
  (9, 'Hurón Chocolate', 'chocolate'),
  (9, 'Hurón Panda', 'panda'),
  (9, 'Hurón Canela', 'canela'),
  (9, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE CERDO (species_id 10)
insert into public.breeds (species_id, name, slug) values
  (10, 'Cerdo Vietnamita', 'vietnamita'),
  (10, 'Cerdo Mini', 'mini'),
  (10, 'Cerdo Yorkshire', 'yorkshire'),
  (10, 'Cerdo Landrace', 'landrace'),
  (10, 'Cerdo Duroc', 'duroc'),
  (10, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE CABRO (species_id 11)
insert into public.breeds (species_id, name, slug) values
  (11, 'Cabro Alpino', 'alpino'),
  (11, 'Cabro Saanen', 'saanen'),
  (11, 'Cabro Nubio', 'nubio'),
  (11, 'Cabro Enano Nigeriano', 'enano'),
  (11, 'Cabro Boer', 'boer'),
  (11, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE OVEJA (species_id 12)
insert into public.breeds (species_id, name, slug) values
  (12, 'Oveja Suffolk', 'suffolk'),
  (12, 'Oveja Merina', 'merina'),
  (12, 'Oveja Dorper', 'dorper'),
  (12, 'Oveja Hampshire', 'hampshire'),
  (12, 'Oveja Pelibuey', 'pelibuey'),
  (12, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE VACA (species_id 13)
insert into public.breeds (species_id, name, slug) values
  (13, 'Vaca Holstein', 'holstein'),
  (13, 'Vaca Brahman', 'brahman'),
  (13, 'Vaca Angus', 'angus'),
  (13, 'Vaca Jersey', 'jersey'),
  (13, 'Vaca Simmental', 'simmental'),
  (13, 'Vaca Hereford', 'hereford'),
  (13, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE ANFIBIO (species_id 14)
insert into public.breeds (species_id, name, slug) values
  (14, 'Rana Arbórea', 'rana-arborea'),
  (14, 'Rana Pacman', 'pacman'),
  (14, 'Sapo Común', 'sapo'),
  (14, 'Tritón', 'triton'),
  (14, 'Ajolote', 'ajolote'),
  (14, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE ARAÑA (species_id 15)
insert into public.breeds (species_id, name, slug) values
  (15, 'Tarántula Mexicana', 'tarantula'),
  (15, 'Tarántula Chilena', 'tarantula-chilena'),
  (15, 'Lobo (Lycosa)', 'lobo'),
  (15, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;

-- RAZAS DE ESCORPIÓN (species_id 16)
insert into public.breeds (species_id, name, slug) values
  (16, 'Escorpión Emperador', 'emperador'),
  (16, 'Escorpión de Corteza', 'corteza'),
  (16, 'Escorpión Negro', 'negro'),
  (16, 'Escorpión de Roca', 'roca'),
  (16, 'Mestizo/Criollo', 'mestizo')
on conflict (species_id, name) do nothing;