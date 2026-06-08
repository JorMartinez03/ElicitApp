// © JorgeMrtnz
import { useState, useRef, useEffect } from "react";
import { CohereClient } from "cohere-ai";
import {
  construirSystemPrompt,
  formatearHistorial,
  construirPromptEvaluacion,
  generarEvaluacion,
} from "../data/simulationData";

const respuestasDemo = {
  sponsor: {
    palabras: [
      {
        keywords: [
          "costo",
          "presupuesto",
          "dinero",
          "rentabilidad",
          "inversión",
          "retorno",
          "ahorro",
          "ganancia",
        ],
        respuesta:
          "El aspecto financiero es crítico. Necesito ver un análisis detallado de costo-beneficio que demuestre retorno de inversión en menos de un año. Cada funcionalidad debe justificarse en términos de impacto económico.",
      },
      {
        keywords: ["tiempo", "plazo", "entrega", "lanzamiento", "cuándo"],
        respuesta:
          "Los tiempos de entrega son importantes, pero no a costa de la viabilidad financiera. Prefiero un proyecto bien ejecutado en 6 meses que uno apresurado en 3 que no cumpla los objetivos de negocio.",
      },
      {
        keywords: ["calidad", "estándar", "requisito", "funcionalidad"],
        respuesta:
          "La calidad debe estar alineada con lo que el negocio necesita realmente. No quiero sobreingeniería ni funcionalidades que no aporten valor directo a la operación.",
      },
    ],
    porDefecto:
      "Entiendo su pregunta. Desde mi perspectiva, lo fundamental es asegurar que este proyecto genere valor real para la organización. Necesito datos concretos y proyecciones claras para tomar decisiones informadas.",
  },
  cliente: {
    palabras: [
      {
        keywords: [
          "proceso",
          "operación",
          "funcionamiento",
          "trabajo",
          "rutina",
        ],
        respuesta:
          "El proceso actual tiene bastantes puntos de mejora. Trabajo directamente con mi equipo y conozco las fallas: pérdida de información, tareas duplicadas y falta de control. Necesito una solución que entienda nuestra realidad operativa.",
      },
      {
        keywords: ["problema", "error", "falla", "dificultad", "inconveniente"],
        respuesta:
          "Los problemas que enfrentamos son muy concretos. Hemos identificado varias áreas críticas que necesitan atención inmediata. Me gustaría explorar cómo este sistema puede resolverlos de manera práctica.",
      },
      {
        keywords: [
          "solución",
          "herramienta",
          "sistema",
          "software",
          "plataforma",
          "módulo",
        ],
        respuesta:
          "Busco una solución que se adapte a nuestra operación, no una plantilla genérica. He visto muchos sistemas que prometen maravillas pero en la práctica no funcionan porque no consideran cómo trabajamos realmente.",
      },
    ],
    porDefecto:
      "Mi prioridad es encontrar soluciones prácticas a problemas reales. La operación del día a día me ha enseñado que las soluciones más efectivas son las que entienden el contexto donde se implementan.",
  },
  usuario: {
    palabras: [
      {
        keywords: ["fácil", "sencillo", "intuitivo", "usable", "amigable"],
        respuesta:
          "La facilidad de uso es lo más importante. Si el sistema no es intuitivo, no lo voy a usar. Necesito algo rápido, con pocos clicks, que no me obligue a cambiar mi forma de trabajar.",
      },
      {
        keywords: ["rápido", "velocidad", "lento", "demora", "tiempo", "ágil"],
        respuesta:
          "La velocidad es crítica en mi trabajo diario. Cuando estoy en turno, cada segundo cuenta. No puedo estar navegando menús complejos o esperando cargas mientras los clientes esperan.",
      },
      {
        keywords: [
          "pantalla",
          "interfaz",
          "diseño",
          "visual",
          "botón",
          "táctil",
        ],
        respuesta:
          "La interfaz tiene que estar diseñada para el mundo real. Botones grandes, texto claro, que funcione en condiciones reales de trabajo y no solo en un entorno ideal.",
      },
    ],
    porDefecto:
      "Mire, yo estoy en la operación todos los días. Necesito herramientas que me ayuden a hacer mejor mi trabajo, no que me den más carga administrativa. Si el sistema es práctico y me ahorra tiempo, lo voy a adoptar.",
  },
};

