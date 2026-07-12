# SecretGift MVP - ESPECIFICACIÓN TÉCNICA SUPABASE (24h build)

**Objetivo:** MVP funcional con Supabase (PostgreSQL real). 
**Stack:** React + Vite + Supabase + Tailwind

---

## 🛠️ STACK TÉCNICO (Supabase)

| Capa | Tecnología | Por qué |
|------|-----------|--------|
| **Frontend** | React + Vite | Build rápido |
| **Backend** | Supabase | PostgreSQL + Auth + Storage en 1 |
| **DB** | PostgreSQL | SQL real, relaciones normalizadas |
| **Auth** | Supabase Auth | Email/password, idéntico a Firebase |
| **Emails** | Resend + Edge Function | Reminders desde servidor |
| **Hosting** | Vercel (frontend) + Supabase (backend) | Deploy gratis |
| **Extras** | None | Sin APIs externas |

---

## 📊 DATA MODEL SQL (PostgreSQL en Supabase)

### **Table: `usuarios`**
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS Policy: Users see only their data
```

### **Table: `eventos`**
```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  presupuesto DECIMAL(10,2) NOT NULL,
  receptor_id UUID NOT NULL REFERENCES usuarios(id),
  receptor_nombre TEXT NOT NULL,
  receptor_email TEXT NOT NULL,
  fecha_compra DATE NOT NULL,
  fecha_revelacion DATE NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
  codigo_acceso TEXT UNIQUE NOT NULL, -- ABC123
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_eventos_admin ON eventos(admin_id);
CREATE INDEX idx_eventos_codigo ON eventos(codigo_acceso);
CREATE INDEX idx_eventos_receptor ON eventos(receptor_id);
```

### **Table: `participantes`**
```sql
CREATE TABLE participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('comprador', 'receptor')),
  estado TEXT DEFAULT 'confirmado' CHECK (estado IN ('invitado', 'confirmado', 'cancelado')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(evento_id, usuario_id)
);

CREATE INDEX idx_participantes_evento ON participantes(evento_id);
CREATE INDEX idx_participantes_usuario ON participantes(usuario_id);
```

### **Table: `preferencias`**
```sql
CREATE TABLE preferencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  deseos TEXT[] NOT NULL DEFAULT '{}', -- Array: ["Audífonos", "Mochila", ...]
  restricciones TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(evento_id, usuario_id)
);

CREATE INDEX idx_preferencias_evento ON preferencias(evento_id);
```

### **Table: `asignaciones`**
```sql
CREATE TABLE asignaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  comprador_id UUID NOT NULL REFERENCES usuarios(id),
  receptor_id UUID NOT NULL REFERENCES usuarios(id),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'comprado', 'entregado')),
  comprado_at TIMESTAMP,
  nota_comprador TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(evento_id, comprador_id)
);

CREATE INDEX idx_asignaciones_evento ON asignaciones(evento_id);
CREATE INDEX idx_asignaciones_comprador ON asignaciones(comprador_id);
```

---

## 🔒 ROW LEVEL SECURITY (RLS) - CRÍTICO

Supabase RLS policies:

### **usuarios table:**
```sql
-- Users see own data
CREATE POLICY "Users view own data" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own data" ON usuarios
  FOR UPDATE USING (auth.uid() = id);
```

### **eventos table:**
```sql
-- Admin sees own eventos
CREATE POLICY "Admins view own eventos" ON eventos
  FOR SELECT USING (auth.uid() = admin_id);

-- Participants see evento if they're in participantes
CREATE POLICY "Participants view evento" ON eventos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participantes
      WHERE participantes.evento_id = eventos.id
      AND participantes.usuario_id = auth.uid()
    )
  );

-- Only admin can create
CREATE POLICY "Admin creates evento" ON eventos
  FOR INSERT WITH CHECK (auth.uid() = admin_id);
```

### **participantes table:**
```sql
-- Users see participantes where they're involved
CREATE POLICY "Users view participantes of their eventos" ON participantes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = participantes.evento_id
      AND (eventos.admin_id = auth.uid() OR participantes.usuario_id = auth.uid())
    )
  );

-- Admin can add participantes
CREATE POLICY "Admin adds participantes" ON participantes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = participantes.evento_id
      AND eventos.admin_id = auth.uid()
    )
  );
