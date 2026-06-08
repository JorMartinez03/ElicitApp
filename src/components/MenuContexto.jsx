import { casos } from "../data/simulationData";

function CasoCard({ caso, seleccionado, onSeleccionar }) {
  return (
    <button
      onClick={() => onSeleccionar(caso.id)}
      className={`relative text-left w-full p-6 rounded-xl border-2 transition-all duration-200 ${
        seleccionado === caso.id
          ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100 scale-[1.02]"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl flex-shrink-0">{caso.imagen}</span>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold mb-1 ${
              seleccionado === caso.id ? "text-indigo-700" : "text-slate-800"
            }`}
          >
            Caso {caso.id}: {caso.titulo}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {caso.descripcion}
          </p>
        </div>
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 ${
            seleccionado === caso.id
              ? "border-indigo-500 bg-indigo-500"
              : "border-slate-300"
          }`}
        >
          {seleccionado === caso.id && (
            <svg
              className="w-full h-full text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

export default function MenuContexto({
  casoSeleccionado,
  onSeleccionarCaso,
  onIniciar,
}) {
  const seleccionValida = casoSeleccionado !== null;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Simulador de Ingeniería de Requerimientos.
          </h1>
          <p className="text-slate-500 text-lg">
            Selecciona un caso de estudio para comenzar la simulación de
            elicitación.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {casos.map((caso) => (
            <CasoCard
              key={caso.id}
              caso={caso}
              seleccionado={casoSeleccionado}
              onSeleccionar={onSeleccionarCaso}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onIniciar}
            disabled={!seleccionValida}
            className={`px-10 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
              seleccionValida
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {seleccionValida
              ? "Iniciar Simulación →"
              : "Selecciona un caso para continuar"}
          </button>
          {!seleccionValida && (
            <p className="text-xs text-slate-400 mt-3">
              Debes elegir un caso de estudio antes de continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
