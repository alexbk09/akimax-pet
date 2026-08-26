-- ============================================================
-- akimax pet — Migración 0018: Seed razas resto de especies
-- ============================================================

-- RAZAS DE AVE (slug: ave)
insert into public.breeds (species_id, name, slug)
select s.id, 'Periquito Australiano', 'periquito' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cacatúa', 'cacatua' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Loro (Papagayo)', 'loro' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Guacamayo', 'guacamayo' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Canario', 'canario' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Agapornis (Inseparable)', 'agapornis' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cotorra Argentina', 'cotorra' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Yaco (Loro Gris Africano)', 'yaco' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Ninfa (Carolina)', 'ninfa' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Diamante Mandarín', 'diamante' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Jilguero', 'jilguero' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Pavo Real', 'pavo-real' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Otra raza', 'otra' from public.species s where s.slug = 'ave' on conflict (species_id, name) do nothing;

-- RAZAS DE CONEJO (slug: conejo)
insert into public.breeds (species_id, name, slug)
select s.id, 'Conejo Enano', 'enano' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Angora', 'angora' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Holland Lop', 'holland-lop' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mini Lop', 'mini-lop' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Rex', 'rex' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Flandes', 'flandes' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Belier', 'belier' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Californiano', 'californiano' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Nueva Zelanda', 'nueva-zelanda' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'conejo' on conflict (species_id, name) do nothing;

-- RAZAS DE ROEDOR (slug: roedor)
insert into public.breeds (species_id, name, slug)
select s.id, 'Hámster Ruso', 'hamster-ruso' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Hámster Sirio', 'hamster-sirio' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Hámster Chino', 'hamster-chino' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cobaya (Cuy)', 'cobaya' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Rata Doméstica', 'rata' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Ratón Doméstico', 'raton' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Jerbo', 'jerbo' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Degú', 'degu' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Chinchilla', 'chinchilla' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Ardilla', 'ardilla' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'roedor' on conflict (species_id, name) do nothing;

-- RAZAS DE REPTIL (slug: reptil)
insert into public.breeds (species_id, name, slug)
select s.id, 'Tortuga de Tierra', 'tortuga-tierra' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Tortuga de Agua', 'tortuga-agua' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Gecko Leopardo', 'gecko' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Camaleón', 'camaleon' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Iguana Verde', 'iguana' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Serpiente del Maíz', 'serpiente' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Pitón Real', 'piton' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Dragón Barbudo', 'dragon-barbudo' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Lagarto Tejú', 'lagarto' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Anolis', 'anolis' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'reptil' on conflict (species_id, name) do nothing;

-- RAZAS DE PEZ (slug: pez)
insert into public.breeds (species_id, name, slug)
select s.id, 'Goldfish (Carpín Dorado)', 'goldfish' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Betta', 'betta' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Guppy', 'guppy' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Neón Chino', 'neon' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Molly', 'molly' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Platy', 'platy' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Tetra', 'tetra' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Disco', 'disco' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Escalar (Pez Ángel)', 'escalar' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Carpa Koi', 'koi' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Pez Globo', 'pez-globo' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Pez Cirujano', 'cirujano' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'pez' on conflict (species_id, name) do nothing;

-- RAZAS DE EQUINO (slug: equino)
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Pura Sangre', 'pura-sangre' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Cuarto de Milla', 'cuarto-milla' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Poni Shetland', 'shetland' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Árabe', 'arabe' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Frisón', 'frison' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Criollo Venezolano', 'criollo' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Appaloosa', 'appaloosa' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Caballo Andaluz', 'andaluz' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'equino' on conflict (species_id, name) do nothing;

-- RAZAS DE HURÓN (slug: huron)
insert into public.breeds (species_id, name, slug)
select s.id, 'Hurón Sable', 'sable' from public.species s where s.slug = 'huron' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Hurón Albino', 'albino' from public.species s where s.slug = 'huron' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Hurón Chocolate', 'chocolate' from public.species s where s.slug = 'huron' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Hurón Panda', 'panda' from public.species s where s.slug = 'huron' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Hurón Canela', 'canela' from public.species s where s.slug = 'huron' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'huron' on conflict (species_id, name) do nothing;