function modoDemoLocal(textoUsuario, rolId) {
  const demoRol = respuestasDemo[rolId] || respuestasDemo.cliente;
  const textoLower = textoUsuario.toLowerCase();
  for (const item of demoRol.palabras) {
    if (item.keywords.some((k) => textoLower.includes(k))) {
      return { texto: item.respuesta, tipo: "detallada" };
    }
  }
  return { texto: demoRol.porDefecto, tipo: "detallada" };
}

let cohereClientInstance = null;

function getCohereClient() {
  if (cohereClientInstance) return cohereClientInstance;
  try {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    if (!apiKey) return null;
    cohereClientInstance = new CohereClient({ token: apiKey });
    return cohereClientInstance;
  } catch (err) {
    console.error("Error al inicializar Cohere:", err);
    return null;
  }
}

async function responderIA(
  systemPrompt,
  historial,
  textoUsuario,
  rolId,
  temperatura = 0.8,
) {
  const cohere = getCohereClient();
  if (cohere) {
    try {
      const ultimoMensaje =
        historial.length > 0
          ? historial[historial.length - 1]?.parts?.[0]?.text || textoUsuario
          : textoUsuario;
      const historialPasado = historial.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "USER" : "CHATBOT",
        message: m.parts[0].text,
      }));
      const response = await cohere.chat({
        model: "command-r-plus-08-2024",
        message: ultimoMensaje,
        preamble: systemPrompt,
        chatHistory: historialPasado.length > 0 ? historialPasado : undefined,
        temperature: temperatura,
        p: 0.9,
      });
      const text = response.text || "";
      return {
        texto: text || "No obtuve respuesta.",
        tipo: "detallada",
        modo: "cohere",
      };
    } catch (err) {
      console.warn("Cohere falló, activando Modo Demo Local:", err.message);
    }
  }
  const demo = modoDemoLocal(textoUsuario, rolId);
  return { ...demo, modo: "demo" };
}

function MensajeChat({ mensaje, roles }) {
  const esUsuario = mensaje.tipo === "usuario";
  const esSistema = mensaje.tipo === "sistema";
  const esError = mensaje.tipo === "error";
  const rol = mensaje.dirigidoA && roles ? roles[mensaje.dirigidoA] : null;

  if (esSistema) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-full">
          {mensaje.texto}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${esUsuario ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          esUsuario ? "bg-indigo-100" : esError ? "bg-red-100" : "bg-slate-200"
        }`}
      >
        {esUsuario ? "🧑‍💻" : esError ? "⚠️" : rol?.avatar || "💬"}
      </div>
      <div className={`max-w-[75%] ${esUsuario ? "items-end" : "items-start"}`}>
        {!esUsuario && rol && (
          <p className="text-xs text-slate-400 mb-1 font-medium">
            {rol.nombre}
          </p>
        )}
        {!esUsuario && !rol && mensaje.dirigidoA && (
          <p className="text-xs text-slate-400 mb-1 font-medium capitalize">
            {mensaje.dirigidoA}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            esUsuario
              ? "bg-indigo-600 text-white rounded-tr-md"
              : esError
                ? "bg-red-50 text-red-700 rounded-tl-md border border-red-200"
                : "bg-white text-slate-700 rounded-tl-md border border-slate-200 shadow-sm"
          }`}
        >
          {mensaje.texto}
        </div>
        {mensaje.tipo === "evasiva" && !esUsuario && (
          <p className="text-xs text-amber-500 mt-1">
            ⚠️ Respuesta evasiva — intenta mejorar tu técnica de preguntas.
          </p>
        )}
        {mensaje.tipo === "cerrada" && !esUsuario && (
          <p className="text-xs text-amber-500 mt-1">
            💡 Pregunta cerrada — las preguntas abiertas obtienen mejor
            información.
          </p>
        )}
        {mensaje.tipo === "detallada" && !esUsuario && (
          <p className="text-xs text-emerald-500 mt-1">
            ✅ Buena técnica — obtuviste información detallada.
          </p>
        )}
      </div>
    </div>
  );
}

function RolPestana({ rol, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        activo
          ? "bg-indigo-600 text-white shadow-md"
          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      <span>{rol.avatar}</span>
      <span className="hidden sm:inline">{rol.nombre.split(" ")[0]}</span>
      <span className="text-xs opacity-75">
        (
        {rol.cargo.split("(")[1]?.replace(")", "") || rol.cargo.split(" - ")[0]}
        )
      </span>
    </button>
  );
}

