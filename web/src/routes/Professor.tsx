import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Shell from '../components/Shell';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Donut from '../components/Donut';
import InsightBlock from '../components/InsightBlock';
import { api, unwrap } from '../lib/api';
import { demoCheatingClusters, professorInsights, pythonGradeDistribution } from '../lib/insightsFixtures';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type Bottleneck = { conceptSlug: string; courseTitle: string; queryCount: number; uniqueStudents: number };
type AtRiskStudent = {
  studentId: string;
  fullName: string;
  school: string;
  riskScore: number;
  lastSeen: string;
  reasons?: string[];
};
type CheatingCluster = {
  clusterId: string;
  assignmentTitle: string;
  module: string;
  avgSimilarity: number;
  submittedWithinMinutes: number;
  students: Array<{ id: string; name: string }>;
  evidence: string[];
  recommendation: string;
};

export default function Professor() {
  const school = 'ENSA';

  const bottlenecks = useQuery({
    queryKey: ['bottlenecks', school],
    queryFn: () => unwrap<Bottleneck[]>(api.get(`/api/admin/recommendations/concept-bottlenecks?school=${school}`)),
  });
  const atRisk = useQuery({
    queryKey: ['atRisk', school],
    queryFn: () => unwrap<AtRiskStudent[]>(api.get(`/api/admin/recommendations/at-risk-students?school=${school}&limit=6`)),
  });
  const cheating = useQuery({
    queryKey: ['cheatingClusters', school],
    queryFn: async () => {
      try {
        return await unwrap<CheatingCluster[]>(api.get(`/api/admin/recommendations/cheating-clusters?school=${school}`));
      } catch {
        return demoCheatingClusters;
      }
    },
  });

  return (
    <Shell title="Tableau de bord" subtitle="Cohorte : ENSA - Cycle préparatoire">
      <section style={sectionHeader}>
        <Badge tone="primary">ENSA uniquement</Badge>
        <h2 style={sectionTitle}>Signaux pédagogiques</h2>
      </section>

      <div style={grid}>
        <Card title="Concepts les plus demandés" subtitle="Demandes NexusAI par concept cette semaine" accent="primary">
          {bottlenecks.isLoading && <p style={dim}>Chargement...</p>}
          {bottlenecks.error && <p style={err}>Données indisponibles.</p>}
          {bottlenecks.data && (
            <div style={chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottlenecks.data.slice(0, 6)} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke={colors.border} vertical={false} />
                  <XAxis dataKey="conceptSlug" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={62} />
                  <YAxis stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="queryCount" name="Requêtes" fill={colors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Étudiants à risque" subtitle="Raisons principales du score de risque" accent="orange">
          {atRisk.isLoading && <p style={dim}>Chargement...</p>}
          {atRisk.error && <p style={err}>Données indisponibles.</p>}
          {atRisk.data?.length === 0 && <p style={dim}>Aucun étudiant à risque détecté cette semaine.</p>}
          {atRisk.data && (
            <div style={riskList}>
              {atRisk.data.map((student) => (
                <article key={student.studentId} style={riskCard}>
                  <div style={riskTopline}>
                    <div style={avatar}>{initials(student.fullName)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={studentName}>{student.fullName}</strong>
                      <div style={dim}>{student.school} · vu {new Date(student.lastSeen).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <span style={riskBadge(student.riskScore)}>{Math.round(student.riskScore * 100)} %</span>
                  </div>
                  <div style={reasons}>
                    {(student.reasons ?? ['Raison non fournie par le modèle']).slice(0, 2).map((reason) => (
                      <span key={reason} style={reasonPill}>{reason}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Notes Moodle - TP Python" subtitle="Distribution après correction" accent="green">
          <div style={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pythonGradeDistribution} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="bucket" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="students" name="Étudiants" fill={colors.accentGreen} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Soumissions à examiner" subtitle="Similarité élevée sur réponses Python" accent="red">
          {cheating.isLoading && <p style={dim}>Chargement...</p>}
          {cheating.data?.map((cluster) => (
            <article key={cluster.clusterId} style={clusterCard}>
              <div style={clusterHeader}>
                <Donut pct={Math.round(cluster.avgSimilarity * 100)} color={colors.accentRed} caption="similarité" />
                <div style={{ flex: 1 }}>
                  <Badge tone="red">Cluster {cluster.clusterId}</Badge>
                  <h3 style={clusterTitle}>{cluster.module} - {cluster.assignmentTitle}</h3>
                  <p style={clusterText}>
                    {cluster.students.map((student) => student.name).join(', ')} · fenêtre de {cluster.submittedWithinMinutes} min.
                  </p>
                </div>
              </div>
              <ul style={evidenceList}>
                {cluster.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div style={recommendation}>{cluster.recommendation}</div>
            </article>
          ))}
          <InsightBlock insight={professorInsights.cheating} accent="red" />
        </Card>
      </div>
    </Shell>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const sectionHeader: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.md,
  marginBottom: spacing.md,
};

const sectionTitle: React.CSSProperties = {
  color: colors.text,
  fontSize: fontSize.xl,
  fontWeight: 900,
  margin: 0,
};

const grid: React.CSSProperties = {
  display: 'grid',
  gap: spacing.lg,
  gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
};

const chartBox: React.CSSProperties = {
  height: 280,
  minWidth: 0,
};

const riskList: React.CSSProperties = {
  display: 'grid',
  gap: spacing.md,
};

const riskCard: React.CSSProperties = {
  background: colors.surfaceMuted,
  borderRadius: radius.md,
  padding: spacing.md,
};

const riskTopline: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.md,
};

const avatar: React.CSSProperties = {
  alignItems: 'center',
  background: colors.primarySoft,
  borderRadius: radius.pill,
  color: colors.primary,
  display: 'grid',
  flex: '0 0 auto',
  fontSize: fontSize.sm,
  fontWeight: 900,
  height: 42,
  justifyItems: 'center',
  width: 42,
};

const studentName: React.CSSProperties = {
  color: colors.text,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const reasons: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: spacing.sm,
  marginTop: spacing.md,
};

const reasonPill: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.pill,
  color: colors.textMuted,
  fontSize: fontSize.sm,
  fontWeight: 700,
  maxWidth: '100%',
  overflow: 'hidden',
  padding: '6px 10px',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const clusterCard: React.CSSProperties = {
  background: colors.surfaceMuted,
  borderRadius: radius.md,
  padding: spacing.lg,
};

const clusterHeader: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: spacing.lg,
};

const clusterTitle: React.CSSProperties = {
  color: colors.text,
  fontSize: fontSize.xl,
  fontWeight: 900,
  margin: `${spacing.sm}px 0 ${spacing.xs}px`,
};

const clusterText: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.md,
  lineHeight: 1.45,
  margin: 0,
};

const evidenceList: React.CSSProperties = {
  color: colors.text,
  display: 'grid',
  fontSize: fontSize.md,
  gap: spacing.sm,
  lineHeight: 1.45,
  margin: `${spacing.lg}px 0 0`,
  paddingLeft: spacing.xl,
};

const recommendation: React.CSSProperties = {
  background: colors.accentRedSoft,
  borderRadius: radius.md,
  color: colors.accentRed,
  fontSize: fontSize.md,
  fontWeight: 800,
  lineHeight: 1.45,
  marginTop: spacing.lg,
  padding: spacing.md,
};

const dim: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.sm,
};

const err: React.CSSProperties = {
  color: colors.accentRed,
  fontSize: fontSize.sm,
};

const tooltipStyle: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  boxShadow: '0 12px 24px rgba(11, 27, 69, 0.10)',
  color: colors.text,
};

const riskBadge = (risk: number): React.CSSProperties => ({
  background: risk > 0.7 ? colors.accentRedSoft : risk > 0.4 ? colors.accentOrangeSoft : colors.accentGreenSoft,
  borderRadius: radius.pill,
  color: risk > 0.7 ? colors.accentRed : risk > 0.4 ? colors.accentOrange : colors.accentGreen,
  flex: '0 0 auto',
  fontSize: fontSize.sm,
  fontWeight: 900,
  padding: '6px 10px',
});
