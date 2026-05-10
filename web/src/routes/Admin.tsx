import { useQuery } from '@tanstack/react-query';
import Shell from '../components/Shell';
import Card from '../components/Card';
import { api, unwrap } from '../lib/api';

type AdminHealth = {
  totalActiveStudents: number;
  totalUploadsThisWeek: number;
  atRiskCount: number;
  lmsStatus: string;
  aiServiceStatus: string;
  lastEventReceivedAt: string;
};

type Suggestion = { cohort: string; module: string; suggestion: string; confidence: number };

export default function Admin() {
  const health = useQuery({
    queryKey: ['adminHealth'],
    queryFn: () => unwrap<AdminHealth>(api.get('/api/admin/health')),
  });
  const suggestions = useQuery({
    queryKey: ['interventions'],
    queryFn: () => unwrap<Suggestion[]>(api.get('/api/admin/recommendations/intervention-suggestions')),
  });

  return (
    <Shell title="Tableau de bord — Administrateurs">
      {health.error && (
        <div style={errBanner}>
          ⚠ /api/admin/health a échoué : {(health.error as Error).message}.
          Vérifie que tu es bien connecté en tant qu'admin (déconnecte-toi puis re-login).
        </div>
      )}
      <div style={kpiRow}>
        <Kpi label="Étudiants actifs (7 j)" value={health.data?.totalActiveStudents ?? '—'} />
        <Kpi label="Uploads cette semaine" value={health.data?.totalUploadsThisWeek ?? '—'} />
        <Kpi label="Étudiants à risque" value={health.data?.atRiskCount ?? '—'} />
        <Kpi label="LMS" value={health.data?.lmsStatus ?? '—'} />
        <Kpi label="AI service" value={health.data?.aiServiceStatus ?? '—'} />
      </div>

      <div style={grid}>
        <Card title="Recommandations d'intervention" subtitle="Règles ML : déclenchées quand un goulot dépasse le seuil et un examen approche">
          {suggestions.isLoading && <p style={dim}>Chargement…</p>}
          {suggestions.error && <p style={err}>Données indisponibles : {(suggestions.error as Error).message}</p>}
          {suggestions.data && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {suggestions.data.map((s, i) => (
                <li key={i} style={card2}>
                  <div style={{ fontWeight: 600 }}>{s.cohort} — {s.module}</div>
                  <p style={{ margin: '4px 0', color: '#CBD5E1', fontSize: 13 }}>{s.suggestion}</p>
                  <div style={dim}>Confiance : {Math.round(s.confidence * 100)} %</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Tableaux Grafana" subtitle="Vue plateforme : volumes par école, sessions, OCR">
          <iframe
            src={`http://localhost:3001/d-solo/admin/admin?orgId=1&theme=dark&kiosk`}
            style={{ width: '100%', height: 360, border: 0, borderRadius: 8 }}
          />
          <p style={dim}>
            <strong>Grafana indisponible ?</strong> Lance-le en local :
            <br /><code>docker run -d -p 3001:3000 -v "$PWD/infra/grafana/provisioning:/etc/grafana/provisioning" grafana/grafana</code>
            <br />puis configure une datasource Postgres pointant sur <code>host.docker.internal:5432 / echoid_dev / postgres / postgres</code>.
            Les dashboards JSON dans <code>infra/grafana/provisioning/dashboards/</code> seront chargés automatiquement.
          </p>
        </Card>
      </div>
    </Shell>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={kpi}>
      <div style={{ color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const kpiRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 };
const kpi: React.CSSProperties = { background: '#1E293B', borderRadius: 14, padding: 16, border: '1px solid #1f2a44' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const card2: React.CSSProperties = { padding: 12, borderBottom: '1px solid #1f2a44' };
const dim: React.CSSProperties = { color: '#94A3B8', fontSize: 12 };
const err: React.CSSProperties = { color: '#F87171', fontSize: 13 };
const errBanner: React.CSSProperties = {
  background: '#3F1D1D', color: '#FCA5A5', borderRadius: 8, padding: 12,
  marginBottom: 12, fontSize: 13, border: '1px solid #7F1D1D',
};