function PerfilRol({ rol }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{rol.avatar}</span>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{rol.nombre}</p>
          <p className="text-xs text-slate-500">{rol.cargo}</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-amber-700 mb-1">
          🎭 Personalidad
        </p>
        <p className="text-xs text-amber-600 leading-relaxed">
          {rol.personalidad}
        </p>
      </div>
      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-700 font-medium">
          Ver sesgos y consejos.
        </summary>
        <ul className="mt-2 space-y-1 pl-4 list-disc">
          {rol.sesgos.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function InterfazSimulacion({
  caso,
  mensajes,
  onEnviarMensaje,
  onEnviarSimultaneo,
  onEvaluar,
  onVolverMenu,
  rolActivo,
  onCambiarRol,
}) {
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [evaluando, setEvaluando] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [modoSimultaneo, setModoSimultaneo] = useState(false);
  const [modoAI, setModoAI] = useState("cohere");
  const finChatRef = useRef(null);
  const inputRef = useRef(null);
  const rol = caso.roles[rolActivo];

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    if (!modoSimultaneo && !enviando) inputRef.current?.focus();
  }, [rolActivo, modoSimultaneo, enviando]);

  async function handleEnviar(e) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || enviando) return;
    setInput("");

    if (modoSimultaneo) {
      setEnviando(true);
      try {
        const roles = Object.values(caso.roles);
        const results = await Promise.all(
          roles.map(async (r) => {
            const sp = construirSystemPrompt(caso, r.id);
            const hist = formatearHistorial(mensajes);
            hist.push({ role: "user", parts: [{ text: texto }] });
            const res = await responderIA(sp, hist, texto, r.id);
            if (res.modo === "demo") setModoAI("demo");
            return res;
          }),
        );
        const respuestas = results.map((res, i) => ({
          texto: res.texto,
          rol: roles[i].id,
          tipo: res.tipo,
          dirigidoA: roles[i].id,
        }));
        onEnviarSimultaneo(texto, respuestas);
      } finally {
        setEnviando(false);
      }
    } else {
      setEnviando(true);
      try {
        const systemPrompt = construirSystemPrompt(caso, rolActivo);
        const historial = formatearHistorial(mensajes);
        historial.push({ role: "user", parts: [{ text: texto }] });
        const respuesta = await responderIA(
          systemPrompt,
          historial,
          texto,
          rolActivo,
        );
        setModoAI(respuesta.modo);
        onEnviarMensaje(texto, rolActivo, respuesta);
      } finally {
        setEnviando(false);
      }
    }
  }

  async function handleClickEvaluar() {
    if (evaluando) return;
    setEvaluando(true);
    try {
      const prompt = construirPromptEvaluacion(caso, mensajes);

      let resultado = null;

      if (import.meta.env.VITE_COHERE_API_KEY) {
        try {
          const ai = new CohereClient({
            token: import.meta.env.VITE_COHERE_API_KEY,
          });
          const response = await ai.chat({
            model: "command-r-plus-08-2024",
            message:
              "Genera el reporte de evaluación IEEE 830 usando las instrucciones del sistema.",
            preamble: prompt,
            temperature: 0.3,
            p: 0.8,
          });
          const text = response.text || "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resultado = JSON.parse(jsonMatch[0]);
          }
        } catch (err) {
          console.error("ERROR REAL DE COHERE EN EVALUACIÓN:", err);
          if (err.message) console.error("Mensaje:", err.message);
          if (err.status) console.error("Status:", err.status);
        }
      }

      if (!resultado) {
        resultado = generarEvaluacion(mensajes, caso.id);
      }

      onEvaluar(resultado);
    } finally {
      setEvaluando(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onVolverMenu}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Volver al menú"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <span className="text-xl mr-2">{caso.imagen}</span>
              <span className="font-semibold text-slate-800 text-sm">
                {caso.titulo}
              </span>
              <span
                className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium align-middle ${
                  modoAI === "cohere"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {modoAI === "cohere" ? "🟢 Cohere AI" : "🟡 Modo Local"}
              </span>
            </div>
          </div>
          <button
            onClick={handleClickEvaluar}
            disabled={
              evaluando ||
              mensajes.filter((m) => m.tipo === "usuario").length === 0
            }
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            {evaluando ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Evaluando...
              </span>
            ) : (
              "📋 EVALUACIÓN"
            )}
          </button>
        </div>
      </header>

      <div className="flex-none bg-slate-100 border-b border-slate-200 px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-slate-500 font-medium mb-2">
            {modoSimultaneo
              ? "Modo panel simultáneo — tu pregunta irá a los 3 stakeholders:"
              : "Selecciona un stakeholder para entrevistar:"}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {!modoSimultaneo &&
              Object.values(caso.roles).map((r) => (
                <RolPestana
                  key={r.id}
                  rol={r}
                  activo={rolActivo === r.id}
                  onClick={() => onCambiarRol(r.id)}
                />
              ))}
            {modoSimultaneo &&
              Object.values(caso.roles).map((r) => (
                <span
                  key={r.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600"
                >
                  <span>{r.avatar}</span>
                  <span className="hidden sm:inline">
                    {r.nombre.split(" ")[0]}
                  </span>
                </span>
              ))}
            {!modoSimultaneo && (
              <button
                onClick={() => setMostrarPerfil(!mostrarPerfil)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  mostrarPerfil
                    ? "bg-slate-200 text-slate-700"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                }`}
                title="Ver perfil del rol activo"
              >
                👤 Perfil
              </button>
            )}
            <button
              onClick={() => {
                setModoSimultaneo(!modoSimultaneo);
                if (!modoSimultaneo) setMostrarPerfil(false);
              }}
              className={`text-xs font-medium px-3 py-2.5 rounded-lg transition-all border-2 ${
                modoSimultaneo
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100"
                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
              }`}
              title="Alternar modo de entrevista"
            >
              {modoSimultaneo ? "👤 Modo Individual" : "🗣️ Panel Simultáneo"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-6xl mx-auto w-full overflow-hidden">
        {mostrarPerfil && !modoSimultaneo && (
          <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto hidden md:block">
            <PerfilRol rol={rol} />
          </div>
        )}

        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {mostrarPerfil && !modoSimultaneo && (
              <div className="md:hidden mb-4">
                <PerfilRol rol={rol} />
              </div>
            )}

            <div className="max-w-3xl mx-auto flex flex-col gap-3">
              {mensajes.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-xl font-semibold text-slate-700 mb-2">
                    Inicia la entrevista.
                  </h2>
                  {modoSimultaneo ? (
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Estás en <strong>modo panel simultáneo</strong>. Cada
                      pregunta se enviará a los 3 stakeholders al mismo tiempo
                      para que puedas comparar sus perspectivas.
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Comienza a conversar con <strong>{rol.nombre}</strong>{" "}
                      para descubrir los requerimientos del sistema. Haz
                      preguntas abiertas para obtener mejor información.
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                      💡 Haz preguntas abiertas.
                    </span>
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-full font-medium">
                      ⚠️ Evita preguntas cerradas.
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">
                      🎯 Explora distintos temas.
                    </span>
                  </div>
                </div>
              )}

              {mensajes.map((m, i) => (
                <MensajeChat key={i} mensaje={m} roles={caso.roles} />
              ))}

              {enviando && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-lg">
                      {modoSimultaneo ? "🗣️" : rol?.avatar || "💬"}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md border border-slate-200 shadow-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {modoSimultaneo
                        ? "Consultando a los 3 stakeholders..."
                        : `${rol.nombre} está escribiendo...`}
                    </p>
                  </div>
                </div>
              )}

              <div ref={finChatRef} />
            </div>
          </div>

          <div className="flex-none border-t border-slate-200 bg-white px-4 py-3">
            <form
              onSubmit={handleEnviar}
              className="max-w-3xl mx-auto flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={enviando}
                placeholder={
                  enviando
                    ? "Esperando respuesta..."
                    : modoSimultaneo
                      ? "Escribe tu pregunta para los 3 stakeholders..."
                      : `Escribe tu pregunta para ${rol.nombre}...`
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-wait"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || enviando}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-200 flex items-center gap-2"
              >
                {enviando ? (
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <>
                    <span className="hidden sm:inline">Enviar</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19V5m0 0l-7 7m7-7l7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
