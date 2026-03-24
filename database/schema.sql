-- ============================================================
-- ARAUCA OPINA - Esquema de base de datos para Supabase
-- Gobernación de Arauca, Colombia
-- ============================================================
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================


-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLA: usuarios
-- Perfil de ciudadanos registrados
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL CHECK (length(nombre) >= 3),
  correo      TEXT UNIQUE NOT NULL,
  celular     TEXT,
  municipio   TEXT NOT NULL,
  rol         TEXT NOT NULL DEFAULT 'ciudadano' CHECK (rol IN ('ciudadano', 'administrador')),
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.usuarios IS 'Perfil de ciudadanos registrados en Arauca Opina';
COMMENT ON COLUMN public.usuarios.rol IS 'ciudadano | administrador';


-- ============================================================
-- TABLA: encuestas
-- Encuestas ciudadanas creadas por la Gobernación
-- ============================================================
CREATE TABLE IF NOT EXISTS public.encuestas (
  id            BIGSERIAL PRIMARY KEY,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  fecha_inicio  DATE,
  fecha_fin     DATE,
  estado        TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activa', 'cerrada', 'archivada')),
  creado_por    UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.encuestas IS 'Encuestas ciudadanas publicadas por la Gobernación';
COMMENT ON COLUMN public.encuestas.estado IS 'borrador | activa | cerrada | archivada';


-- ============================================================
-- TABLA: preguntas
-- Preguntas de cada encuesta
-- ============================================================
CREATE TABLE IF NOT EXISTS public.preguntas (
  id           BIGSERIAL PRIMARY KEY,
  encuesta_id  BIGINT NOT NULL REFERENCES public.encuestas(id) ON DELETE CASCADE,
  texto        TEXT NOT NULL,
  tipo         TEXT NOT NULL DEFAULT 'opcion_multiple' CHECK (tipo IN ('opcion_multiple', 'si_no', 'escala')),
  orden        INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.preguntas IS 'Preguntas de las encuestas';
COMMENT ON COLUMN public.preguntas.tipo IS 'opcion_multiple | si_no | escala';


-- ============================================================
-- TABLA: opciones
-- Opciones de respuesta para cada pregunta
-- ============================================================
CREATE TABLE IF NOT EXISTS public.opciones (
  id           BIGSERIAL PRIMARY KEY,
  pregunta_id  BIGINT NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
  texto        TEXT NOT NULL,
  orden        INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.opciones IS 'Opciones de respuesta para preguntas de encuesta';


-- ============================================================
-- TABLA: respuestas
-- Respuestas de ciudadanos a preguntas de encuestas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.respuestas (
  id           BIGSERIAL PRIMARY KEY,
  usuario_id   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  pregunta_id  BIGINT NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
  opcion_id    BIGINT NOT NULL REFERENCES public.opciones(id) ON DELETE CASCADE,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un ciudadano solo puede responder una vez por pregunta
  UNIQUE (usuario_id, pregunta_id)
);

COMMENT ON TABLE public.respuestas IS 'Respuestas de ciudadanos a encuestas';


-- ============================================================
-- TABLA: proyectos
-- Proyectos de inversión publicados por la Gobernación
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proyectos (
  id               BIGSERIAL PRIMARY KEY,
  titulo           TEXT NOT NULL,
  descripcion      TEXT,
  tema             TEXT NOT NULL DEFAULT 'General',
  estado           TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'en_ejecucion', 'finalizado')),
  presupuesto      NUMERIC(15, 2),
  municipio        TEXT,
  imagen_url       TEXT,
  fecha_publicacion DATE,
  creado_por       UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.proyectos IS 'Proyectos de inversión de la Gobernación de Arauca';
COMMENT ON COLUMN public.proyectos.estado IS 'borrador | publicado | en_ejecucion | finalizado';
COMMENT ON COLUMN public.proyectos.tema IS 'Sector del proyecto: Educación, Salud, Infraestructura, etc.';


-- ============================================================
-- TABLA: votos_proyectos
-- Valoraciones ciudadanas sobre proyectos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votos_proyectos (
  id           BIGSERIAL PRIMARY KEY,
  proyecto_id  BIGINT NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  valoracion   SMALLINT NOT NULL CHECK (valoracion BETWEEN 1 AND 5),
  comentario   TEXT,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un ciudadano solo puede votar una vez por proyecto
  UNIQUE (proyecto_id, usuario_id)
);

COMMENT ON TABLE public.votos_proyectos IS 'Valoraciones de ciudadanos sobre proyectos de inversión';


-- ============================================================
-- TABLA: propuestas
-- Ideas y propuestas enviadas por ciudadanos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.propuestas (
  id           BIGSERIAL PRIMARY KEY,
  usuario_id   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  descripcion  TEXT NOT NULL,
  tema         TEXT NOT NULL DEFAULT 'General',
  estado       TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'aprobada', 'rechazada')),
  estrellas    NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  total_votos  INTEGER NOT NULL DEFAULT 0,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.propuestas IS 'Propuestas ciudadanas enviadas a la Gobernación';
COMMENT ON COLUMN public.propuestas.estrellas IS 'Promedio de estrellas (0-5)';


-- ============================================================
-- TABLA: votos_propuestas
-- Puntuación de ciudadanos a propuestas de otros
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votos_propuestas (
  id            BIGSERIAL PRIMARY KEY,
  propuesta_id  BIGINT NOT NULL REFERENCES public.propuestas(id) ON DELETE CASCADE,
  usuario_id    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  estrellas     SMALLINT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  fecha         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un ciudadano solo puede votar una vez por propuesta
  UNIQUE (propuesta_id, usuario_id)
);

COMMENT ON TABLE public.votos_propuestas IS 'Puntuaciones de ciudadanos a propuestas ciudadanas';


-- ============================================================
-- TABLA: codigos_qr
-- Registro de códigos QR generados institucionalmente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.codigos_qr (
  id            BIGSERIAL PRIMARY KEY,
  tipo          TEXT NOT NULL CHECK (tipo IN ('encuesta', 'proyecto', 'propuesta')),
  referencia_id BIGINT NOT NULL,
  url           TEXT NOT NULL,
  escaneos      INTEGER NOT NULL DEFAULT 0,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un solo QR por tipo+referencia
  UNIQUE (tipo, referencia_id)
);

COMMENT ON TABLE public.codigos_qr IS 'Códigos QR institucionales generados para encuestas y proyectos';


-- ============================================================
-- ÍNDICES para optimizar consultas frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_respuestas_usuario    ON public.respuestas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_pregunta   ON public.respuestas(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_encuesta    ON public.preguntas(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_opciones_pregunta     ON public.opciones(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_propuestas_usuario    ON public.propuestas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_propuestas_tema       ON public.propuestas(tema);
CREATE INDEX IF NOT EXISTS idx_votos_proyectos_proj  ON public.votos_proyectos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_votos_propuestas_prop ON public.votos_propuestas(propuesta_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_estado      ON public.encuestas(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado      ON public.proyectos(estado);


-- ============================================================
-- FUNCIÓN: actualizar_estrellas_propuesta
-- Recalcula el promedio de estrellas de una propuesta
-- ============================================================
CREATE OR REPLACE FUNCTION public.actualizar_estrellas_propuesta(p_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.propuestas
  SET
    estrellas   = COALESCE((
      SELECT AVG(estrellas::NUMERIC)
      FROM public.votos_propuestas
      WHERE propuesta_id = p_id
    ), 0),
    total_votos = (
      SELECT COUNT(*)
      FROM public.votos_propuestas
      WHERE propuesta_id = p_id
    )
  WHERE id = p_id;
END;
$$;


-- ============================================================
-- TRIGGER: auto-actualizar estrellas al insertar voto
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_actualizar_estrellas()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.actualizar_estrellas_propuesta(NEW.propuesta_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_actualizar_estrellas ON public.votos_propuestas;
CREATE TRIGGER tr_actualizar_estrellas
  AFTER INSERT OR UPDATE ON public.votos_propuestas
  FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_estrellas();


-- ============================================================
-- TRIGGER: actualizar timestamp en encuestas y proyectos
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_actualizar_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_encuestas_updated_at ON public.encuestas;
CREATE TRIGGER tr_encuestas_updated_at
  BEFORE UPDATE ON public.encuestas
  FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_timestamp();

DROP TRIGGER IF EXISTS tr_proyectos_updated_at ON public.proyectos;
CREATE TRIGGER tr_proyectos_updated_at
  BEFORE UPDATE ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_timestamp();


-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Políticas de seguridad
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opciones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_proyectos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propuestas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_propuestas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_qr        ENABLE ROW LEVEL SECURITY;


-- ===== POLÍTICAS: usuarios =====
CREATE POLICY "usuarios_ver_publico" ON public.usuarios
  FOR SELECT USING (true);

CREATE POLICY "usuarios_editar_propio" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "usuarios_insertar_propio" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ===== POLÍTICAS: encuestas =====
CREATE POLICY "encuestas_ver_activas" ON public.encuestas
  FOR SELECT USING (estado = 'activa' OR auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));

CREATE POLICY "encuestas_admin_gestionar" ON public.encuestas
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));


-- ===== POLÍTICAS: preguntas y opciones (lectura pública) =====
CREATE POLICY "preguntas_ver" ON public.preguntas
  FOR SELECT USING (true);

CREATE POLICY "preguntas_admin" ON public.preguntas
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));

CREATE POLICY "opciones_ver" ON public.opciones
  FOR SELECT USING (true);

CREATE POLICY "opciones_admin" ON public.opciones
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));


-- ===== POLÍTICAS: respuestas =====
CREATE POLICY "respuestas_ver_propias" ON public.respuestas
  FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));

