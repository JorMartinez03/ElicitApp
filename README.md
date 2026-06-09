# Simulador Avanzado de Elicitación de Requerimientos

## Descripción

SPA construida con **React 19**, **Vite 8** y **Tailwind CSS 4** diseñada para el entrenamiento práctico en Ingeniería de Requisitos. El simulador permite entrevistar a stakeholders virtuales impulsados por IA para descubrir, analizar y documentar requerimientos de software en un entorno controlado e interactivo.

Cuenta con tres casos de estudio preconfigurados (Sistema de inventario para cafetería, App de delivery, Plataforma de gestión escolar) y soporta modos de entrevista individual y panel simultáneo.

---

## Arquitectura de IA

### Motor principal — Cohere AI

El chat principal utiliza el SDK oficial **`cohere-ai`** con el modelo **`command-r-plus-08-2024`**. La comunicación se realiza mediante el método `cohere.chat()` que recibe:

- **`preamble`**: System prompt con la personalidad y sesgos del rol activo.
- **`message`**: Texto de la pregunta del usuario.
- **`chatHistory`**: Historial de la conversación en formato `USER`/`CHATBOT`.

### Evaluación IEEE 830

El botón **"EVALUACIÓN"** también utiliza Cohere AI para compilar todo el historial del chat en un documento de **Especificación de Requerimientos de Software (SRS)** siguiendo la estructura del estándar **IEEE 830**, que incluye:

1. Introducción (propósito, alcance, definiciones)
2. Descripción General (perspectiva, funciones del producto, usuarios, restricciones)
3. Requerimientos Específicos (funcionales y no funcionales con códigos RF/RNF)

---

## Tolerancia a Fallos (Modo Demo)

El sistema implementa un **Modo Local de Respaldo** que se activa automáticamente cuando:

- La API de Cohere no está disponible (error de red, saturación 503).
- La variable de entorno `VITE_COHERE_API_KEY` no está configurada.
- Ocurre cualquier error inesperado en la llamada a la API.

### Chat — Modo Demo local

Cuando el motor principal falla, el sistema intercepta la pregunta del usuario y busca palabras clave relacionadas con el caso de estudio y el rol activo mediante un sistema de reglas:

- **Sponsor**: Palabras clave como *costo, presupuesto, rentabilidad, ROI*.
- **Cliente**: Palabras clave como *proceso, operación, solución, problema*.
- **Usuario Final**: Palabras clave como *fácil, rápido, interfaz, pantalla*.

Si no encuentra coincidencias, devuelve una respuesta genérica coherente con la personalidad del rol. Un indicador visual 🟡 **Modo Local** en la interfaz señala cuándo está activo este modo.

### Evaluación — SRS local

Si la evaluación con Cohere falla, se genera un documento IEEE 830 local que analiza la conversación real: clasifica preguntas abiertas/cerradas, cuenta respuestas detalladas/evasivas, calcula puntuación y produce un SRS estructurado con los requerimientos del caso.

---

## Stack Tecnológico

| Tecnología | Versión |
|-----------|---------|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| Cohere AI SDK | 8 |

---

## Guía de Instalación Local

### Prerrequisitos

- Node.js 18 o superior
- npm 9 o superior
- Una API key de [Cohere](https://dashboard.cohere.com/api-keys)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd ElicitApp

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
# Crea un archivo .env.local en la raíz con:
# VITE_COHERE_API_KEY=tu_api_key_de_cohere

# 4. Iniciar el servidor de desarrollo
npm run dev
```

### Build para producción

```bash
npm run build
npm run preview
```

---

## Créditos

**Jorge Armando Martínez Maldonado**

Estudiante de Ingeniería en Software y Sistemas Computacionales  
Universidad Interamericana para el Desarrollo (UNID)

---

*Proyecto desarrollado como parte del portafolio de evidencias para la materia de Ingeniería de Requisitos.*
