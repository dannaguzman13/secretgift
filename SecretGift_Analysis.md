# SecretGift: Análisis de Problema → Solución

---

## 🔍 EL PROBLEMA (Raíz real, todo el año)

### Contexto: ¿Por qué coordinar regalos de grupo es un lío **siempre**?

Los grupos coordinan regalos secretos en **múltiples ocasiones**, pero cada vez enfrentan los **mismos problemas**:

| Ocasión | Frecuencia | Problema |
|---------|-----------|----------|
| **Cumpleaños colectivo** | Mensual | "¿Cuánto gastamos?" "¿Quién compra?" |
| **Amigo Invisible** | Anual (diciembre) | Deducción de quién compra, alguien se asigna a sí mismo |
| **Despedida de alguien** | Semestral | Coordinar regalo grupal sin drama |
| **Aniversario del grupo** | Anual | Quién le regala a quién, presupuesto disperso |
| **Día de reyes** | Anual (enero) | Mismo caos que Secret Santa |
| **Evento surprise** | Irregular | "¿Qué le regalamos?" sin spoiler |

### **El verdadero problema de fondo:**

**Cada vez que un grupo quiere hacer un regalo secreto/coordinado, necesita:**
1. Asignación secreta (sin errores, sin deducción)
2. Presupuesto claro (todos gastan igual)
3. Preferencias del receptor (regalos buenos, no genéricos)
4. Recordatorios (nadie olvida)
5. Coordinación logística (fecha/lugar/forma de entrega)

**Hoy, TODO eso se maneja por WhatsApp/email/Excel. Es manual, caótico, propenso a errores, y se repite cada ocasión.**

---

## 👥 ICP (Ideal Customer Profile)

### **Segmento primario:**

**Grupos sociales recurrentes (10-30 personas) que:**

- Celebran **múltiples ocasiones al año** (cumpleaños, aniversarios, despedidas, eventos)
- Quieren hacer regalos coordinados pero sin drama organizativo
- Viven dispersos geográficamente (no es fácil coordinar en persona)
- Manejan todo por WhatsApp/Telegram pero la comunicación es caótica
- Tienen presupuesto limitado (estudiantes, jóvenes profesionales, gen Z)
- **Quieren repetir la experiencia sin re-empezar desde cero cada vez**

### **Segmento secundario:**

- **Familias** (especialmente familias grandes con primos/tíos dispersos)
- **Equipos remotos** (teambuilding virtual, regalos entre colegas)
- **Comunidades online** (Discord, Telegram groups, reddits) que hacen regalos secretos entre miembros
- **Círculos de amigos expandidos** (10-50 personas)

### **Características del ICP:**

✅ Hacen regalos de grupo **mínimo 3-4 veces al año**
✅ Valoran la sorpresa y la experiencia
✅ Odian coordinar manualmente cada ocasión
✅ Quieren evitar "regalos malos" 
✅ Necesitan presupuesto claro
✅ **Quieren plataforma única que funcione para cualquier ocasión**

---

## 💡 LA SOLUCIÓN (SecretGift: Regalos coordinados todo el año)

### **Flujo usuario (genérico para CUALQUIER ocasión):**