CREATE POLICY "respuestas_insertar_propio" ON public.respuestas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);


-- ===== POLÍTICAS: proyectos =====
CREATE POLICY "proyectos_ver_publicados" ON public.proyectos
  FOR SELECT USING (estado != 'borrador' OR auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));

CREATE POLICY "proyectos_admin" ON public.proyectos
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));


-- ===== POLÍTICAS: votos_proyectos =====
CREATE POLICY "votos_proyectos_ver" ON public.votos_proyectos
  FOR SELECT USING (true);

CREATE POLICY "votos_proyectos_insertar" ON public.votos_proyectos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);


-- ===== POLÍTICAS: propuestas =====
CREATE POLICY "propuestas_ver_aprobadas" ON public.propuestas
  FOR SELECT USING (estado != 'rechazada' OR auth.uid() = usuario_id OR auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));

CREATE POLICY "propuestas_insertar_propio" ON public.propuestas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "propuestas_admin" ON public.propuestas
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));


-- ===== POLÍTICAS: votos_propuestas =====
CREATE POLICY "votos_propuestas_ver" ON public.votos_propuestas
  FOR SELECT USING (true);

CREATE POLICY "votos_propuestas_insertar" ON public.votos_propuestas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);


-- ===== POLÍTICAS: codigos_qr =====
CREATE POLICY "qr_ver" ON public.codigos_qr
  FOR SELECT USING (true);

