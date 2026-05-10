import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Shell from '../components/Shell';
import Card from '../components/Card';
import { api, unwrap } from '../lib/api';

type Bottleneck = { conceptSlug: string; courseTitle: string; queryCount: number; uniqueStudents: number };
type AtRiskStudent = { studentId: string; fullName: string; school: string; riskScore: number; lastSeen: string };

export default function Professor() {
  const [school, setSchool] = useState<'ENSA' | 'EST' | 'FAC' | 'ALL'>('ENSA');

  const bottlenecks = useQuery({
    queryKey: ['bottlenecks', school],
    queryFn: () => unwrap<Bottleneck[]>(api.get(`/api/admin/recommendations/concept-bottlenecks?school=${school}`)),
  });
  const atRisk = useQuery({
    queryKey: ['atRisk', school],
    queryFn: () => unwrap<AtRiskStudent[]>(api.get(`/api/admin/recommendations/at-risk-students?school=${school}`)),
  });

  return (
    <Shell title="Tableau de bord — Enseignants">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {(['ENSA', 'EST', 'FAC', 'ALL'] as const).map((s) => (
          <button key={s} onClick={() => setSchool(s)} style={pill(school === s)}>
            {s}
          </button>
        ))}
      </div>

      <div style={grid}>
        <Card title="Concepts les plus demandés" subtitle="Top des concepts pour lesquels les étudiants demandent une explication">
          {bottlenecks.isLoading && <p style={dim}>Chargement…</p>}
          {bottlenecks.error && <p style={err}>Données indisponibles (la base n'est peut-être pas peuplée).</p>}
          {bottlenecks.data && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bottlenecks.data} margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
                <CartesianGrid stroke="#1f2a44" vertical={false} />
                <XAxis dataKey="conceptSlug" stroke="#94A3B8" fontSize={11} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#A5B4FC' }}
                />
                <Bar dataKey="queryCount" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Étudiants à risque" subtitle="Modèle ML — combine score Wd + engagement récent">
          {atRisk.isLoading && <p style={dim}>Chargement…</p>}
          {atRisk.error && <p style={err}>Données indisponibles.</p>}
          {atRisk.data && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {atRisk.data.map((s) => (
                <li key={s.studentId} style={row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                    <div style={dim}>{s.school} · vu {new Date(s.lastSeen).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div style={riskBadge(s.riskScore)}>{Math.round(s.riskScore * 100)} %</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Tableaux Grafana" subtitle="Volumes, distributions, sessions">
          <iframe
            src={`http://localhost:3001/d-solo/professor/professor?orgId=1&theme=dark&kiosk`}
            style={{ width: '100%', height: 320, border: 0, borderRadius: 8 }}
          />
          <p style={dim}>
            <strong>Grafana indisponible ?</strong> Lance-le en local :
            <br /><code>docker run -d -p 3001:3000 -v "$PWD/infra/grafana/provisioning:/etc/grafana/provisioning" grafana/grafana</code>
            <br />puis configure une datasource Postgres (<code>host.docker.internal:5432 / echoid_dev / postgres / postgres</code>).
            Les dashboards JSON dans <code>infra/grafana/provisioning/dashboards/</code> sont auto-chargés.
          </p>
        </Card>
      </div>
    </Shell>
  );
}

const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const pill = (active: boolean): React.CSSProperties => ({
  background: active ? '#6366F1' : '#1E293B',
  color: active ? '#fff' : '#94A3B8',
  border: '1px solid #334155', borderRadius: 999, padding: '6px 14px',
  cursor: 'pointer', fontWeight: 600, fontSize: 13,
});
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 0', borderBottom: '1px solid #1f2a44',
};
const dim: React.CSSProperties = { color: '#94A3B8', fontSize: 12 };
const err: React.CSSProperties = { color: '#F87171', fontSize: 13 };
const riskBadge = (r: number): React.CSSProperties => ({
  background: r > 0.7 ? '#F87171' : r > 0.4 ? '#FBBF24' : '#22C55E',
  color: '#0F172A', borderRadius: 999, padding: '4px 10px', fontWeight: 800, fontSize: 12,
});
