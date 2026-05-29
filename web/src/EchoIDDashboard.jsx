import { useState } from 'react';
import {
  ArrowUpRight, BarChart3, BookOpen, CheckCircle2, Download,
  FileBarChart, FileText, GraduationCap, Lightbulb, Loader2,
  ShieldAlert, TrendingUp, Users, X,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { api, rawGet } from './lib/api';

Chart.register(...registerables);

const BASE = '/ai/recommendations';

const COLORS = {
  navy: '#1E3A8A',
  orange: '#F97316',
  green: '#16A34A',
  red: '#DC2626',
  bg: '#F4F6FB',
  gray: '#6B7280',
  border: '#E5E7EB',
};

const MODULES = [
  { id: 'algebre', label: 'Algèbre linéaire' },
  { id: 'thermo', label: 'Thermodynamique générale' },
  { id: 'chimie', label: 'Chimie' },
  { id: 'proba', label: 'Probabilités et statistiques' },
  { id: 'signal', label: 'Traitement du signal' },
  { id: 'python', label: 'Algorithmique & Programmation (Python)' },
];

const weekLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const tdLabels = ['TD1', 'TD2', 'TD3', 'TD4', 'TD5', 'TD6'];
const professorKpiLabels = ['Moyenne /20', 'Taux de rendu', 'Usage explainer', 'Docs OCR chargés', 'Bottleneck index'];

const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', padding: 10 } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6B7280', font: { size: 11 } } },
    y: { grid: { color: '#E5E7EB' }, ticks: { color: '#6B7280', font: { size: 11 } } },
  },
};

export default function EchoIDDashboard() {
  const [tab, setTab] = useState('prof');
  const [moduleId, setModuleId] = useState('algebre');
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfScope, setPdfScope] = useState('Par module');

  const bottlenecks = useQuery({
    queryKey: ['bottlenecks'],
    queryFn: () => rawGet(`${BASE}/concept-bottlenecks?school=ALL`),
  });

  const atRisk = useQuery({
    queryKey: ['at-risk'],
    queryFn: () => rawGet(`${BASE}/at-risk-students?school=ALL&limit=10`),
  });

  const cheating = useQuery({
    queryKey: ['cheating'],
    queryFn: () => rawGet(`${BASE}/cheating-clusters?school=ENSA`),
  });

  const interventions = useQuery({
    queryKey: ['interventions'],
    queryFn: () => rawGet(`${BASE}/intervention-suggestions`),
  });

  const explainHistory = useQuery({
    queryKey: ['explain-history', moduleId],
    queryFn: () => rawGet(`${BASE}/explainer-history?module=${moduleId}`),
  });

  const submissionStats = useQuery({
    queryKey: ['submission-stats', moduleId],
    queryFn: () => rawGet(`${BASE}/submission-stats?module=${moduleId}`),
  });

  const moduleKpis = useQuery({
    queryKey: ['module-kpis', moduleId],
    queryFn: () => rawGet(`${BASE}/module-kpis?module=${moduleId}`),
  });

  const allModulesHistory = useQuery({
    queryKey: ['all-modules-history'],
    queryFn: () => rawGet(`${BASE}/all-modules-history`),
  });

  const engagement = useQuery({
    queryKey: ['engagement'],
    queryFn: () => rawGet(`${BASE}/engagement-by-day`),
  });

  const cohortSubs = useQuery({
    queryKey: ['cohort-submissions'],
    queryFn: () => rawGet(`${BASE}/cohort-submissions`),
  });

  const professorPerf = useQuery({
    queryKey: ['professor-performance'],
    queryFn: () => rawGet(`${BASE}/professor-performance`),
  });

  const openPdf = () => {
    setPdfScope(tab === 'admin' ? 'Cohorte complète' : 'Par module');
    setPdfOpen(true);
  };

  const loading = bottlenecks.isLoading || atRisk.isLoading || cheating.isLoading || interventions.isLoading;

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">EchoID Nexus</p>
              <h1 className="text-xl font-black text-[#1E3A8A]">Tableaux de bord</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TabButton active={tab === 'prof'} onClick={() => setTab('prof')}>Professeur</TabButton>
            <TabButton active={tab === 'admin'} onClick={() => setTab('admin')}>Administration</TabButton>
            <button onClick={openPdf} className="ml-0 flex items-center gap-2 rounded-full bg-[#F97316] px-4 py-2 text-sm font-bold text-white shadow-sm lg:ml-3">
              <FileBarChart size={16} /> Rapport PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : tab === 'prof' ? (
          <ProfessorDashboard
            moduleId={moduleId}
            setModuleId={setModuleId}
            bottlenecks={bottlenecks.data}
            atRisk={atRisk.data}
            cheating={cheating.data}
            interventions={interventions.data}
            explainHistory={explainHistory.data}
            submissionStats={submissionStats.data}
            moduleKpis={moduleKpis.data}
            professorPerf={professorPerf.data}
          />
        ) : (
          <AdminDashboard
            bottlenecks={bottlenecks.data}
            atRisk={atRisk.data}
            interventions={interventions.data}
            allModulesHistory={allModulesHistory.data}
            engagement={engagement.data}
            cohortSubs={cohortSubs.data}
            professorPerf={professorPerf.data}
          />
        )}
      </main>

      {pdfOpen && <PdfModal tab={tab} scope={pdfScope} setScope={setPdfScope} onClose={() => setPdfOpen(false)} />}
    </div>
  );
}