```
1. CREAR EVENTO DE REGALO
   ↓
   Admin crea evento:
   - Tipo: "Cumpleaños de [nombre]" 
           "Amigo Invisible Diciembre"
           "Despedida de [nombre]"
           "Aniversario del grupo"
           "Custom: [lo que sea]"
   - Presupuesto: $X
   - Fecha límite de compra: [día]
   - Fecha de revelación: [día]
   - Quién recibe: [una o múltiples personas]
   
2. INVITAR PARTICIPANTES
   ↓
   Admin invita grupo
   (reutiliza grupos existentes o crea nuevos)
   
3. REGISTRO DE PREFERENCIAS (por receptor)
   ↓
   Cada RECEPTOR registra:
   - Lista de deseos (3-5 items con descripciones)
   - Restricciones ("no quiero X", alergias, etc.)
   - Foto/perfil
   - Forma de entrega preferida (físico, digital, envío)
   
4. ASIGNACIÓN AUTOMÁTICA
   ↓
   App asigna:
   - Cada COMPRADOR ve a quién le toca
   - Secreto preservado
   - Puede excluir: "no quiero a mi jefe"
   - Optimiza: evita ciclos obvios
   
5. RECORDATORIOS INTELIGENTES
   ↓
   - 2 semanas antes: "Tienes que comprar para [Nombre]"
   - 1 semana antes: "Compra para [Nombre], presupuesto $X"
   - 3 días antes: "¿Ya compraste?"
   - 1 día antes: "Última oportunidad"
   - Checkbox: "Compré ✓" + foto del regalo (opcional)
   
6. COORDINACIÓN DE ENTREGA
   ↓
   - Fecha/hora unificada
   - Ubicación (física/virtual/envío)
   - Admin ve: quién no confirmó
   
7. REVELACIÓN
   ↓
   - Se abren/intercambian regalos
   - Se revela quién fue el comprador
   - (Opcional) foto grupal shareable
   
8. HISTORIAL (CLAVE PARA REPETIBILIDAD)
   ↓
   - App guarda:
     * Todos los eventos pasados
     * Quién compró para quién (historial)
     * Preferencias de cada persona
     * Presupuestos usados
   - Admin puede: "Replicar evento de hace 3 meses"
   - Sistema sugiere: "Actualizar presupuesto a $30?"
```

### **La clave: TEMPLATES + HISTORIAL**

```
Flujo normal (3 meses después):

Evento 1 (Septiembre):     Evento 2 (Diciembre):
Cumpleaños de Juan        Amigo Invisible Navidad
[Admin crea desde cero]    [Admin hace CLICK en "Replicar evento"
                           y cambia solo: nombre, presupuesto, fechas]
                           
                           [Sistema reutiliza:
                           - Mismo grupo de personas
                           - Preferencias previas (actualizadas)
                           - Configuración similar]
                           
                           [Resultado: Setup en 2 minutos vs 20 minutos]
```

---

## 🎯 QUÉ PROBLEMA RESUELVE CADA PARTE

| Funcionalidad | Problema que resuelve |
|---|---|
| **Asignación automática** | Eliminates manual errors, ciclos obvios, spoilers por deducción |
| **Lista de deseos integrada** | Cada comprador ve exactamente qué le gusta al receptor → regalos mejores |
| **Presupuesto claro** | Todos gastan lo mismo, no hay resentimiento |
| **Restricciones personalizadas** | "No quiero a mi jefe" / "Alergia a X" → evita drama |
| **Recordatorios automáticos** | Nadie olvida, accountability sin drama |
| **Coordinación de fecha/lugar** | Todos saben cuándo/dónde sin caos |
| **Tracking de confirmación** | Admin sabe quién no compró → intervención |
| **Secreto preservado** | Solo ves a quién le toca comprar |
| **Templates + Historial** | **Reutilizar eventos = coordinación 10x más rápida** |
| **Múltiples receptores** | Para cada ocasión: 1 persona o grupo entero |

---

## 🔄 COMPARACIÓN: ANTES vs DESPUÉS

### **ANTES (Sin app, coordinación repetida):**

```
SEPTIEMBRE - Cumpleaños colectivo:
Lunes:
Admin: "¿Hacemos regalo para Diego?"
[Caos de respuestas lentas]

Viernes:
Admin: Manualmente asigna en Excel
[Equivocación: alguien se asigna a sí mismo]

Se compra regalo genérico (no saben qué le gusta)

---

DICIEMBRE - Secret Santa (3 meses después):
Lunes:
Admin: "¿Hacemos de nuevo?"
[MISMO PROBLEMA que en septiembre]

Admin: "¿Cuánto gastamos?" → votación caótica
Admin: "¿Quién no puede ser con quién?" → otra votación

Admin: Manualmente crea asignaciones de nuevo
[Repite los mismos errores que en septiembre]

---

TOTAL: 40 minutos de coordinación para CADA ocasión
```

