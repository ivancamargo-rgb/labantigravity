# 🏛️ ESMERALDA Studio & ⚽ Antigravity 3D Virtual Hub

Bienvenido a la suite de innovación y desarrollo de **Antigravity**. Este repositorio contiene dos aplicaciones interactivas de vanguardia:

1. **🏛️ ESMERALDA Studio (`esmeralda.html`):** Simulador gráfico y visual de la arquitectura empresarial de Google Cloud para Agentes de IA en producción (`google/esmeralda`).
2. **⚽ Antigravity 3D Soccer (`index.html`):** Videojuego 3D interactivo de fútbol estilo FIFA con estadios, clubes reales y física balística en tiempo real.
3. **🧠 AI Suite (`src/`):** Módulos Python para RAG, Agentes Autónomos y Visión Multimodal con Gemini.

---

## 🏛️ 1. ESMERALDA Studio - Architecture Explorer

Simulador visual e interactivo diseñado para entender y demostrar el blueprint de grado comercial de Google Cloud:

```bash
# Abrir directamente en tu navegador:
open esmeralda.html
```

### 🌟 Capacidades Ilustradas:
* **El Mundo de Arriba (`/apps`):**
  * **Root Coordinator Agent:** Orquestador en Vertex AI Reasoning Engine.
  * **Protocolo Agente-a-Agente (A2A):** Delegación de tareas sobre túneles seguros Private Service Connect (PSC).
  * **Ecosistema MCP (Model Context Protocol):** Microservicios de herramientas desacoplados en Cloud Run (`legacy-dms`, `income-verification`, `corporate-email`).
  * **Gemini 3.7 Flash:** Inferencia y razonamiento estructurado.
* **El Mundo de Abajo (`/infrastructure`):**
  * **Central Agent Gateway:** Validación estricta de identidades criptográficas SPIFFE Workload mTLS.
  * **Model Armor:** Detección de ataques de inyección de prompt (*jailbreak*) y sanitización de datos confidenciales (PII).
  * **FinOps & Observabilidad:** Registro en vivo de tokens consumidos, costo acumulado en USD y audit sinks transmitiendo a BigQuery.
  * **Resiliencia (Circuit Breaker):** Aislamiento de microservicios con fallas y degradación elegante.

### 🎮 Demostraciones Interactivas Incluidas:
1. **🏦 Evaluación Hipotecaria (A2A + MCP):** Flujo completo de aprobación de crédito con consulta a DMS legado, verificación de nómina y envío de resolución por email corporativo.
2. **🛑 Ataque Adversario (Model Armor Defense):** Intento de inyección de prompt y extracción de bases de datos bloqueado en el perímetro de seguridad.
3. **⚡ Fallo de Servicio (Circuit Breaker):** Simulación de caída de un sistema legado y activación de fallback en caché sin interrumpir el flujo.

---

## ⚽ 2. Antigravity 3D Soccer - FIFA Virtual League

Videojuego de fútbol virtual en 3D avanzado ejecutable directamente en el navegador con Three.js:

```bash
open index.html
```

### Características:
* **Estadios 3D:** Santiago Bernabéu, Spotify Camp Nou, Wembley Stadium y La Bombonera.
* **Clubes y Plantillas Reales:** Real Madrid, FC Barcelona, Manchester City, Inter Miami, Boca Juniors y River Plate.
* **Física Balística:** Rebotes en postes/red, control del balón y trayectoria con efecto.
* **Sonido Sintetizado en Vivo:** Silbatos de árbitro, impacto de balón y cánticos de la hinchada con Web Audio API.

---

## 📁 Estructura del Repositorio

```text
├── esmeralda.html             # 🏛️ ESMERALDA Studio: Interfaz interactiva de la arquitectura
├── index.html                 # ⚽ Antigravity 3D Soccer: Juego de fútbol virtual 3D
├── css/
│   ├── esmeralda.css          # Estilos de consola Google Cloud / Vertex AI para Esmeralda
│   └── style.css              # Estilos modernos estilo EA Sports / FIFA
├── js/
│   ├── esmeralda-core.js      # Motor de simulación de arquitectura, A2A, MCP y Model Armor
│   ├── esmeralda-ui.js        # Controlador de mapas topológicos, especificaciones y FinOps
│   ├── constants.js           # Plantillas, estadios y parámetros
│   ├── audio.js               # Motor de audio procedural
│   ├── stadium.js             # Generador 3D de estadios Three.js
│   ├── ball.js                # Física del balón y colisiones
│   ├── player.js              # Modelos 3D e IA de futbolistas
│   └── game.js                # Controlador de partido y cámaras
├── src/                       # Módulos Python de Inteligencia Artificial
│   ├── config.py              # Variables de entorno
│   └── modules/               # RAG, Agentes y Visión
├── main.py                    # CLI principal de IA
└── requirements.txt           # Dependencias Python
```

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT y las especificaciones de referencia bajo Apache 2.0 (Google Cloud).