-- RAZAS DE CERDO (slug: cerdo)
insert into public.breeds (species_id, name, slug)
select s.id, 'Cerdo Vietnamita', 'vietnamita' from public.species s where s.slug = 'cerdo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cerdo Mini', 'mini' from public.species s where s.slug = 'cerdo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cerdo Yorkshire', 'yorkshire' from public.species s where s.slug = 'cerdo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cerdo Landrace', 'landrace' from public.species s where s.slug = 'cerdo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cerdo Duroc', 'duroc' from public.species s where s.slug = 'cerdo' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'cerdo' on conflict (species_id, name) do nothing;

-- RAZAS DE CABRO (slug: cabro)
insert into public.breeds (species_id, name, slug)
select s.id, 'Cabro Alpino', 'alpino' from public.species s where s.slug = 'cabro' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cabro Saanen', 'saanen' from public.species s where s.slug = 'cabro' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cabro Nubio', 'nubio' from public.species s where s.slug = 'cabro' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cabro Enano Nigeriano', 'enano' from public.species s where s.slug = 'cabro' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Cabro Boer', 'boer' from public.species s where s.slug = 'cabro' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'cabro' on conflict (species_id, name) do nothing;

-- RAZAS DE OVEJA (slug: oveja)
insert into public.breeds (species_id, name, slug)
select s.id, 'Oveja Suffolk', 'suffolk' from public.species s where s.slug = 'oveja' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Oveja Merina', 'merina' from public.species s where s.slug = 'oveja' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Oveja Dorper', 'dorper' from public.species s where s.slug = 'oveja' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Oveja Hampshire', 'hampshire' from public.species s where s.slug = 'oveja' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Oveja Pelibuey', 'pelibuey' from public.species s where s.slug = 'oveja' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'oveja' on conflict (species_id, name) do nothing;

-- RAZAS DE VACA (slug: vaca)
insert into public.breeds (species_id, name, slug)
select s.id, 'Vaca Holstein', 'holstein' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Vaca Brahman', 'brahman' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Vaca Angus', 'angus' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Vaca Jersey', 'jersey' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Vaca Simmental', 'simmental' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Vaca Hereford', 'hereford' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'vaca' on conflict (species_id, name) do nothing;

-- RAZAS DE ANFIBIO (slug: anfibio)
insert into public.breeds (species_id, name, slug)
select s.id, 'Rana Arbórea', 'rana-arborea' from public.species s where s.slug = 'anfibio' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Rana Pacman', 'pacman' from public.species s where s.slug = 'anfibio' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Sapo Común', 'sapo' from public.species s where s.slug = 'anfibio' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Tritón', 'triton' from public.species s where s.slug = 'anfibio' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Ajolote', 'ajolote' from public.species s where s.slug = 'anfibio' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'anfibio' on conflict (species_id, name) do nothing;

-- RAZAS DE ARAÑA (slug: arana)
insert into public.breeds (species_id, name, slug)
select s.id, 'Tarántula Mexicana', 'tarantula' from public.species s where s.slug = 'arana' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Tarántula Chilena', 'tarantula-chilena' from public.species s where s.slug = 'arana' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Lobo (Lycosa)', 'lobo' from public.species s where s.slug = 'arana' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'arana' on conflict (species_id, name) do nothing;

-- RAZAS DE ESCORPIÓN (slug: escorpion)
insert into public.breeds (species_id, name, slug)
select s.id, 'Escorpión Emperador', 'emperador' from public.species s where s.slug = 'escorpion' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Escorpión de Corteza', 'corteza' from public.species s where s.slug = 'escorpion' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Escorpión Negro', 'negro' from public.species s where s.slug = 'escorpion' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Escorpión de Roca', 'roca' from public.species s where s.slug = 'escorpion' on conflict (species_id, name) do nothing;
insert into public.breeds (species_id, name, slug)
select s.id, 'Mestizo/Criollo', 'mestizo' from public.species s where s.slug = 'escorpion' on conflict (species_id, name) do nothing;