### **DESPUÉS (Con app, reutilización):**

```
SEPTIEMBRE - Cumpleaños colectivo:
Lunes:
Admin crea evento "Cumpleaños Diego"
Invita grupo (link)
Presupuesto: $25
[5 minutos]

Todos registran si Diego los tiene bloqueados
Diego registra deseos

Miércoles:
Sistema asigna automáticamente
Cada uno sabe quién le toca

Resultado: Regalos buenos, sorpresa preservada

---

DICIEMBRE - Secret Santa (3 meses después):
Lunes:
Admin hace CLICK: "Replicar evento"
Selecciona: "Cumpleaños Diego" como template
Cambia:
- Nombre: "Amigo Invisible Navidad"
- Presupuesto: $30 (antes era $25)
- Receptores: TODO EL GRUPO (no solo Diego)
- Fechas: 20-dic vs 15-sep

[2 minutos vs 20 minutos]

Sistema automáticamente:
- Reutiliza grupo
- Reutiliza preferencias previas (pero permite actualizar)
- Aplica nuevas asignaciones

Resultado: Setup 10x más rápido

---

MARZO - Despedida de grupo:
Admin: Replica evento, cambia receptores
[1 minuto]

---

TOTAL: 5 minutos por ocasión (después de la primera vez)
```

---

## 🚀 VALOR ESPECÍFICO QUE GENERA

### **Para el ICP (grupos que hacen regalos recurrentes):**

| Valor | Traducción real | Impacto |
|-------|-----------------|--------|
| **Menos fricción** | 20 min coordinación → 2 min (primera vez: 5 min) | 10x más rápido después |
| **Reutilización** | No empiezas de cero cada ocasión | Time-saving exponencial |
| **Sorpresa preservada** | No puedes deducir quién compra | Experiencia mejor cada vez |
| **Regalos mejores** | Ves deseos específicos cada vez | Satisfacción del receptor ↑ |
| **Justicia financiera** | Todos gastan igual | Sin resentimiento |
| **Menos drama** | App recuerda → no hay culpa | Relaciones mejores |
| **Historial visible** | "Recuerdo que el año pasado Juan pidió X" | Continuidad |

### **Para el coordinador (admin):**

| Valor | Traducción real |
|-------|-----------------|
| **Automatización total** | Cero asignaciones manuales, cero recordatorios |
| **Escalabilidad** | Funciona igual con 8 o 100 personas |
| **Reutilización** | Template + 1 click = evento nuevo |
| **Visibilidad** | Ve quién no compró antes de la revelación |
| **Análisis** | "¿Cuánto gastamos al año en regalos?" |

---

## 📱 MVP: QUÉ INCLUYE (< USD 5)

### **INCLUIDO EN MVP:**

#### **CORE:**
- Crear evento (nombre, presupuesto, fechas, receptor/es)
- Invitar grupo (link + código)
- Registro de preferencias (lista de deseos, restricciones)
- Asignación automática + secreto preservado
- Recordatorios (email/SMS: 7 días, 3 días, 1 día)
- Checkbox "Compré ✓"
- Historial de eventos pasados (lista)
- Ver asignaciones pasadas ("¿Quién me regaló en septiembre?")

#### **REUTILIZACIÓN:**
- "Replicar evento" (1 click)
- Cambiar: presupuesto, fechas, receptores
- Reutilizar preferencias previas (con opción de actualizar)
- Sugerir: "¿Actualizar presupuesto a $35?"

#### **BÁSICO:**
- Dashboard simple (próximos eventos, historial)
- Notificación de eventos por venir

