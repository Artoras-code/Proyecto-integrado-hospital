import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Pagination from '../components/Pagination';
import { 
  UserGroupIcon, 
  PlusIcon, 
  TrashIcon, 
  SunIcon, 
  MoonIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';


const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};


const getRandomColor = (id) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
    'bg-pink-500', 'bg-rose-500'
  ];
  return colors[id % colors.length];
};

export default function EquiposPage() {
  const [equipos, setEquipos] = useState([]);
  const [enfermeros, setEnfermeros] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: '',
    turno: 'diurno',
    miembros: [] 
  });


  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDoctor = user.rol === 'doctor';

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const [resEquipos, resEnfermeros] = await Promise.all([
        apiClient.get(`/cuentas/api/equipos/?page=${page}`),
        isDoctor 
          ? apiClient.get('/cuentas/api/usuarios-opciones/?page_size=1000') 
          : Promise.resolve({ data: [] })
      ]);


      if (resEquipos.data.results) {
        setEquipos(resEquipos.data.results);
        setNextPage(resEquipos.data.next);
        setPrevPage(resEquipos.data.previous);
      } else {
        setEquipos(resEquipos.data);
      }

      if (resEnfermeros.data.results) {
        setEnfermeros(resEnfermeros.data.results);
      } else {
        setEnfermeros(resEnfermeros.data);
      }

    } catch (err) {
      console.error("Error cargando datos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async (id) => {
    try {
      await apiClient.post(`/cuentas/api/equipos/${id}/activar/`);
      fetchData(currentPage); 
    } catch (err) {
      alert("Error al activar equipo.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este equipo?")) return;
    try {
      await apiClient.delete(`/cuentas/api/equipos/${id}/`);
      fetchData(currentPage);
    } catch (err) {
      alert("Error al eliminar el equipo.");
    }
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    if (nuevoEquipo.miembros.length === 0) {
        alert("Debes seleccionar al menos un miembro.");
        return;
    }
    try {
      await apiClient.post('/cuentas/api/equipos/', nuevoEquipo);
      setShowModal(false);
      setNuevoEquipo({ nombre: '', turno: 'diurno', miembros: [] });
      fetchData(currentPage);
    } catch (err) {
      alert("Error al crear equipo: " + (err.response?.data?.detail || "Revise los datos"));
    }
  };

  const toggleMiembro = (id) => {
    const current = nuevoEquipo.miembros;
    if (current.includes(id)) {
      setNuevoEquipo({ ...nuevoEquipo, miembros: current.filter(m => m !== id) });
    } else {
      setNuevoEquipo({ ...nuevoEquipo, miembros: [...current, id] });
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 w-full">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            {isDoctor ? "Mis Equipos Médicos" : "Mi Equipo de Trabajo"}
          </h1>
          <p className="mt-2 text-secondary text-lg">
            {isDoctor ? "Gestiona y activa tus turnos clínicos." : "Visualiza tu equipo y turno asignado."}
          </p>
        </div>
        
        {isDoctor && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-accent-mint text-white font-bold rounded-xl shadow-lg hover:bg-accent-mint-hover transition-all transform hover:-translate-y-1"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              Crear Nuevo Equipo
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mb-8 w-full">
        
        {equipos.map((equipo) => (
          <div 
            key={equipo.id} 
            className={`relative bg-surface rounded-2xl p-6 transition-all duration-300 border-2 flex flex-col justify-between
              ${equipo.activo 
                ? 'border-accent-mint shadow-2xl ring-4 ring-accent-mint/10' 
                : 'border-transparent shadow-lg hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700'
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${equipo.turno === 'diurno' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {equipo.turno === 'diurno' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary">{equipo.nombre}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide
                      ${equipo.turno === 'diurno' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                      Turno {equipo.turno}
                    </span>
                </div>
              </div>
              {equipo.activo && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  ACTIVO
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Miembros del Equipo</p>
              <div className="flex -space-x-2 overflow-hidden p-1">
                {equipo.miembros_detalles.map((miembro) => (
                  <div 
                    key={miembro.id}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800 text-white text-xs font-bold shadow-sm ${getRandomColor(miembro.id)}`}
                    title={miembro.nombre_completo}
                  >
                    {getInitials(miembro.nombre_completo)}
                  </div>
                ))}
                {equipo.miembros_detalles.length === 0 && <span className="text-sm text-gray-400 italic">Sin miembros asignados</span>}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {equipo.miembros_detalles.length} {equipo.miembros_detalles.length === 1 ? 'Enfermero/a' : 'Enfermeros/as'}
              </p>
              
              {!isDoctor && (
                 <p className="text-xs text-secondary mt-4 font-medium bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg inline-block">
                    Líder: Dr/a. {equipo.lider_nombre}
                 </p>
              )}
            </div>


            {isDoctor && (
              <div className="pt-4 border-t border-border flex justify-between items-center">
                 <button
                    onClick={() => handleEliminar(equipo.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar Equipo"
                 >
                    <TrashIcon className="h-5 w-5" />
                 </button>

                 {!equipo.activo ? (
                   <button
                      onClick={() => handleActivar(equipo.id)}
                      className="bg-gray-100 dark:bg-gray-700 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-mint hover:text-white transition-all shadow-sm"
                   >
                      Activar Turno
                   </button>
                 ) : (
                   <div className="text-accent-mint text-sm font-bold flex items-center">
                      Turno en Curso
                      <span className="relative flex h-3 w-3 ml-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                   </div>
                 )}
              </div>
            )}

          </div>
        ))}


        {equipos.length === 0 && !loading && (
            <div className="col-span-full w-full flex flex-col items-center justify-center p-12 bg-surface border-2 border-dashed border-gray-300 rounded-2xl">
                <UserGroupIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-primary">
                  {isDoctor ? "No tienes equipos creados" : "No estás asignado a ningún equipo"}
                </h3>
                <p className="text-secondary mb-6">
                  {isDoctor ? "Crea tu primer equipo para comenzar a gestionar tus turnos." : "Pide a tu médico líder que te asigne a un turno."}
                </p>
                {isDoctor && (
                  <button onClick={() => setShowModal(true)} className="text-accent-mint font-bold hover:underline">
                    Crear Equipo Ahora
                  </button>
                )}
            </div>
        )}
      </div>

      {(equipos.length > 0 || currentPage > 1) && (
        <div className="bg-surface rounded-lg border border-border shadow-sm w-full">
            <Pagination 
                currentPage={currentPage}
                hasNext={!!nextPage}
                hasPrevious={!!prevPage}
                onPageChange={setCurrentPage}
            />
        </div>
      )}

      {showModal && isDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
            <div className="bg-surface px-6 py-4 border-b border-border">
                <h3 className="text-xl font-bold text-primary">Configurar Nuevo Equipo</h3>
            </div>

            <form onSubmit={handleCrearEquipo} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Nombre del Equipo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 text-primary p-3 focus:ring-2 focus:ring-accent-mint focus:border-transparent transition-shadow"
                    placeholder="Ej: Equipo A - Urgencias"
                    value={nuevoEquipo.nombre}
                    onChange={e => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Turno</label>
                  <select
                    className="w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 text-primary p-3 focus:ring-2 focus:ring-accent-mint focus:border-transparent"
                    value={nuevoEquipo.turno}
                    onChange={e => setNuevoEquipo({...nuevoEquipo, turno: e.target.value})}
                  >
                    <option value="diurno">🌞 Turno Diurno</option>
                    <option value="nocturno">🌜 Turno Nocturno</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-3">Seleccionar Miembros (Enfermeros)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border">
                  {enfermeros.map(enf => (
                    <div 
                        key={enf.id} 
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${nuevoEquipo.miembros.includes(enf.id) ? 'bg-accent-mint text-white border-accent-mint shadow-md' : 'bg-surface border-gray-200 hover:border-accent-mint'}`} 
                        onClick={() => toggleMiembro(enf.id)}
                    >
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${nuevoEquipo.miembros.includes(enf.id) ? 'bg-white text-accent-mint' : 'bg-gray-200 text-gray-600'}`}>
                        {getInitials(enf.nombre_completo)}
                      </div>
                      <span className="ml-3 text-sm font-medium truncate">{enf.nombre_completo}</span>
                      {nuevoEquipo.miembros.includes(enf.id) && <CheckCircleIcon className="h-5 w-5 ml-auto text-white" />}
                    </div>
                  ))}
                  {enfermeros.length === 0 && <p className="text-sm text-gray-500 p-2">No hay enfermeros disponibles.</p>}
                </div>
                <p className="text-xs text-secondary mt-2 text-right">Seleccionados: {nuevoEquipo.miembros.length}</p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-accent-mint rounded-lg shadow-md hover:bg-accent-mint-hover transition-transform hover:scale-105">Guardar Equipo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}