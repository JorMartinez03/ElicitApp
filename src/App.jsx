// © JorgeMrtnz
import { useState, useCallback } from "react";
import { casos } from "./data/simulationData";
import MenuContexto from "./components/MenuContexto";
import InterfazSimulacion from "./components/InterfazSimulacion";
import PanelEvaluacion from "./components/PanelEvaluacion";

function App() {
  const [pantalla, setPantalla] = useState("menu");
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  const [rolActivo, setRolActivo] = useState("sponsor");
  const [mensajes, setMensajes] = useState([]);
  const [evaluacion, setEvaluacion] = useState(null);

  const caso = casoSeleccionado
    ? casos.find((c) => c.id === casoSeleccionado)
    : null;

  const handleIniciarSimulacion = useCallback(() => {
    setRolActivo("sponsor");
    setMensajes([
      {
        texto:
          "Has iniciado la simulación. Selecciona un stakeholder en las pestañas superiores y comienza a hacer preguntas para descubrir los requerimientos del sistema.",
        rol: "sistema",
        tipo: "sistema",
      },
    ]);
    setEvaluacion(null);
    setPantalla("simulacion");
  }, []);

  const handleEnviarMensaje = useCallback((texto, dirigidoA, respuesta) => {
    const msgUsuario = { texto, rol: "usuario", tipo: "usuario", dirigidoA };
    const msgRespuesta = {
      texto: respuesta.texto,
      rol: dirigidoA,
      tipo: respuesta.tipo,
      dirigidoA,
    };
    setMensajes((prev) => [...prev, msgUsuario, msgRespuesta]);
  }, []);

  const handleEnviarSimultaneo = useCallback((texto, respuestas) => {
    const msgUsuario = {
      texto,
      rol: "usuario",
      tipo: "usuario",
      dirigidoA: "todos",
    };
    setMensajes((prev) => [...prev, msgUsuario, ...respuestas]);
  }, []);

  const handleEvaluar = useCallback((resultado) => {
    setEvaluacion(resultado);
    setPantalla("evaluacion");
  }, []);

  const handleVolverSimulacion = useCallback(() => {
    setPantalla("simulacion");
  }, []);

  const handleVolverMenu = useCallback(() => {
    setPantalla("menu");
    setCasoSeleccionado(null);
    setMensajes([]);
    setEvaluacion(null);
  }, []);

  const handleCambiarRol = useCallback((rolId) => {
    setRolActivo(rolId);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {pantalla === "menu" && (
        <MenuContexto
          casoSeleccionado={casoSeleccionado}
          onSeleccionarCaso={setCasoSeleccionado}
          onIniciar={handleIniciarSimulacion}
        />
      )}

      {pantalla === "simulacion" && caso && (
        <InterfazSimulacion
          caso={caso}
          mensajes={mensajes}
          onEnviarMensaje={handleEnviarMensaje}
          onEnviarSimultaneo={handleEnviarSimultaneo}
          onEvaluar={handleEvaluar}
          onVolverMenu={handleVolverMenu}
          rolActivo={rolActivo}
          onCambiarRol={handleCambiarRol}
        />
      )}

      {pantalla === "evaluacion" && evaluacion && caso && (
        <PanelEvaluacion
          evaluacion={evaluacion}
          caso={caso}
          onVolverSimulacion={handleVolverSimulacion}
          onVolverMenu={handleVolverMenu}
        />
      )}
    </div>
  );
}

export default App;