### **NO INCLUIDO (versión 2.0):**
- Fotos de deseos
- Integración de pagos/split
- Restricciones avanzadas
- Revelación en la app ("quién te regaló")
- Analytics de gastos
- Grupos personalizados (por ahora, mismo grupo)

---

## 💰 POR QUÉ ES BAJO COSTO (< $5)

| Componente | Costo | Tecnología |
|---|---|---|
| **Base de datos** | $0 | Firebase free tier (2 GB, perfecto para historial) |
| **Autenticación** | $0 | Firebase Auth |
| **Emails/recordatorios** | $0 | SendGrid free tier (100 emails/día suficientes) |
| **Hosting** | $0 | Vercel/Netlify free tier |
| **Algoritmo de asignación** | $0 | Lógica simple, cero APIs caras |
| **Dominio** | Opcional: $12/año | .vercel.app (gratis) |
| **Total anual** | **$0-15** | — |

---

## 📊 CASOS DE USO A LO LARGO DEL AÑO

```
ENERO - Día de Reyes
Admin: Replica template "Amigo Invisible Navidad"
Cambia fecha a enero 5
[1 minuto]

FEBRERO - Cumpleaños de grupo (2 personas)
Admin: Crea evento nuevo
Receptores: María + Juan
Presupuesto: $20 cada uno
[3 minutos]

MARZO - Despedida de colega
Admin: Crea evento
Receptor: [Colega que se va]
Presupuesto: $30
[3 minutos]

ABRIL - Aniversario del grupo (4 años)
Admin: Replica evento del año anterior
Cambia presupuesto a $35
[1 minuto]

JUNIO - Cumpleaños individual
Admin: Crea evento (receptor: 1 persona)
[2 minutos]

SEPTIEMBRE - Regreso a clases
Admin: Grupo hace regalos internos
[5 minutos]

DICIEMBRE - Secret Santa (8va ocasión del año)
Admin: Replica cualquier template
[1 minuto]

---

TOTAL TIEMPO DE COORDINACION EN EL AÑO:
Sin app: ~8 ocasiones × 20 minutos = 160 minutos (2.7 horas)
Con app: ~8 ocasiones × 3 minutos promedio = 24 minutos (después de setup inicial)

AHORRO: 2.6 horas al año por grupo
```

---

## 🎯 RESUMEN: PROBLEMA → SOLUCIÓN

### **Problema Core (TODO EL AÑO):**
Cada vez que un grupo quiere hacer un regalo secreto/coordinado, necesita:
- Asignación secreta sin errores
- Presupuesto claro
- Preferencias específicas
- Recordatorios
- Coordinación logística

**Hoy, se repite MANUALMENTE cada ocasión. Es caótico y se reinventa cada vez.**

### **Solución: SecretGift**
Una app que:
1. **Automatiza asignación** (secreto real, sin errores)
2. **Centraliza preferencias** (regalos buenos)
3. **Fija presupuesto** (justicia)
4. **Recuerda automáticamente** (accountability)
5. **Coordina logística** (fecha/lugar claro)
6. **Reutiliza eventos** (template + 1 click = evento nuevo)
7. **Guarda historial** (continuidad año a año)

### **Resultado:**
- **Primera ocasión:** 5 minutos de setup
- **Ocasiones siguientes:** 1-3 minutos (template + cambios mínimos)
- **Resultado:** 10x más rápido que coordinación manual
- **Experiencia:** Mejor cada año (más datos = mejor asignación + preferencias)

---

## 🎁 POR QUÉ FUNCIONA MEJOR CON REUTILIZACIÓN

```
Oportunidad de Switching Cost:

Ocasión 1 (Septiembre):
- Admin aprende app
- Grupo experimenta flujo
- Todos ven que funciona

Ocasión 2 (Diciembre):
- Admin piensa: "¿Hago en WhatsApp o en la app?"
- OPCIÓN A: WhatsApp = 20 minutos, caótico
- OPCIÓN B: App = 2 minutos, limpio, historial guardado
- Admin elige: App
- Switching cost superado

Ocasión 3+:
- Admin siempre usa app
- Hábito formado
- Compitencia: cero (nadie más lo hace)
```