```

### **asignaciones table:**
```sql
-- Users see asignaciones where they're comprador OR si admin del evento
CREATE POLICY "Users view own asignaciones" ON asignaciones
  FOR SELECT USING (
    auth.uid() = comprador_id OR
    EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = asignaciones.evento_id
      AND eventos.admin_id = auth.uid()
    )
  );

-- Comprador actualiza estado (marcar "Compré")
CREATE POLICY "Comprador updates estado" ON asignaciones
  FOR UPDATE USING (auth.uid() = comprador_id)
  WITH CHECK (auth.uid() = comprador_id);
```

### **preferencias table:**
```sql
-- Receptor ve sus preferencias
CREATE POLICY "Users view own preferencias" ON preferencias
  FOR SELECT USING (auth.uid() = usuario_id);

-- Compradores ven preferencias del receptor
CREATE POLICY "Compradores view receptor preferencias" ON preferencias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM asignaciones
      WHERE asignaciones.evento_id = preferencias.evento_id
      AND asignaciones.receptor_id = preferencias.usuario_id
      AND asignaciones.comprador_id = auth.uid()
    )
  );
```

---

## 🔄 FLUJOS PRINCIPALES (SQL)

### **Flujo 1: Crear evento**
```sql
-- INSERT eventos
INSERT INTO eventos (
  admin_id, nombre, presupuesto, 
  receptor_id, receptor_nombre, receptor_email,
  fecha_compra, fecha_revelacion, codigo_acceso
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, codigo_acceso;

-- INSERT receptor como participante
INSERT INTO participantes (
  evento_id, usuario_id, rol, estado
) VALUES ($evento_id, $receptor_id, 'receptor', 'confirmado');

-- Trigger: Enviar email invitación al receptor
-- (Supabase Function escuchará este INSERT)
```

### **Flujo 2: Join evento (por código)**
```sql
-- SELECT evento por codigo_acceso
SELECT id, nombre, presupuesto, fecha_compra
FROM eventos WHERE codigo_acceso = $codigo;

-- INSERT participante (comprador)
INSERT INTO participantes (
  evento_id, usuario_id, rol, estado
) VALUES ($evento_id, $usuario_id, 'comprador', 'confirmado');
```

### **Flujo 3: Registrar preferencias (receptor)**
```sql
-- UPSERT preferencias
INSERT INTO preferencias (
  evento_id, usuario_id, deseos, restricciones
) VALUES ($evento_id, $usuario_id, $deseos::text[], $restricciones)
ON CONFLICT (evento_id, usuario_id) DO UPDATE
SET deseos = $deseos::text[], restricciones = $restricciones;
```

### **Flujo 4: Asignar regalos (admin)**
```sql
-- Validar: ≥2 compradores
SELECT COUNT(*) FROM participantes
WHERE evento_id = $evento_id AND rol = 'comprador';

-- Validar: receptor tiene preferencias
SELECT 1 FROM preferencias
WHERE evento_id = $evento_id;

-- INSERT asignaciones (desde lógica app)
-- [Algoritmo en TypeScript]
INSERT INTO asignaciones (evento_id, comprador_id, receptor_id)
VALUES 
  ($evento_id, $comprador_1, $receptor_id),
  ($evento_id, $comprador_2, $receptor_id),
  ...
```

### **Flujo 5: Marcar "Compré"**
```sql
-- UPDATE asignacion
UPDATE asignaciones
SET estado = 'comprado', comprado_at = now()
WHERE id = $asignacion_id AND comprador_id = auth.uid();
```

### **Flujo 6: Ver asignación (secreto preservado)**
```sql
-- Usuario comprador obtiene su asignación
SELECT 
  asignaciones.id,
  asignaciones.estado,
  asignaciones.comprado_at,
  -- NO MOSTRAR: asignaciones.receptor_id hasta revelación
  preferencias.deseos,
  preferencias.restricciones,
  eventos.presupuesto,
  eventos.fecha_compra
FROM asignaciones
JOIN preferencias ON asignaciones.receptor_id = preferencias.usuario_id
JOIN eventos ON asignaciones.evento_id = eventos.id
WHERE asignaciones.comprador_id = auth.uid()
  AND asignaciones.evento_id = $evento_id;
```

### **Flujo 7: Revelar (UPDATE estado evento)**
```sql
UPDATE eventos
SET estado = 'completado'
WHERE id = $evento_id AND admin_id = auth.uid()
  AND fecha_revelacion <= now();
```

---

## 📧 EMAILS (Supabase Edge Functions)

### **Edge Function: send-invitation**
```typescript
// supabase/functions/send-invitation/index.ts
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  const { email, eventoNombre, codigoAcceso, appUrl } = await req.json();

  try {
    const result = await resend.emails.send({
      from: "SecretGift <noreply@secretgift.com>",
      to: email,
      subject: `¡Te invitaron a ${eventoNombre}!`,
      html: `
        <h1>🎁 ${eventoNombre}</h1>
        <p>¡Fulanito te invitó a participar en un intercambio de regalos!</p>
        <a href="${appUrl}/join?code=${codigoAcceso}">
          Aceptar invitación
        </a>
      `
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

### **Edge Function: send-reminder**
```typescript
// supabase/functions/send-reminder/index.ts
import { createClient } from "npm:@supabase/supabase-js";
import { Resend } from "npm:resend";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  // Query: asignaciones con estado='pendiente' y fecha_compra - hoy = 7 dias
  const { data, error } = await supabase
    .from("asignaciones")
    .select(`
      id,
      comprador_id,
      receptor_id,
      evento_id,
      usuarios!comprador_id(email),
      eventos(nombre, presupuesto, fecha_compra),
      preferencias!asignaciones_receptor_id(deseos)
    `)
    .eq("estado", "pendiente")
    .lte("eventos.fecha_compra", new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0])
    .gte("eventos.fecha_compra", new Date(Date.now() + 6*24*60*60*1000).toISOString().split('T')[0]);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // Enviar emails
  for (const asignacion of data || []) {
    await resend.emails.send({
      from: "SecretGift <noreply@secretgift.com>",
      to: asignacion.usuarios.email,
      subject: "⏰ 7 días para comprar tu regalo",
      html: `<p>Tienes 7 días para comprar para <strong>${asignacion.eventos.nombre}</strong></p>`
    });
  }

  return new Response(JSON.stringify({ sent: data?.length || 0 }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

---

## 🔧 SERVICIOS FRONTEND (Supabase Client)

### **src/services/supabase.ts**
```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### **src/services/eventos.ts**
```typescript
import { supabase } from "./supabase";
import { v4 as uuid } from "uuid";

// Crear evento
export async function crearEvento(data: {
  nombre: string;
  presupuesto: number;
  receptorId: string;
  receptorNombre: string;
  receptorEmail: string;
  fechaCompra: string;
  fechaRevelacion: string;
}) {
  const { user } = await supabase.auth.getUser();
  const codigoAcceso = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: evento, error } = await supabase
    .from("eventos")
    .insert({
      admin_id: user.id,
      ...data,
      codigo_acceso: codigoAcceso
    })
    .select()
    .single();

  if (error) throw error;
  return evento;
}

// Get evento por codigo
export async function obtenerEventoPorCodigo(codigo: string) {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("codigo_acceso", codigo)
    .single();

  if (error) throw error;
  return data;
}

// Get eventos del usuario (admin o participante)
export async function obtenerMisEventos() {
  const { data, error } = await supabase
    .from("eventos")
    .select("*, participantes(evento_id)")
    .order("fecha_compra", { ascending: true });

  if (error) throw error;
  return data;
}

// Asignar regalos
export async function asignarRegalos(eventoId: string, asignaciones: Array<{
  compradorId: string;
  receptorId: string;
}>) {
  const { error } = await supabase
    .from("asignaciones")
    .insert(
      asignaciones.map(a => ({
        evento_id: eventoId,
        comprador_id: a.compradorId,
        receptor_id: a.receptorId
      }))
    );

  if (error) throw error;
}

// Actualizar estado compra
export async function marcarComprado(asignacionId: string) {
  const { error } = await supabase
    .from("asignaciones")
    .update({
      estado: "comprado",
      comprado_at: new Date().toISOString()
    })
    .eq("id", asignacionId);

  if (error) throw error;
}
```

---

## ⏱️ CHECKLIST CONSTRUCCIÓN (24h, Supabase)

### **Hora 0-3: Setup Supabase + estructura**
- [ ] Crear proyecto Supabase (supabase.com)
- [ ] Crear tablas SQL (copiar schema arriba)
- [ ] Activar RLS en todas las tablas
- [ ] Setup Auth (Supabase nativo)
- [ ] Crear proyecto React + Vite
- [ ] Instalar deps: supabase-js, resend

### **Hora 3-5: Auth**
- [ ] Componentes Login/Signup (Supabase Auth)
- [ ] Persistencia sesión (Supabase manejada)
- [ ] JoinEvent con código

### **Hora 5-8: Crear evento + Join**
- [ ] Form crear evento
- [ ] INSERT eventos + participantes
- [ ] Link shareable
- [ ] Join por código

### **Hora 8-11: Preferencias + Asignación**
- [ ] Form registrar deseos
- [ ] UPSERT preferencias
- [ ] Algoritmo asignación (TypeScript)
- [ ] INSERT asignaciones batch

### **Hora 11-15: Dashboard + asignación personal**
- [ ] SELECT mi asignación (secreto preservado)
- [ ] Mostrar deseos, presupuesto
- [ ] UPDATE marcar "Compré"
- [ ] Admin: tabla estado compradores

### **Hora 15-20: Edge Functions + Emails**
- [ ] Deploy Edge Function: send-invitation
- [ ] Deploy Edge Function: send-reminder
- [ ] Llamadas desde frontend
- [ ] Testing email

### **Hora 20-22: Revelación + historial**
- [ ] UPDATE evento.estado = 'completado'
- [ ] SELECT asignaciones (mostrar receptor)
- [ ] Historial persistente

### **Hora 22-24: Pulido + deployment**
- [ ] Validaciones + errores
- [ ] Responsive mobile
- [ ] Deploy Vercel + env vars
- [ ] Testing end-to-end

---

## 🔐 VARIABLES DE ENTORNO

**.env.local:**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
VITE_APP_URL=http://localhost:5173
```

**Supabase > Project Settings > API:**
- Copiar `URL`
- Copiar `anon public` key

---

## 📊 VENTAJAS SQL vs NoSQL (Para tu caso)

| Punto | Firestore | Supabase |
|-------|-----------|----------|
| Relaciones | Documentos sueltos | Foreign keys reales |
| Validación | Code (app) | DB constraints |
| Queries | NoSQL simple | SQL complejo si necesario |
| RLS | Complicado | Native, muy poderoso |
| Migraciones | Difíciles | Easy (SQL versioning) |
| **Para MVP** | Rápido | Más control |

**Tu caso:** Supabase es mejor porque tienes relaciones claras (eventos → participantes → asignaciones).

---

## 🚀 POSTGRESQL TIPS

```sql
-- Array type (deseos):
deseos TEXT[] DEFAULT '{}'

-- Insert array:
INSERT INTO preferencias VALUES (..., ARRAY['Audífonos', 'Mochila']::text[])

-- Query array:
SELECT deseos FROM preferencias WHERE 'Audífonos' = ANY(deseos)

-- UUID:
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Timestamps:
created_at TIMESTAMP DEFAULT now()

-- Enum (alternativa a CHECK):
CREATE TYPE estado_enum AS ENUM ('pendiente', 'comprado', 'entregado');
```

---

## ✅ CRITERIOS MVP "DONE"

- [ ] Tablas creadas en Supabase
- [ ] RLS habilitada y testeada
- [ ] Auth funciona (signup/login)
- [ ] Crear evento → INSERT en DB
- [ ] Join por código → funciona
- [ ] Registrar deseos → UPSERT funciona
- [ ] Asignar → INSERT asignaciones
- [ ] Ver asignación → secreto preservado en SELECT
- [ ] Marcar comprado → UPDATE funciona
- [ ] Emails enviados (invitación + reminders)
- [ ] Revelar → UPDATE estado
- [ ] Historial → SELECT con WHERE estado='completado'
- [ ] Deployado en Vercel + Supabase

---

**Tiempo: 24h**
**Tech debt: Bajo (SQL es estándar, no lock-in)**
**Escalabilidad: Excelente (PostgreSQL)** 

Next: Mira el prompt para Claude Code con Supabase.
