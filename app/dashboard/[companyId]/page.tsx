import React from 'react';

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminDashboardPage(props: PageProps) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const companyId = params.companyId;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Panel de Administración
          </span>
          <h1 className="text-3xl font-bold mt-3">SERVE — Centro de Operaciones</h1>
          <p className="text-slate-400 mt-1">Gestión interna de clientes, accesos y métricas para la empresa: {companyId}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-sm font-medium text-slate-400">Total Solicitudes</h3>
            <p className="text-3xl font-bold mt-2 text-white">0</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-sm font-medium text-slate-400">Miembros Activos</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">En sincronización</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-sm font-medium text-slate-400">Estado Webhook</h3>
            <p className="text-3xl font-bold mt-2 text-blue-400">Conectado</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Configuración Rápida</h2>
          <p className="text-sm text-slate-400 mb-4">
            Aquí podrás administrar las solicitudes entrantes de tus alumnos y actualizar la URL de acceso a Zoom.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            ID de la Compañía: {companyId}
          </div>
        </div>
      </div>
    </main>
  );
}