---

## 🛠️ WIREFRAMES CONCEPTUALES (Flujo usuario)

### **Pantalla 1: Dashboard (Inicio)**
```
┌─────────────────────────────────────┐
│ SecretGift                    [User]│
├─────────────────────────────────────┤
│                                     │
│  PRÓXIMOS EVENTOS                   │
│  ┌─────────────────────────────┐    │
│  │ 🎁 Amigo Invisible Navidad  │    │
│  │    15 dic - Compra para X   │    │
│  │    ⏰ 3 días para comprar    │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 🎂 Cumpleaños María         │    │
│  │    22 dic - Recibe regalo   │    │
│  │    ✓ Ya compraste           │    │
│  └─────────────────────────────┘    │
│                                     │
│  [+ CREAR NUEVO EVENTO]             │
│                                     │
│  HISTORIAL                          │
│  • Septiembre: Cumpleaños Diego     │
│  • Julio: Despedida Juan           │
│                                     │
└─────────────────────────────────────┘
```

### **Pantalla 2: Crear Evento**
```
┌─────────────────────────────────────┐
│ Crear Evento de Regalo              │
├─────────────────────────────────────┤
│                                     │
│  Nombre del evento:                 │
│  [________________________]          │
│   "Amigo Invisible Navidad"         │
│                                     │
│  Presupuesto:                       │
│  [$_____] (USD)                     │
│                                     │
│  Quién recibe:                      │
│  ☐ Persona única                    │
│  ◉ Grupo completo                   │
│                                     │
│  Fecha límite de compra:            │
│  [_____/_____/20__]                 │
│                                     │
│  Fecha de revelación:               │
│  [_____/_____/20__]                 │
│                                     │
│  [CREAR EVENTO] [CANCELAR]          │
│                                     │
│  O [REPLICAR EVENTO ANTERIOR]       │
│     "Selecciona template..."        │
│                                     │
└─────────────────────────────────────┘
```

### **Pantalla 3: Mi Asignación Secreta**
```
┌─────────────────────────────────────┐
│ 🎁 Amigo Invisible Navidad          │
├─────────────────────────────────────┤
│                                     │
│  COMPRAS PARA:                      │
│  ┌─────────────────────────────┐    │
│  │ Nombre: [REDACTADO]         │    │
│  │ Presupuesto: $25 USD        │    │
│  │                             │    │
│  │ Deseos:                     │    │
│  │ • Audífonos inalámbricos    │    │
│  │ • Mochila impermeable       │    │
│  │ • Libro de ficción          │    │
│  │                             │    │
│  │ Restricciones:              │    │
│  │ "Sin cosas de plástico"     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⏰ Compra antes del 15 diciembre   │
│                                     │
│  [✓ COMPRÉ] [NECESITO AYUDA]       │
│                                     │
└─────────────────────────────────────┘
```

### **Pantalla 4: Confirmar Compra**
```
┌─────────────────────────────────────┐
│ Confirmar Compra                    │
├─────────────────────────────────────┤
│                                     │
│  ✓ YA COMPRASTE PARA JUAN          │
│                                     │
│  Detalles (opcional):               │
│  ┌─────────────────────────────┐    │
│  │ [📷 Subir foto del regalo]  │    │
│  │ [Agregar nota personal]     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Admin verá:                        │
│  ✓ Juan: COMPRADO                   │
│  ✓ María: COMPRADO                  │
│  ⏳ Diego: PENDIENTE                │
│  ⏳ Sofía: PENDIENTE                │
│                                     │
│  [CONFIRMAR] [CAMBIAR]              │
│                                     │
└─────────────────────────────────────┘
```

