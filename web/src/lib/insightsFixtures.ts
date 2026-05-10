import { colors } from './theme';

export type Insight = {
  headline: string;
  body: string;
  action: string;
  confidence: number;
};

export const weeklyExplainer = [
  { week: 'Sem 38', requests: 40 },
  { week: 'Sem 39', requests: 62 },
  { week: 'Sem 40', requests: 58 },
  { week: 'Sem 41', requests: 91 },
  { week: 'Sem 42', requests: 110 },
  { week: 'Sem 43', requests: 145 },
  { week: 'Sem 44', requests: 132 },
  { week: 'Sem 45', requests: 168 },
];

export const deadlineSubmissions = [
  { label: 'TD Thermo', onTime: 34, late: 58 },
  { label: 'TD Algebre', onTime: 38, late: 61 },
  { label: 'TP Python', onTime: 42, late: 55 },
  { label: 'TD Proba', onTime: 33, late: 64 },
];

export const cohortHealth = [
  { cohort: 'CP1 S1', active: 31, atRisk: 2, lateRate: 18 },
  { cohort: 'CP1 S2', active: 47, atRisk: 5, lateRate: 31 },
  { cohort: 'CP2 S3', active: 29, atRisk: 3, lateRate: 22 },
  { cohort: 'CP2 S4', active: 36, atRisk: 2, lateRate: 16 },
];

export const weekdayEngagement = [
  { day: 'Lun', sessions: 38 },
  { day: 'Mar', sessions: 29 },
  { day: 'Mer', sessions: 22 },
  { day: 'Jeu', sessions: 35 },
  { day: 'Ven', sessions: 41 },
  { day: 'Sam', sessions: 46 },
  { day: 'Dim', sessions: 71 },
];

export const difficultConcepts = [
  { name: 'Thermo', value: 28, color: colors.primary },
  { name: 'Algebre', value: 21, color: colors.accentOrange },
  { name: 'Proba', value: 19, color: colors.accentGreen },
  { name: 'Python', value: 17, color: colors.accentBlue },
  { name: 'Chimie', value: 15, color: colors.accentPurple },
];

export const pythonGradeDistribution = [
  { bucket: '0-5', students: 2 },
  { bucket: '6-8', students: 5 },
  { bucket: '9-11', students: 10 },
  { bucket: '12-14', students: 18 },
  { bucket: '15-17', students: 9 },
  { bucket: '18-20', students: 3 },
];

export const demoCheatingClusters = [
  {
    clusterId: 'PY-R-01',
    assignmentTitle: 'TP Python - Récursivité',
    module: 'Algorithmique & Programmation',
    avgSimilarity: 0.88,
    submittedWithinMinutes: 11,
    students: [
      { id: 'stu-0008', name: 'Adil Bouzidi' },
      { id: 'stu-0015', name: 'Lina Tazi' },
      { id: 'stu-0029', name: 'Sara Mansouri' },
    ],
    evidence: [
      'Commentaires identiques aux lignes 12, 38 et 47',
      'Même variable total_pts, rare dans la cohorte (< 5 %)',
      'Indentation et lignes vides identiques sur les fonctions récursives',
    ],
    recommendation: 'Vérifier les soumissions Moodle avant validation finale des notes.',
  },
];

export const adminInsights = {
  usage: {
    headline: 'Adoption NexusAI en hausse nette',
    body: "Le volume hebdomadaire a augmente de +72 % depuis 6 semaines, signe que les etudiants l'utilisent au moment ou la charge monte.",
    action: "Prevoir une augmentation de quota AI Service de 1.5x avant la periode d'examens.",
    confidence: 0.79,
  },
  deadlines: {
    headline: 'Rythme de rendu decale, pas seulement retard individuel',
    body: 'Sur les 4 derniers TD, 63 % des etudiants ont rendu avec 1 a 2 jours de retard. La distribution est etroite: le signal concerne la cohorte.',
    action: 'Deplacer les 3 prochaines deadlines de +48 h. Taux de rendu a temps projete: 37 % vers 88 %.',
    confidence: 0.84,
  },
  cohort: {
    headline: 'CP1 S2 concentre le risque pedagogique',
    body: 'ENSA CP1 S2 mene en activite avec 47 actifs, mais affiche 5 etudiants a risque et le plus fort taux de retard.',
    action: 'Programmer un TD de soutien Thermo + Algebre la semaine prochaine.',
    confidence: 0.82,
  },
  weekday: {
    headline: 'Le dimanche soir est le meilleur point de contact',
    body: "Pic d'engagement le dimanche, creux le mercredi. Les rappels envoyes mardi matin tombent dans une zone peu receptive.",
    action: 'Programmer les notifications de deadline le dimanche a 19 h. Engagement push attendu: 3.2x.',
    confidence: 0.76,
  },
  concepts: {
    headline: 'ENSAK CP2 S4 - Probabilites et statistiques',
    body: "Mettre en avant un TD sur le theoreme de Bayes: 60 % des etudiants ont consulte l'explication, contre 25 % d'engagement habituel.",
    action: 'Publier le TD Bayes en haut du cours Moodle et le relier a une capsule NexusAI.',
    confidence: 0.81,
  },
} satisfies Record<string, Insight>;

export const professorInsights = {
  cheating: {
    headline: 'TP Python - similarité stylistique élevée',
    body: 'Trois étudiants présentent un fingerprint stylistique très proche sur récursivité: commentaires, espacements et noms de variables se recoupent.',
    action: 'Ouvrir les soumissions Moodle et organiser un échange avant validation finale des notes.',
    confidence: 0.88,
  },
} satisfies Record<string, Insight>;
