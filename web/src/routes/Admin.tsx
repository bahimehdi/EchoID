import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Shell from '../components/Shell';
import Card from '../components/Card';
import InsightBlock from '../components/InsightBlock';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  adminInsights,
  cohortHealth,
  deadlineSubmissions,
  difficultConcepts,
  weekdayEngagement,
  weeklyExplainer,
} from '../lib/insightsFixtures';
import { api, unwrap } from '../lib/api';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type AdminHealth = {
  totalActiveStudents: number;
  totalUploadsThisWeek: number;
  atRiskCount: number;
  lmsStatus: string;
  aiServiceStatus: string;
  lastEventReceivedAt: string;
};

export default function Admin() {
  const health = useQuery({
    queryKey: ['adminHealth'],
    queryFn: () => unwrap<AdminHealth>(api.get('/api/admin/health')),
  });

  return (
    <Shell title="Tableau de bord" subtitle="Vue administrateur - pilote ENSAK">
      {health.error && (
        <div style={errBanner}>
          /api/admin/health a échoué : {(health.error as Error).message}. Reconnecte-toi avec le compte admin demo.
        </div>
      )}

      <section style={sectionHeader}>
        <Badge tone="primary">Pilotage ENSAK</Badge>
        <h2 style={sectionTitle}>Signaux opérationnels</h2>
      </section>

      <div style={kpiRow}>
        <StatCard label="Étudiants actifs" value={health.data?.totalActiveStudents ?? '—'} detail="7 jours" />
        <StatCard label="Uploads" value={health.data?.totalUploadsThisWeek ?? '—'} detail="semaine" accent="blue" />
        <StatCard label="À risque" value={health.data?.atRiskCount ?? '—'} detail="surveillance" accent="orange" />
        <StatCard label="LMS" value={health.data?.lmsStatus ?? '—'} detail="Moodle + Classroom" accent="green" />
        <StatCard label="AI service" value={health.data?.aiServiceStatus ?? '—'} detail="NexusAI" accent="green" />
      </div>

      <div style={dashboardGrid}>
        <Card title="Volume des requêtes NexusAI" subtitle="Requêtes explainer par semaine" accent="primary">
          <div style={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyExplainer} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="usage" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="week" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="requests" stroke={colors.primary} strokeWidth={3} fill="url(#usage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <InsightBlock insight={adminInsights.usage} />
        </Card>

        <Card title="Soumissions vs deadlines" subtitle="Rendus à temps et retards de 1-2 jours" accent="orange">
          <div style={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deadlineSubmissions} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="label" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="onTime" name="À temps" fill={colors.accentGreen} radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" name="Retard 1-2 j" fill={colors.accentOrange} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBlock insight={adminInsights.deadlines} accent="orange" />
        </Card>

        <Card title="Santé des cohortes ENSA" subtitle="Activité, risque et taux de retard" accent="blue">
          <div style={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortHealth} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke={colors.border} vertical={false} />
                <XAxis dataKey="cohort" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active" name="Actifs 7 j" stackId="a" fill={colors.primary} radius={[8, 8, 0, 0]} />
                <Bar dataKey="atRisk" name="À risque" stackId="a" fill={colors.accentRed} />
                <Bar dataKey="lateRate" name="Retard %" stackId="a" fill={colors.accentOrange} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBlock insight={adminInsights.cohort} accent="blue" />
        </Card>

        <Card title="Engagement par jour" subtitle="Sessions moyennes par jour de semaine" accent="green">
          <div style={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayEngagement} layout="vertical" margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke={colors.border} horizontal={false} />
                <XAxis type="number" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="day" type="category" stroke={colors.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sessions" name="Sessions" fill={colors.accentGreen} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBlock insight={adminInsights.weekday} accent="green" />
        </Card>

        <Card title="Top concepts difficiles" subtitle="Répartition des demandes par module" accent="purple" style={{ gridColumn: '1 / -1' }}>
          <div style={conceptGrid}>
            <div style={donutBox}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={difficultConcepts}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    nameKey="name"
                  >
                    {difficultConcepts.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={conceptList}>
              {difficultConcepts.map((concept) => (
                <div key={concept.name} style={conceptRow}>
                  <span style={{ ...dot, background: concept.color }} />
                  <span style={{ flex: 1 }}>{concept.name}</span>
                  <strong>{concept.value} %</strong>
                </div>
              ))}
            </div>
          </div>
          <InsightBlock insight={adminInsights.concepts} accent="purple" />
        </Card>

        <Card title="Grafana" subtitle="Analyse approfondie hors parcours demo" accent="red" style={{ gridColumn: '1 / -1' }}>
          <div style={grafanaBox}>
            <div>
              <strong style={{ color: colors.text }}>Recommandation actuelle</strong>
              <p style={grafanaText}>
                Ne pas montrer l'iframe Grafana dans le web app tant que l'embed local n'est pas stable. Pour le corriger:
                lancer le stack Docker complet, vérifier la datasource Postgres, puis activer explicitement l'embed anonyme côté Grafana.
              </p>
            </div>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" style={grafanaLink}>
              Ouvrir Grafana local
            </a>
          </div>
        </Card>
      </div>
    </Shell>
  );
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

const kpiRow: React.CSSProperties = {
  display: 'grid',
  gap: spacing.md,
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  marginBottom: spacing.lg,
};

const dashboardGrid: React.CSSProperties = {
  display: 'grid',
  gap: spacing.lg,
  gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
};

const chartBox: React.CSSProperties = {
  height: 260,
  minWidth: 0,
};

const tooltipStyle: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  boxShadow: '0 12px 24px rgba(11, 27, 69, 0.10)',
  color: colors.text,
};

const conceptGrid: React.CSSProperties = {
  alignItems: 'center',
  display: 'grid',
  gap: spacing.lg,
  gridTemplateColumns: 'minmax(260px, 0.8fr) minmax(260px, 1fr)',
};

const donutBox: React.CSSProperties = {
  minWidth: 0,
};

const conceptList: React.CSSProperties = {
  display: 'grid',
  gap: spacing.sm,
};

const conceptRow: React.CSSProperties = {
  alignItems: 'center',
  background: colors.surfaceMuted,
  borderRadius: radius.md,
  color: colors.text,
  display: 'flex',
  fontSize: fontSize.md,
  gap: spacing.sm,
  padding: `${spacing.md}px ${spacing.lg}px`,
};

const dot: React.CSSProperties = {
  borderRadius: radius.pill,
  height: 10,
  width: 10,
};

const grafanaBox: React.CSSProperties = {
  alignItems: 'center',
  background: colors.accentRedSoft,
  borderRadius: radius.md,
  display: 'flex',
  gap: spacing.lg,
  justifyContent: 'space-between',
  padding: spacing.lg,
};

const grafanaText: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.md,
  lineHeight: 1.5,
  margin: `${spacing.xs}px 0 0`,
};

const grafanaLink: React.CSSProperties = {
  background: colors.surface,
  borderRadius: radius.md,
  color: colors.accentRed,
  flex: '0 0 auto',
  fontSize: fontSize.md,
  fontWeight: 900,
  padding: `${spacing.md}px ${spacing.lg}px`,
  textDecoration: 'none',
};

const errBanner: React.CSSProperties = {
  background: colors.accentRedSoft,
  border: `1px solid ${colors.accentRed}`,
  borderRadius: radius.md,
  color: colors.accentRed,
  fontSize: fontSize.md,
  marginBottom: spacing.md,
  padding: spacing.md,
};