### **Pantalla 5: Replicar Evento (Template)**
```
┌─────────────────────────────────────┐
│ Replicar Evento                     │
├─────────────────────────────────────┤
│                                     │
│  Selecciona evento anterior:        │
│  ☐ Cumpleaños Diego (sep)           │
│  ☐ Despedida Juan (jul)             │
│  ◉ Amigo Invisible (dic anterior)   │
│                                     │
│  [SIGUIENTE]                        │
│                                     │
│  Cambios:                           │
│  Nombre: [Amigo Invisible Navidad] │
│  Presupuesto: [$30]  (era $25)     │
│  Año: [2025]                        │
│  Receptores: [Grupo completo]       │
│  Fechas: [15-dic]                   │
│                                     │
│  [CREAR CON CAMBIOS]                │
│                                     │
│  ℹ️ Se reutilizarán:                │
│  • Mismo grupo de personas          │
│  • Preferencias previas             │
│  • Restricciones conocidas          │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 ESTÉTICA Y UX (Principios)

- **Color:** Tonos warm (rojo-naranja para regalos, verde para éxito)
- **Tipografía:** Amigable, no corporativo (Poppins, Inter)
- **Iconografía:** Emojis como base + iconos custom simples
- **Animations:** Transiciones suaves al cambiar estados (especialmente la asignación secreta)
- **Tone of voice:** Amigable, sin drama, sin jerga

---

## 📈 MÉTRICAS DE ÉXITO PARA LAB 10

### **Métricas de Uso:**
- ✅ % de eventos completados sin drama
- ✅ Tiempo promedio de setup (meta: < 5 minutos)
- ✅ Tasa de repetición: ¿Cuántas ocasiones reutilizan template?
- ✅ Satisfacción de regalos: Feedback cualitativo post-revelación

### **Métricas de Adopción:**
- ✅ Número de grupos creados
- ✅ Número de ocasiones coordinadas
- ✅ Tasa de retención: ¿Siguen usando en ocasión 2?

### **Métricas de Impacto Social:**
- ✅ "Tiempo ahorrado" percibido (pregunta directa)
- ✅ "Drama evitado" (anécdotas cualitativas)
- ✅ Satisfacción con calidad de regalos

---

## 🚀 ROADMAP FUTURO (NO MVP)

### **Fase 1 (MVP):**
- Core: crear evento, asignar, recordar, reutilizar

### **Fase 2:**
- Fotos de deseos con AI recognition
- Integración con Amazon/tiendas (link directo)
- Analytics: "Gastaste $150 en regalos este año"

### **Fase 3:**
- Split de costos automático (Stripe/MercadoPago)
- Restricciones avanzadas (IA sugiere "no asignar a...")
- Grupos personalizados (crear sub-grupos dentro de grupo)

### **Fase 4:**
- Monetización: Premium features ($2.99/mes)
- Integración con marketplaces (descuentos partner)
- Análisis de tendencias (qué deseos son populares)

---

## 🎯 DIFERENCIADOR CLAVE

**SecretGift NO es:**
- Un wishlist manager (como Amazon Registry)
- Un scheduler de reuniones (como Calendly)
- Un gift tracker (como una spreadsheet bonita)

**SecretGift ES:**
- La plataforma ÚNICA que automatiza TODA la coordinación de regalos secretos
- Reutilizable para CUALQUIER ocasión, CUALQUIER momento del año
- Preserva el secreto mientras garantiza regalos buenos
- Ahorra 10x tiempo en coordinación después de la primera vez

---

## 📝 PRÓXIMOS PASOS

1. **Validación rápida:** 5-10 grupos usando MVP beta
2. **Feedback:** "¿Qué dolor REALMENTE resolvimos?"
3. **Iteración:** Cambios basados en uso real
4. **Lanzamiento:** Público (primero con grupos amigos, luego viral)

---

**Autor:** Análisis estratégico para Lab 10
**Fecha:** Julio 2026
**Formato:** MVP < USD 5, construcción 4-6 semanas, sin APIs externas
