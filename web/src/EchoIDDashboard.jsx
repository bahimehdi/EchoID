import { Fragment, useMemo, useState } from 'react';
import {
  ArrowUpRight, BarChart3, Bell, BookOpen, CheckCircle2, Download,
  FileBarChart, FileText, GraduationCap, Lightbulb, Loader2,
  ShieldAlert, TrendingUp, Users, X,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from './lib/api';

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

const moduleFixtures = {
  algebre: {
    kpis: ['11.8', '61%', '74%', '18', '44'],
    requests: [52, 64, 71, 83, 99, 117, 139, 158],
    submissions: { onTime: [18, 16, 14, 13, 15, 12], late: [8, 10, 12, 14, 11, 16] },
    bottlenecks: [
      ['Diagonalisation', 44, 92],
      ['Valeurs propres', 31, 87],
      ['Jordan', 16, 79],
      ['Produit scalaire', 9, 73],
    ],
    risks: [
      ['Yassine El Idrissi', 82, ['Charge Wd élevée (3.4)', 'Connexion il y a 9 jours']],
      ['Meryem Ait Lahcen', 68, ['3 TD en retard', 'Explainer consulté 17 fois']],
      ['Nabil Tazi', 57, ['Moyenne en baisse', 'Aucun OCR chargé']],
    ],
  },
  thermo: {
    kpis: ['12.9', '69%', '58%', '11', '37'],
    requests: [38, 43, 49, 58, 73, 87, 91, 104],
    submissions: { onTime: [22, 20, 18, 19, 17, 16], late: [5, 8, 9, 7, 10, 11] },
    bottlenecks: [['Cycle de Carnot', 37, 86], ['Enthalpie', 28, 81], ['Premier principe', 23, 84], ['Entropie', 12, 72]],
    risks: [
      ['Imane Bouziane', 74, ['Absence TD 2', 'Connexion il y a 8 jours']],
      ['Adil Roumi', 61, ['Score quiz faible', 'Charge Wd élevée (2.8)']],
    ],
  },
  chimie: {
    kpis: ['13.4', '76%', '49%', '9', '34'],
    requests: [28, 36, 40, 51, 62, 79, 86, 96],
    submissions: { onTime: [20, 21, 18, 22, 19, 20], late: [4, 5, 8, 6, 9, 7] },
    bottlenecks: [['Équilibres chimiques', 34, 84], ['pH et titrage', 27, 79], ['Cinétique', 22, 76], ['Oxydoréduction', 17, 71]],
    risks: [
      ['Salma Kabbaj', 66, ['Deux absences TP', 'Note quiz 6/20']],
      ['Omar Benkirane', 53, ['Rendus tardifs', 'Faible activité LMS']],
    ],
  },
  proba: {
    kpis: ['10.9', '58%', '81%', '21', '60'],
    requests: [64, 73, 81, 104, 126, 149, 173, 195],
    submissions: { onTime: [15, 14, 12, 11, 13, 10], late: [9, 11, 14, 15, 13, 17] },
    bottlenecks: [['Théorème de Bayes', 60, 94], ['Loi normale', 22, 83], ['Estimateurs', 11, 76], ['Variables aléatoires', 7, 70]],
    risks: [
      ['Hiba Mansouri', 86, ['Spike requêtes Bayes', 'Connexion il y a 10 jours']],
      ['Hamza El Malki', 71, ['TD 4 non rendu', 'Charge Wd élevée (3.2)']],
      ['Nora Zahri', 63, ['Note contrôle 7/20', 'Faible présence']],
    ],
  },
  signal: {
    kpis: ['12.1', '64%', '69%', '14', '41'],
    requests: [42, 48, 61, 74, 82, 99, 118, 132],
    submissions: { onTime: [17, 16, 15, 15, 14, 13], late: [7, 8, 10, 9, 12, 13] },
    bottlenecks: [['Transformée de Fourier', 41, 90], ['Filtrage', 25, 82], ['Échantillonnage', 20, 77], ['Convolution', 14, 72]],
    risks: [
      ['Anas Ghazali', 69, ['TP Matlab absent', '11 requêtes Fourier']],
      ['Rania Fikri', 56, ['Retard TD 2', 'Pas de consultation vidéo']],
    ],
  },
  python: {
    kpis: ['14.2', '82%', '52%', '7', '29'],
    requests: [31, 36, 42, 50, 57, 70, 82, 93],
    submissions: { onTime: [25, 24, 22, 23, 21, 20], late: [3, 4, 6, 5, 7, 8] },
    bottlenecks: [['Récursivité', 29, 82], ['Complexité', 25, 79], ['Fichiers CSV', 21, 75], ['Dictionnaires', 14, 70]],
    risks: [
      ['Mehdi Alaoui', 58, ['Erreurs récursivité', 'Deux tentatives échouées']],
      ['Sara Berrada', 51, ['Upload absent', 'Temps IDE faible']],
    ],
  },
};

const weekLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const tdLabels = ['TD1', 'TD2', 'TD3', 'TD4', 'TD5', 'TD6'];
const professorKpiLabels = ['Moyenne /20', 'Taux de rendu', 'Usage explainer', 'Docs OCR chargés', 'Bottleneck index'];

const cheatingClusters = [
  {
    assignment: 'TD 3 - Diagonalisation',
    similarity: 92,
    students: ['Yassine El Idrissi', 'Nabil Tazi', 'Hiba Mansouri'],
    evidence: ['Commentaires identiques aux lignes 42-49', 'Même variable tmpEigenVec', 'Soumissions dans une fenêtre de 11 min'],
  },
  {
    assignment: 'TP Python - Fichiers CSV',
    similarity: 88,
    students: ['Sara Berrada', 'Mehdi Alaoui'],
    evidence: ['Même ordre de fonctions auxiliaires', 'Nom de fichier test_data_final_v2.csv', 'Erreur copiée sur la gestion des NaN'],
  },
];

const recommendations = [
  ['TD soutien Diagonalisation', 'Programmer une séance courte avant l’examen dans 12 jours, centrée sur valeurs propres et dimension de l’espace propre.', 91, 'Haute', Lightbulb, COLORS.red],
  ['Révision Théorème de Bayes', 'Le volume de requêtes a triplé depuis S6 : publier un corrigé commenté et un quiz de 8 minutes.', 88, 'Haute', TrendingUp, COLORS.orange],
  ['Décaler deadline +48h', 'Projection : le taux de rendu passerait de 63% à 88% sur les TDs en cours.', 84, 'Moyenne', FileText, COLORS.green],
  ['Notifications dimanche 19h', 'Les relances envoyées à ce créneau obtiennent un engagement 3.2× supérieur.', 79, 'Faible', Bell, COLORS.navy],
];

const platformKpis = [
  ['Étudiants actifs (7j)', '312', '+8%'],
  ['Sessions cette semaine', '1,847', '+14%'],
  ['Requêtes explainer', '2,134', '+32%'],
  ['Docs OCR', '58', '+11%'],
  ['Étudiants à risque', '4', '-2'],
  ['Taux de rendu', '86%', '+6 pts'],
];

const adminLines = {
  algebre: [52, 64, 71, 83, 99, 117, 139, 158],
  thermo: [38, 43, 49, 58, 73, 87, 91, 104],
  chimie: [28, 36, 40, 51, 62, 79, 86, 96],
  proba: [64, 73, 81, 104, 126, 149, 173, 195],
  signal: [42, 48, 61, 74, 82, 99, 118, 132],
  python: [31, 36, 42, 50, 57, 70, 82, 93],
};

const weekdays = [
  ['Lun', 212], ['Mar', 238], ['Mer', 251], ['Jeu', 276], ['Ven', 229], ['Sam', 190], ['Dim', 352],
];

const difficultConcepts = [
  ['Théorème de Bayes', 60, COLORS.navy],
  ['Diagonalisation', 44, COLORS.orange],
  ['Fourier', 41, COLORS.green],
  ['Carnot', 37, COLORS.red],
  ['Équilibres chimiques', 34, '#7C3AED'],
  ['Récursivité', 29, '#0891B2'],
];

const professors = [
  ['Pr. El Fassi', 'Algèbre, Signal', '12.4', '91%', '76%', '4.4', [82, 76, 88, 72]],
  ['Pr. Benali', 'Thermo, Chimie', '13.1', '86%', '69%', '4.2', [78, 71, 82, 75]],
  ['Pr. Chraibi', 'Probabilités', '11.2', '79%', '81%', '3.9', [69, 88, 74, 67]],
  ['Pr. Amrani', 'Python', '14.6', '94%', '58%', '4.7', [91, 65, 92, 84]],
];

const allRisk = [
  ['Hiba Mansouri', 'Probabilités', 86, ['Spike requêtes Bayes', 'Connexion il y a 10 jours']],
  ['Yassine El Idrissi', 'Algèbre', 82, ['Charge Wd élevée (3.4)', 'Connexion il y a 9 jours']],
  ['Imane Bouziane', 'Thermodynamique', 74, ['Absence TD 2', 'Score quiz faible']],
];

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
  const activeModule = moduleFixtures[moduleId];

  const bottlenecks = useQuery({
    queryKey: ['bottlenecks', tab],
    queryFn: () => unwrap(api.get(`${BASE}/concept-bottlenecks?school=ALL`)),
  });

  const atRisk = useQuery({
    queryKey: ['at-risk', tab],
    queryFn: () => unwrap(api.get(`${BASE}/at-risk-students?school=ALL&limit=10`)),
  });

  const cheating = useQuery({
    queryKey: ['cheating', tab],
    queryFn: () => unwrap(api.get(`${BASE}/cheating-clusters?school=ENSA`)),
  });

  const interventions = useQuery({
    queryKey: ['interventions', tab],
    queryFn: () => unwrap(api.get(`${BASE}/intervention-suggestions`)),
  });

  const openPdf = () => {
    setPdfScope(tab === 'admin' ? 'Cohorte complète' : 'Par module');
    setPdfOpen(true);
  };

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
              <h1 className="text-xl font-black text-[#1E3A8A]">Tableaux de bord demo</h1>
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
        {tab === 'prof' ? (
          <ProfessorDashboard
            key={moduleId}
            moduleId={moduleId}
            setModuleId={setModuleId}
            fixture={activeModule}
            bottlenecks={bottlenecks.data}
            atRisk={atRisk.data}
            cheating={cheating.data}
            interventions={interventions.data}
          />
        ) : (
          <AdminDashboard
            bottlenecks={bottlenecks.data}
            atRisk={atRisk.data}
            interventions={interventions.data}
          />
        )}
      </main>

      {pdfOpen && <PdfModal tab={tab} scope={pdfScope} setScope={setPdfScope} onClose={() => setPdfOpen(false)} />}
    </div>
  );
}