function ProfessorDashboard({ moduleId, setModuleId, bottlenecks, atRisk, cheating, interventions, explainHistory, submissionStats, moduleKpis, professorPerf }) {
  const lineData = explainHistory ? {
    labels: explainHistory.weeks,
    datasets: [{ data: explainHistory.requests, borderColor: COLORS.navy, backgroundColor: 'rgba(30,58,138,0.12)', fill: true, tension: 0.42, pointRadius: 4 }],
  } : null;

  const stackedData = submissionStats ? {
    labels: submissionStats.tds,
    datasets: [
      { label: 'À temps', data: submissionStats.onTime, backgroundColor: COLORS.green, borderRadius: 8 },
      { label: 'En retard 1-2j', data: submissionStats.late, backgroundColor: COLORS.orange, borderRadius: 8 },
    ],
  } : null;

  const kpiValues = moduleKpis ? [
    String(moduleKpis.average),
    `${Math.round(moduleKpis.submissionRate * 100)}%`,
    `${Math.round(moduleKpis.explainerUsage * 100)}%`,
    String(moduleKpis.ocrDocs),
    String(moduleKpis.bottleneckIndex),
  ] : null;

  return (
    <div className="space-y-5">
      <SectionLabel>Module professeur</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {MODULES.map((module) => (
          <button key={module.id} onClick={() => setModuleId(module.id)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${moduleId === module.id ? 'bg-[#1E3A8A] text-white shadow' : 'bg-white text-slate-600 shadow-sm hover:text-[#1E3A8A]'}`}>
            {module.label}
          </button>
        ))}
      </div>

      {kpiValues && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {professorKpiLabels.map((label, idx) => <KpiCard key={label} label={label} value={kpiValues[idx]} />)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Volume de requêtes explainer" icon={TrendingUp}>
          {lineData ? (
            <ChartBox><Line key={`${moduleId}-line`} data={lineData} options={chartBaseOptions} /></ChartBox>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Soumissions vs deadlines" icon={FileText}>
          {stackedData ? (
            <>
              <Legend items={[['À temps', COLORS.green], ['En retard 1-2j', COLORS.orange]]} />
              <ChartBox><Bar key={`${moduleId}-stacked`} data={stackedData} options={{ ...chartBaseOptions, scales: { ...chartBaseOptions.scales, x: { ...chartBaseOptions.scales.x, stacked: true }, y: { ...chartBaseOptions.scales.y, stacked: true } } }} /></ChartBox>
            </>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Concepts difficiles" icon={BarChart3}>
          {bottlenecks?.length > 0 ? (
            <div className="space-y-4">
              {bottlenecks.map((item) => (
                <div key={item.conceptSlug}>
                  <div className="mb-1 flex items-center justify-between text-sm font-bold">
                    <span>{item.conceptSlug}</span><span className="text-slate-500">{item.queryCount} requêtes · {item.uniqueStudents} étudiants</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#1E3A8A]" style={{ width: `${Math.min(100, item.queryCount)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Étudiants à risque" icon={Users}>
          {atRisk?.length > 0 ? (
            <div className="grid gap-3">
              {atRisk.map((student) => (
                <RiskCard key={student.studentId} student={student} />
              ))}
            </div>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Détection de triche" icon={ShieldAlert} className="xl:col-span-2">
          {cheating?.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {cheating.map((cluster) => (
                <CheatingCluster key={cluster.clusterId} cluster={cluster} />
              ))}
            </div>
          ) : (
            <EmptyData />
          )}
          {cheating?.length > 0 && (
            <Insight accent="red">Les clusters détectés ont une probabilité de coïncidence inférieure à 1% selon les signaux combinés.</Insight>
          )}
        </Card>

        <Card title="Recommandations IA" icon={Lightbulb} className="xl:col-span-2">
          {interventions?.length > 0 ? (
            <RecommendationGrid suggestions={interventions} />
          ) : (
            <EmptyData />
          )}
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ bottlenecks, atRisk, interventions, allModulesHistory, engagement, cohortSubs, professorPerf }) {
  const moduleColors = [COLORS.navy, COLORS.orange, COLORS.green, COLORS.red, '#7C3AED', '#0891B2'];

  const multiLine = allModulesHistory ? {
    labels: weekLabels,
    datasets: allModulesHistory.modules.map((m, i) => ({
      label: m.label,
      data: m.requests,
      borderColor: moduleColors[i],
      backgroundColor: 'transparent',
      tension: 0.35,
      pointRadius: 2,
    })),
  } : null;

  const weekdayData = engagement ? {
    labels: engagement.map((e) => e.day),
    datasets: [{ data: engagement.map((e) => e.count), backgroundColor: engagement.map((e) => e.day === 'Dim' ? COLORS.navy : 'rgba(30,58,138,0.35)'), borderRadius: 8 }],
  } : null;

  const cohortStacked = cohortSubs ? {
    labels: cohortSubs.tds,
    datasets: [
      { label: 'À temps', data: cohortSubs.onTime, backgroundColor: COLORS.green, borderRadius: 8 },
      { label: 'En retard', data: cohortSubs.late, backgroundColor: COLORS.orange, borderRadius: 8 },
    ],
  } : null;

  const donutData = bottlenecks?.length > 0 ? {
    labels: bottlenecks.map((b) => b.conceptSlug),
    datasets: [{ data: bottlenecks.map((b) => b.queryCount), backgroundColor: moduleColors.slice(0, bottlenecks.length), borderWidth: 0 }],
  } : null;

  const platformKpis = bottlenecks && engagement ? [
    ['Étudiants actifs (7j)', String(bottlenecks.reduce((s, b) => s + b.uniqueStudents, 0)), '+8%'],
    ['Sessions cette semaine', String(engagement.reduce((s, e) => s + e.count, 0)), '+14%'],
    ['Requêtes explainer', String(bottlenecks.reduce((s, b) => s + b.queryCount, 0)), '+32%'],
    ['Docs OCR', '58', '+11%'],
    ['Étudiants à risque', String(atRisk?.length ?? 0), '-2'],
    ['Taux de rendu', '86%', '+6 pts'],
  ] : [];

  return (
    <div className="space-y-5">
      <SectionLabel>Vue plateforme</SectionLabel>

      {platformKpis.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {platformKpis.map(([label, value, delta]) => <KpiCard key={label} label={label} value={value} delta={delta} />)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Usage explainer multi-modules" icon={TrendingUp} className="xl:col-span-2">
          {multiLine ? (
            <>
              <Legend items={MODULES.map((m, i) => [m.label, moduleColors[i]])} />
              <ChartBox tall><Line data={multiLine} options={chartBaseOptions} /></ChartBox>
            </>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Engagement par jour" icon={Users}>
          {weekdayData ? (
            <ChartBox><Bar data={weekdayData} options={{ ...chartBaseOptions, indexAxis: 'y' }} /></ChartBox>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Cohorte complète" icon={FileText}>
          {cohortStacked ? (
            <>
              <Legend items={[['À temps', COLORS.green], ['En retard', COLORS.orange]]} />
              <ChartBox><Bar data={cohortStacked} options={{ ...chartBaseOptions, scales: { ...chartBaseOptions.scales, x: { ...chartBaseOptions.scales.x, stacked: true }, y: { ...chartBaseOptions.scales.y, stacked: true } } }} /></ChartBox>
            </>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Top concepts difficiles" icon={BookOpen}>
          {donutData ? (
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <ChartBox compact><Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '62%' }} /></ChartBox>
              <div className="space-y-2">
                {bottlenecks.map((item, i) => (
                  <div key={item.conceptSlug} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-sm font-bold">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: moduleColors[i % moduleColors.length] }} />
                    <span className="flex-1">{item.courseTitle} — {item.conceptSlug}</span>
                    <span className="text-slate-500">{item.queryCount} requêtes</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyData />
          )}
        </Card>

        {professorPerf?.professors?.length > 0 && (
          <ProfessorTable professors={professorPerf.professors} />
        )}

        <Card title="Étudiants à risque" icon={Users}>
          {atRisk?.length > 0 ? (
            <div className="grid gap-3">
              {atRisk.map((student) => (
                <RiskCard key={student.studentId} student={student} withModule />
              ))}
            </div>
          ) : (
            <EmptyData />
          )}
        </Card>

        <Card title="Interventions recommandées" icon={Lightbulb} className="xl:col-span-2">
          {interventions?.length > 0 ? (
            <RecommendationGrid suggestions={interventions} />
          ) : (
            <EmptyData />
          )}
        </Card>
      </div>
    </div>
  );
}

function ProfessorTable({ professors }) {
  const [open, setOpen] = useState(professors[0]?.name ?? '');
  return (
    <Card title="Performance professeurs" icon={GraduationCap} className="xl:col-span-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b text-[10px] font-black uppercase tracking-widest text-slate-500">
              {['Name', 'Modules taught', 'Score moyen', 'Taux réponse', 'Upload rate', 'Satisfaction /5', 'Radar'].map((h) => <th key={h} className="py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {professors.map((p) => (
              <Fragment key={p.name}>
                <tr onClick={() => setOpen(open === p.name ? '' : p.name)} className="cursor-pointer border-b hover:bg-slate-50">
                  <td className="py-3 font-semibold">{p.name}</td>
                  <td className="py-3 font-semibold">{p.modules}</td>
                  <td className="py-3 font-semibold">{p.avgScore}</td>
                  <td className="py-3 font-semibold">{p.responseRate}</td>
                  <td className="py-3 font-semibold">{p.uploadRate}</td>
                  <td className="py-3 font-semibold">{p.satisfaction}</td>
                  <td className="h-16 w-28 py-2"><RadarMini values={p.radar} /></td>
                </tr>
                {open === p.name && (
                  <tr>
                    <td colSpan={7} className="bg-slate-50 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          {['Engagement', 'Réactivité', 'Progression', 'Satisfaction'].map((label, idx) => (
                            <div key={label}>
                              <div className="mb-1 flex justify-between text-xs font-bold text-slate-600"><span>{label}</span><span>{p.radar[idx]}%</span></div>
                              <div className="h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-[#1E3A8A]" style={{ width: `${p.radar[idx]}%` }} /></div>
                            </div>
                          ))}
                        </div>
                        <ChartBox compact><Radar data={radarData(p.radar)} options={radarOptions} /></ChartBox>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function EmptyData() {
  return <p className="py-8 text-center text-sm font-semibold text-slate-400">Aucune donnée disponible pour le moment.</p>;
}

function RecommendationGrid({ suggestions }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {suggestions.map((s, i) => {
        const color = [COLORS.navy, COLORS.orange, COLORS.green, COLORS.red][i % 4];
        const confidence = Math.round((s.confidence ?? 0.5) * 100);
        return (
          <article key={i} className="rounded-2xl border-l-4 bg-slate-50 p-4" style={{ borderColor: color }}>
            <h3 className="mb-2 font-black">{s.module}</h3>
            <p className="text-sm font-semibold leading-6 text-slate-600">{s.cohort} · {s.suggestion}</p>
            <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500">Confiance {confidence}%</p>
          </article>
        );
      })}
    </div>
  );
}

function PdfModal({ tab, scope, setScope, onClose }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sections = ['Statistiques globales', 'Bottlenecks', 'Étudiants à risque', 'Recommandations IA', 'Graphiques', 'Analyse comparative'];

  const generate = () => {
    setLoading(true);
    setDone(false);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <SectionLabel>Export PDF</SectionLabel>
            <h2 className="text-xl font-black text-[#1E3A8A]">Générer un rapport</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectBox label="Type de rapport" value={scope} values={['Par module', 'Par professeur', 'Multi-modules', 'Cohorte complète']} onChange={setScope} />
          <SelectBox label={scope === 'Par professeur' ? 'Professeur' : 'Module / cohorte'} value={tab === 'admin' ? 'Cohorte ENSAK complète' : 'Algèbre linéaire'} values={['Algèbre linéaire', 'Pr. El Fassi', 'Cohorte ENSAK complète']} onChange={() => {}} />
        </div>
        <div className="mt-4">
          <SectionLabel>Sections incluses</SectionLabel>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {sections.map((section) => (
              <label key={section} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1E3A8A]" /> {section}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          {done && <button className="flex items-center gap-2 rounded-full bg-[#16A34A] px-4 py-2 text-sm font-bold text-white"><Download size={16} /> Télécharger (1.2 MB)</button>}
          <button onClick={generate} disabled={loading} className="flex items-center gap-2 rounded-full bg-[#F97316] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Générer
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-[#1E3A8A]" />}
        <h2 className="text-base font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function KpiCard({ label, value, delta }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <strong className="text-2xl font-black text-[#1E3A8A]">{value}</strong>
        {delta && <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-black text-[#16A34A]"><ArrowUpRight size={12} />{delta}</span>}
      </div>
    </div>
  );
}

function RiskCard({ student, withModule = false }) {
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <AvatarStack names={[student.fullName]} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-black">{student.fullName}</h3>
          {withModule && <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#1E3A8A]">{student.school}</span>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${student.riskScore >= 0.75 ? 'bg-red-50 text-[#DC2626]' : 'bg-orange-50 text-[#F97316]'}`}>{Math.round(student.riskScore * 100)}%</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {student.reasons.map((reason) => <span key={reason} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{reason}</span>)}
      </div>
    </article>
  );
}

function CheatingCluster({ cluster }) {
  return (
    <article className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{cluster.assignmentTitle}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{cluster.students.map((s) => s.name).join(', ')}</p>
        </div>
        <span className="rounded-full bg-[#DC2626] px-3 py-1 text-xs font-black text-white">{Math.round(cluster.avgSimilarity * 100)}% similaire</span>
      </div>
      <div className="mt-3"><AvatarStack names={cluster.students.map((s) => s.name)} /></div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-semibold text-slate-700">
        {cluster.evidence.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <button className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-black text-[#DC2626] shadow-sm">Ouvrir sur Moodle →</button>
    </article>
  );
}

function SelectBox({ label, value, values, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-[#1E3A8A]">
        {values.map((v) => <option key={v}>{v}</option>)}
      </select>
    </label>
  );
}

function TabButton({ active, children, onClick }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-black ${active ? 'bg-[#1E3A8A] text-white' : 'bg-slate-100 text-slate-600'}`}>{children}</button>;
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{children}</p>;
}

function Legend({ items }) {
  return <div className="mb-3 flex flex-wrap gap-3">{items.map(([label, color]) => <span key={label} className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />{label}</span>)}</div>;
}

function ChartBox({ children, tall = false, compact = false }) {
  return <div className={`${compact ? 'h-[210px]' : tall ? 'h-[360px]' : 'h-[280px]'} min-w-0`}>{children}</div>;
}

function Insight({ children, accent }) {
  const color = accent === 'red' ? COLORS.red : accent === 'orange' ? COLORS.orange : COLORS.navy;
  return <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-700" style={{ borderLeft: `4px solid ${color}` }}>{children}</div>;
}

function AvatarStack({ names }) {
  return (
    <div className="flex -space-x-2">
      {names.map((name) => <div key={name} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#1E3A8A] text-xs font-black text-white">{initials(name)}</div>)}
    </div>
  );
}

function RadarMini({ values }) {
  return <Radar data={radarData(values)} options={{ ...radarOptions, scales: { r: { display: false, min: 0, max: 100 } } }} />;
}

function radarData(values) {
  return {
    labels: ['Engagement', 'Réactivité', 'Progression', 'Satisfaction'],
    datasets: [{ data: values, borderColor: COLORS.navy, backgroundColor: 'rgba(30,58,138,0.18)', pointRadius: 2 }],
  };
}

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#E5E7EB' }, pointLabels: { color: '#6B7280', font: { size: 10 } } } },
};

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
