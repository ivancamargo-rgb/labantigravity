# AI Projects Hub & Suite

Repositorio para experimentación, desarrollo y despliegue de soluciones de Inteligencia Artificial (RAG, Agentes Autónomos y Visión Multimodal).

---

## 📁 Estructura del Proyecto

```text
├── src/
│   ├── config.py              # Gestión de variables de entorno y parámetros
│   └── modules/
│       ├── rag.py             # Sistema RAG (Retrieval-Augmented Generation)
│       ├── agent.py           # Agentes autónomos orientados a tareas
│       └── vision.py          # Análisis multimodal con Gemini Vision
├── main.py                    # CLI principal para ejecutar y probar módulos
├── requirements.txt           # Dependencias del proyecto
├── .env.example               # Plantilla de variables de entorno
└── .gitignore                 # Exclusión de archivos y secretos
```

---

## 🚀 Módulos Incluidos

1. **RAG Assistant (`src/modules/rag.py`)**:
   - Indexación semántica y búsqueda de contexto en documentos.
   - Generación de respuestas asistidas con fuentes citadas.

2. **Autonomous Agent (`src/modules/agent.py`)**:
   - Planificación de tareas de múltiples pasos.
   - Registro de herramientas y ejecución estructurada.

3. **Multimodal Vision (`src/modules/vision.py`)**:
   - Integración con modelos multimodales (Gemini 2.5 Flash / Vision).
   - Extracción de información visual e inspección de imágenes.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/ivancamargo-rgb/labantigravity.git
cd labantigravity
```

### 2. Configurar entorno virtual (Python 3.10+)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> **Nota para macOS:** Si es la primera vez que usas Python en tu Mac, instala las herramientas de desarrollador ejecutando en tu terminal:
> ```bash
> xcode-select --install
> ```

### 3. Configurar API Keys
Copia la plantilla de variables de entorno y agrega tu clave de Gemini:
```bash
cp .env.example .env
```

Edita `.env`:
```ini
GEMINI_API_KEY=tu_api_key_aqui
GEMINI_MODEL=gemini-2.5-flash
```

---

## 💻 Uso

Ejecuta el menú CLI o prueba módulos individuales:

```bash
# Ejecutar demostración completa
python3 main.py --module all

# Probar solo el asistente RAG
python3 main.py --module rag

# Probar el agente autónomo
python3 main.py --module agent

# Probar el módulo de visión
python3 main.py --module vision
```

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
