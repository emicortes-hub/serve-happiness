import React from 'react';

interface PageProps {
  params: Promise<{ experienceId: string }>;
  searchParams?: Promise<{ user_id?: string }>;
}

export default async function StudentExperiencePage(props: PageProps) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const experienceId = params.experienceId;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Pro Sales Training Hub
          </span>
          <h1 className="text-3xl font-bold mt-3">Mi espacio de ventas y soporte</h1>
          <p className="text-slate-400 mt-1">Tu centro de acompañamiento directo con el equipo y recursos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Mis Solicitudes</h2>
            <p className="text-sm text-slate-400 mb-4">Revisa el estado de tus dudas y soporte técnico con los asesores.</p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              Nueva Solicitud
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Sesiones en Vivo</h2>
            <p className="text-sm text-slate-400 mb-4">Consulta los horarios de mentoría y accesos directos a Zoom.</p>
            <a 
              href="https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Unirme a la Sala
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}