CREATE POLICY "qr_admin" ON public.codigos_qr
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.usuarios WHERE rol = 'administrador'
  ));


-- ============================================================
-- DATOS DE EJEMPLO (opcionales - para pruebas)
-- ============================================================

-- Encuesta de ejemplo (descomentar para pruebas)
/*
INSERT INTO public.encuestas (titulo, descripcion, estado, fecha_inicio, fecha_fin)
VALUES (
  '¿Cómo califica los servicios de salud en su municipio?',
  'Encuesta para medir la satisfacción de los ciudadanos con los servicios de salud departamentales.',
  'activa',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
);

INSERT INTO public.preguntas (encuesta_id, texto, tipo, orden)
VALUES
  (1, '¿Con qué frecuencia utiliza los servicios de salud pública?', 'opcion_multiple', 1),
  (1, '¿Cómo califica la atención recibida?', 'escala', 2);

INSERT INTO public.opciones (pregunta_id, texto, orden)
VALUES
  (1, 'Nunca', 1),
  (1, 'Pocas veces al año', 2),
  (1, 'Mensualmente', 3),
  (1, 'Semanalmente', 4),
  (2, 'Muy mala', 1),
  (2, 'Mala', 2),
  (2, 'Regular', 3),
  (2, 'Buena', 4),
  (2, 'Excelente', 5);
*/


-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================