function ProfessorDashboard({ moduleId, setModuleId, fixture, bottlenecks, atRisk, cheating, interventions }) {
  const lineData = useMemo(() => ({
    labels: weekLabels,
    datasets: [{ data: fixture.requests, borderColor: COLORS.navy, backgroundColor: 'rgba(30,58,138,0.12)', fill: true, tension: 0.42, pointRadius: 4 }],
  }), [fixture]);

  const stackedData = useMemo(() => ({
    labels: tdLabels,
    datasets: [
      { label: 'À temps', data: fixture.submissions.onTime, backgroundColor: COLORS.green, borderRadius: 8 },
      { label: 'En retard 1-2j', data: fixture.submissions.late, backgroundColor: COLORS.orange, borderRadius: 8 },
    ],
  }), [fixture]);

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {professorKpiLabels.map((label, idx) => <KpiCard key={label} label={label} value={fixture.kpis[idx]} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Volume de requêtes explainer" icon={TrendingUp}>
          <ChartBox><Line key={`${moduleId}-line`} data={lineData} options={chartBaseOptions} /></ChartBox>
          <Insight accent="navy">Adoption +72% sur 8 semaines. Action recommandée : réserver un quota explainer supplémentaire avant les révisions.</Insight>
        </Card>

        <Card title="Soumissions vs deadlines" icon={FileText}>
          <Legend items={[['À temps', COLORS.green], ['En retard 1-2j', COLORS.orange]]} />
          <ChartBox><Bar key={`${moduleId}-stacked`} data={stackedData} options={{ ...chartBaseOptions, scales: { ...chartBaseOptions.scales, x: { ...chartBaseOptions.scales.x, stacked: true }, y: { ...chartBaseOptions.scales.y, stacked: true } } }} /></ChartBox>
          <Insight accent="orange">63% en retard. Décaler la deadline de +48h projette 88% de rendu. Confiance 84%.</Insight>
        </Card>

        <Card title="Concepts difficiles" icon={BarChart3}>
          <div className="space-y-4">
            {(bottlenecks?.concepts ?? fixture.bottlenecks).map((item) => {
              const label = item.concept ?? item[0];
              const value = item.queryCount ?? item[1];
              const confidence = item.confidence ?? item[2];
              return (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm font-bold">
                    <span>{label}</span><span className="text-slate-500">{value} requêtes · conf. {confidence}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#1E3A8A]" style={{ width: `${Math.min(100, value)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Étudiants à risque" icon={Users}>
          <div className="grid gap-3">
            {(atRisk?.students ?? fixture.risks).map((student) => {
              const items = Array.isArray(student) ? student : [student.name, student.riskScore, student.reasons ?? []];
              return <RiskCard key={items[0]} student={items} />;
            })}
          </div>
        </Card>

        <Card title="Détection de triche" icon={ShieldAlert} className="xl:col-span-2">
          <div className="grid gap-4 lg:grid-cols-2">
            {(cheating?.clusters ?? cheatingClusters).map((cluster) => {
              const c = cluster.assignment ? cluster : {
                assignment: cluster.assignmentTitle ?? 'Soumission suspecte',
                similarity: Math.round((cluster.avgSimilarity ?? 0.85) * 100),
                students: (cluster.students ?? []).map((s) => s.name ?? s),
                evidence: cluster.evidence ?? [],
              };
              return <CheatingCluster key={c.assignment} cluster={c} />;
            })}
          </div>
          <Insight accent="red">Les clusters détectés ont une probabilité de coïncidence inférieure à 1% selon les signaux combinés.</Insight>
        </Card>

        <Card title="Recommandations IA" icon={Lightbulb} className="xl:col-span-2">
          <RecommendationGrid scope="Module sélectionné" suggestions={interventions?.suggestions} />
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ bottlenecks, atRisk, interventions }) {
  const multiLine = {
    labels: weekLabels,
    datasets: MODULES.map((module, i) => ({
      label: module.label,
      data: adminLines[module.id],
      borderColor: [COLORS.navy, COLORS.orange, COLORS.green, COLORS.red, '#7C3AED', '#0891B2'][i],
      backgroundColor: 'transparent',
      tension: 0.35,
      pointRadius: 2,
    })),
  };
  const weekdayData = {
    labels: weekdays.map(([day]) => day),
    datasets: [{ data: weekdays.map(([, value]) => value), backgroundColor: weekdays.map(([day]) => day === 'Dim' ? COLORS.navy : 'rgba(30,58,138,0.35)'), borderRadius: 8 }],
  };
  const cohortStacked = {
    labels: tdLabels,
    datasets: [
      { label: 'À temps', data: [126, 118, 111, 107, 120, 116], backgroundColor: COLORS.green, borderRadius: 8 },
      { label: 'En retard', data: [29, 36, 44, 48, 31, 38], backgroundColor: COLORS.orange, borderRadius: 8 },
    ],
  };
  const donutData = {
    labels: difficultConcepts.map(([label]) => label),
    datasets: [{ data: difficultConcepts.map(([, value]) => value), backgroundColor: difficultConcepts.map(([, , color]) => color), borderWidth: 0 }],
  };

  return (
    <div className="space-y-5">
      <SectionLabel>Vue plateforme</SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {platformKpis.map(([label, value, delta]) => <KpiCard key={label} label={label} value={value} delta={delta} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Usage explainer multi-modules" icon={TrendingUp} className="xl:col-span-2">
          <Legend items={MODULES.map((m, i) => [m.label, [COLORS.navy, COLORS.orange, COLORS.green, COLORS.red, '#7C3AED', '#0891B2'][i]])} />
          <ChartBox tall><Line data={multiLine} options={chartBaseOptions} /></ChartBox>
        </Card>

        <Card title="Engagement par jour" icon={Bell}>
          <ChartBox><Bar data={weekdayData} options={{ ...chartBaseOptions, indexAxis: 'y' }} /></ChartBox>
          <Insight accent="navy">Pic le dimanche soir : programmer les notifications push le dimanche à 19h.</Insight>
        </Card>

        <Card title="Cohorte ENSAK complète" icon={FileText}>
          <Legend items={[['À temps', COLORS.green], ['En retard', COLORS.orange]]} />
          <ChartBox><Bar data={cohortStacked} options={{ ...chartBaseOptions, scales: { ...chartBaseOptions.scales, x: { ...chartBaseOptions.scales.x, stacked: true }, y: { ...chartBaseOptions.scales.y, stacked: true } } }} /></ChartBox>
        </Card>

        <Card title="Top concepts difficiles" icon={BookOpen}>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <ChartBox compact><Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '62%' }} /></ChartBox>
            <div className="space-y-2">
              {(bottlenecks?.concepts ?? difficultConcepts).map((item) => {
                const label = item.concept ?? item[0];
                const value = item.queryCount ?? item[1];
                const color = item.color ?? item[2] ?? COLORS.navy;
                return (
                  <div key={label} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-sm font-bold">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="flex-1">{label}</span>
                    <span className="text-slate-500">{value} requêtes</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Insight accent="orange">Les concepts les plus consultés indiquent les points de blocage de la cohorte.</Insight>
        </Card>

        <ProfessorTable />

        <Card title="Étudiants à risque" icon={Users}>
          <div className="grid gap-3">
            {(atRisk?.students ?? allRisk).map((student) => {
              const items = Array.isArray(student) ? student : [student.name, student.module ?? student.school, student.riskScore, student.reasons ?? []];
              return <RiskCard key={items[0]} student={items} withModule />;
            })}
          </div>
        </Card>

        <Card title="Interventions recommandées" icon={Lightbulb} className="xl:col-span-2">
          <RecommendationGrid scope="Cohorte ENSAK" suggestions={interventions?.suggestions} />
        </Card>
      </div>
    </div>
  );
}

function ProfessorTable() {
  const [open, setOpen] = useState('Pr. El Fassi');
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
              <Fragment key={p[0]}>
                <tr onClick={() => setOpen(open === p[0] ? '' : p[0])} className="cursor-pointer border-b hover:bg-slate-50">
                  {p.slice(0, 6).map((v) => <td key={v} className="py-3 font-semibold">{v}</td>)}
                  <td className="h-16 w-28 py-2"><RadarMini values={p[6]} /></td>
                </tr>
                {open === p[0] && (
                  <tr>
                    <td colSpan={7} className="bg-slate-50 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          {['Engagement', 'Réactivité', 'Progression', 'Satisfaction'].map((label, idx) => (
                            <div key={label}>
                              <div className="mb-1 flex justify-between text-xs font-bold text-slate-600"><span>{label}</span><span>{p[6][idx]}%</span></div>
                              <div className="h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-[#1E3A8A]" style={{ width: `${p[6][idx]}%` }} /></div>
                            </div>
                          ))}
                        </div>
                        <ChartBox compact><Radar data={radarData(p[6])} options={radarOptions} /></ChartBox>
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
  const [name, moduleOrRisk, riskOrReasons, maybeReasons] = student;
  const risk = withModule ? riskOrReasons : moduleOrRisk;
  const reasons = withModule ? maybeReasons : riskOrReasons;
  const module = withModule ? moduleOrRisk : null;
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <AvatarStack names={[name]} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-black">{name}</h3>
          {module && <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#1E3A8A]">{module}</span>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${risk >= 75 ? 'bg-red-50 text-[#DC2626]' : 'bg-orange-50 text-[#F97316]'}`}>{risk}%</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {reasons.map((reason) => <span key={reason} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{reason}</span>)}
      </div>
    </article>
  );
}

function CheatingCluster({ cluster }) {
  return (
    <article className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{cluster.assignment}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{cluster.students.join(', ')}</p>
        </div>
        <span className="rounded-full bg-[#DC2626] px-3 py-1 text-xs font-black text-white">{cluster.similarity}% similaire</span>
      </div>
      <div className="mt-3"><AvatarStack names={cluster.students} /></div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-semibold text-slate-700">
        {cluster.evidence.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <button className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-black text-[#DC2626] shadow-sm">Ouvrir sur Moodle →</button>
    </article>
  );
}

function RecommendationGrid({ scope, suggestions }) {
  const items = suggestions && suggestions.length > 0
    ? suggestions.map((s) => [s.title ?? s.action, s.description ?? s.text, Math.round((s.confidence ?? 0.5) * 100), s.urgency ?? 'Moyenne', Lightbulb, COLORS.navy])
    : recommendations;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(([title, text, confidence, urgency, Icon, color]) => (
        <article key={title} className="rounded-2xl border-l-4 bg-slate-50 p-4" style={{ borderColor: color }}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Icon size={17} style={{ color }} /><h3 className="font-black">{title}</h3></div>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">{urgency}</span>
          </div>
          <p className="text-sm font-semibold leading-6 text-slate-600">{scope} · {text}</p>
          <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500">Confiance {confidence}%</p>
        </article>
      ))}
    </div>
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
