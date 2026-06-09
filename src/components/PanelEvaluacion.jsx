// © JorgeMrtnz
function StatBar({ label, valor, max, color }) {
  const pct = Math.min(100, Math.round((valor / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{valor}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RequisitoCard({ tipo, items }) {
  const isFuncional = tipo === "funcionales";
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div
        className={`px-5 py-3 ${isFuncional ? "bg-indigo-50" : "bg-amber-50"}`}
      >
        <h3
          className={`font-semibold text-sm ${isFuncional ? "text-indigo-700" : "text-amber-700"}`}
        >
          {isFuncional
            ? "⚙️ Requerimientos Funcionales"
            : "🛡️ Requerimientos No Funcionales"}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {items.length} requerimiento{items.length !== 1 ? "s" : ""}{" "}
          identificado{items.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((req, i) => (
          <div
            key={i}
            className="px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {req}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PanelEvaluacion({
  evaluacion,
  caso,
  onVolverSimulacion,
  onVolverMenu,
}) {
  if (!evaluacion || !caso) return null;

  const {
    puntaje,
    nivel,
    consejo,
    estadisticas,
    consejoRoles,
    requisitos,
    documentoSRS,
  } = evaluacion;

  const getScoreColor = () => {
    if (puntaje >= 80) return "text-emerald-600";
    if (puntaje >= 60) return "text-indigo-600";
    if (puntaje >= 40) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBg = () => {
    if (puntaje >= 80) return "bg-emerald-50 border-emerald-200";
    if (puntaje >= 60) return "bg-indigo-50 border-indigo-200";
    if (puntaje >= 40) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreRing = () => {
    if (puntaje >= 80) return "text-emerald-600";
    if (puntaje >= 60) return "text-indigo-600";
    if (puntaje >= 40) return "text-amber-600";
    return "text-red-500";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{caso.imagen}</span>
            <span className="font-semibold text-slate-800 text-sm">
              {caso.titulo}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onVolverSimulacion}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              ← Volver a simulación.
            </button>
            <button
              onClick={onVolverMenu}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
            >
              🏠 Menú principal.
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className={`rounded-2xl p-8 border-2 ${getScoreBg()} text-center`}>
          <p className="text-sm text-slate-500 mb-1">Puntaje de Elicitación.</p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(puntaje / 100) * 352} 352`}
                className={getScoreRing()}
              />
            </svg>
            <span className={`absolute text-4xl font-bold ${getScoreColor()}`}>
              {puntaje}
            </span>
          </div>
          <h2 className={`text-xl font-bold mt-2 ${getScoreColor()}`}>
            {nivel}
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-1">
            📊 Estadísticas de la sesión.
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Basado en {estadisticas.totalPreguntas} interacciones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <StatBar
                label="Preguntas abiertas"
                valor={estadisticas.preguntasAbiertas}
                max={estadisticas.totalPreguntas || 1}
                color="bg-indigo-500"
              />
              <StatBar
                label="Preguntas cerradas"
                valor={estadisticas.preguntasCerradas}
                max={estadisticas.totalPreguntas || 1}
                color="bg-amber-500"
              />
              <StatBar
                label="Respuestas evasivas"
                valor={estadisticas.respuestasEvasivas}
                max={estadisticas.totalPreguntas || 1}
                color="bg-red-400"
              />
              <StatBar
                label="Respuestas detalladas"
                valor={estadisticas.respuestasDetalladas}
                max={estadisticas.totalPreguntas || 1}
                color="bg-emerald-500"
              />
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">
                  Roles entrevistados.
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {estadisticas.rolesCubiertos} / {Object.keys(caso.roles).length}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Temas explorados.</p>
                <p className="text-lg font-bold text-slate-800">
                  {estadisticas.temasCubiertos}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Total preguntas.</p>
                <p className="text-lg font-bold text-slate-800">
                  {estadisticas.totalPreguntas}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-3">
            💡 Feedback y recomendaciones.
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
              <span className="text-lg flex-shrink-0">📝</span>
              <p className="text-sm text-slate-700">{consejo}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-lg flex-shrink-0">👥</span>
              <p className="text-sm text-slate-700">{consejoRoles}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequisitoCard tipo="funcionales" items={requisitos.funcionales} />
          <RequisitoCard
            tipo="noFuncionales"
            items={requisitos.noFuncionales}
          />
        </div>

        {documentoSRS && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
              <span className="text-lg">📄</span>
              <h3 className="font-semibold text-sm text-white">
                Documento SRS (IEEE 830)
              </h3>
              <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                IEEE 830
              </span>
            </div>
            <div className="p-6 overflow-x-auto">
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {documentoSRS.split("\n").map((linea, i) => {
                  if (linea.startsWith("# "))
                    return (
                      <h1
                        key={i}
                        className="text-lg font-bold text-slate-900 mt-6 mb-3"
                      >
                        {linea.replace(/^# /, "")}
                      </h1>
                    );
                  if (linea.startsWith("## "))
                    return (
                      <h2
                        key={i}
                        className="text-base font-bold text-slate-800 mt-5 mb-2"
                      >
                        {linea.replace(/^## /, "")}
                      </h2>
                    );
                  if (linea.startsWith("### "))
                    return (
                      <h3
                        key={i}
                        className="text-sm font-semibold text-slate-700 mt-4 mb-1"
                      >
                        {linea.replace(/^### /, "")}
                      </h3>
                    );
                  if (linea.startsWith("|") && linea.endsWith("|")) {
                    const esEncabezado = i > 0 && linea.includes("---");
                    const celdas = linea.split("|").filter((c) => c.trim());
                    if (esEncabezado) return null;
                    if (celdas.length <= 2)
                      return (
                        <p key={i} className="text-slate-600 mb-0.5">
                          {celdas.map((c) => c.trim()).join(" — ")}
                        </p>
                      );
                    return null;
                  }
                  if (linea.startsWith("- "))
                    return (
                      <li
                        key={i}
                        className="text-slate-600 ml-4 list-disc text-xs mb-0.5"
                      >
                        {linea.replace(/^- /, "")}
                      </li>
                    );
                  if (linea.trim() === "---")
                    return <hr key={i} className="my-4 border-slate-200" />;
                  if (linea.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="text-slate-600 mb-1">
                      {linea}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="text-center pb-8">
          <button
            onClick={onVolverSimulacion}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            ← Volver a la simulación.
          </button>
        </div>
      </div>
    </div>
  );
}
