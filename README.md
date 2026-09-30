# ⚽ Antigravity 3D Soccer - FIFA Virtual League & AI Suite

Videojuego de fútbol virtual en 3D avanzado con experiencia inmersiva estilo FIFA / EA FC, física balística en tiempo real, múltiples clubes oficiales, estadios legendarios y suite de módulos de Inteligencia Artificial.

---

## 🎮 Jugar Antigravity 3D Soccer

¡No requiere instalar motores pesados! Ejecútalo directamente en tu navegador (Google Chrome, Safari, Edge):

```bash
# Abrir directamente en macOS:
open index.html
```

O abre `index.html` con doble clic desde tu explorador de archivos.

---

## ⭐ Características del Juego 3D

### 1. 🏟️ Estadios Legendarios 3D
* **Santiago Bernabéu (Madrid):** Techo metálico, iluminación nocturna brillante con 4 torres de focos LED y césped impecable a rayas.
* **Spotify Camp Nou (Barcelona):** Gradas azulgranas masivas, atmósfera de atardecer y corte de césped ajedrezado.
* **Wembley Stadium (Londres):** Icónico arco estructural, tribunas rojas y blancas, atmósfera majestuosa.
* **La Bombonera (Buenos Aires):** Gradas verticales auriazules, vibrante ambiente y tribunas pegadas a la cancha.

### 2. 🛡️ Clubes y Plantillas Reales
* **Real Madrid (93):** Courtois, Carvajal, Rüdiger, Valverde, Bellingham, Rodrygo, Mbappé, Vinícius Jr.
* **FC Barcelona (91):** Ter Stegen, Koundé, Araújo, Balde, Pedri, De Jong, Lamine Yamal, Lewandowski, Raphinha.
* **Manchester City (93):** Ederson, Walker, Rúben Dias, Rodri, De Bruyne, Bernardo Silva, Foden, Haaland.
* **Inter Miami CF (87):** Callender, Jordi Alba, Sergio Busquets, Messi, Luis Suárez.
* **Boca Juniors (86):** Romero, Advíncula, Marcos Rojo, Zenón, Cavani, Merentiel.
* **River Plate (86):** Armani, Acuña, Pezzella, Mastantuono, Borja, Colidio.

### 3. 🎯 Controles de Juego

| Acción | Teclas (PC / Mac) |
|---|---|
| **Moverse / Regatear** | `W`, `A`, `S`, `D` o Flechas del teclado |
| **Sprint / Acelerar** | `Shift` (mientras te mueves) |
| **Disparo a Gol (Potencia cargable)** | `Espacio` o `J` (mantener para cargar barra de potencia) |
| **Pase Corto al pie** | `K` o `X` |
| **Pase al Hueco / Filtrado** | `L` o `C` |
| **Cambiar Jugador activo** | `Q` o `E` |
| **Cambiar Ángulo de Cámara** | `V` (Tele Broadcast, Action Cam, Tactical) |
| **Silenciar / Activar Sonido** | `M` |

### 4. 🚀 Motor y Física en Tiempo Real
* **Gráficos 3D:** Construido con Three.js, sombras suaves (PCFSoftShadowMap), reflejos y vallas publicitarias LED animadas.
* **Física Balística:** Gravedad realista, fricción con el césped, efecto rebote elástico en palos/travesaño y amortiguación en redes de portería.
* **Sonido Sintetizado (Web Audio API):** Silbato realista de árbitro, impacto de golpeo de balón, sonido metálico en postes y rugido dinámico del público en ocasiones de gol.
* **Minimapa Radar 2D:** Muestra en tiempo real la posición de los 22 futbolistas y el balón en la cancha.
* **Celebración Cinemática:** Cámaras lentas 360°, pancarta de ¡GOOOOL! y lluvia de confeti tras cada anotación.

---

## 📁 Estructura del Repositorio

```text
├── index.html                 # Punto de entrada del juego 3D
├── css/
│   └── style.css              # Interfaz moderna FIFA / EA FC (Scoreboard, Radar, Menús)
├── js/
│   ├── constants.js           # Clubes, plantillas, estadios y dimensiones reglamentarias
│   ├── audio.js               # Motor de sonido procedural (silbatos, hinchada, disparos)
│   ├── stadium.js             # Generador 3D de estadios, tribunas, arcos y focos
│   ├── ball.js                # Física balística y colisiones del balón
│   ├── player.js              # Modelos 3D, animación procedural de zancada e IA
│   └── game.js                # Controlador de partido, HUD, cámaras y reglas
├── src/                       # Suite de Inteligencia Artificial (Backend/Python)
│   ├── config.py              # Variables de entorno
│   └── modules/
│       ├── rag.py             # Asistente RAG con documentos
│       ├── agent.py           # Agentes autónomos
│       └── vision.py          # Análisis multimodal con Gemini Vision
├── main.py                    # CLI de IA
└── requirements.txt           # Dependencias Python
```

---

## 🛠️ Instalación y Desarrollo

### 1. Clonar el repositorio
```bash
git clone git@github.com:ivancamargo-rgb/labantigravity.git
cd labantigravity
```

### 2. Ejecutar el juego
Basta con abrir `index.html` en cualquier navegador web.

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
