export type Lang = "fr" | "en";
export type SectionId = "overview" | "flow" | "architecture" | "database" | "api" | "security" | "ai-vision" | "rgpd";

export interface FlowStep { title: string; desc: string; icon: string }
export interface RgpdRule { check: string; pass: string; icon: string }
export interface AiCheck { label: string; mockScore: number; threshold: number; danger: boolean }
export interface ApiRoute { method: string; path: string; desc: string }
export interface TechItem { layer: string; tech: string; role: string }
export interface SecItem { title: string; items: string[] }
export interface Metric { label: string; value: string; sub: string }
export interface Provider { name: string; status: string; note: string }
export interface ArchDecision { title: string; desc: string }

export interface DemoContent {
  nav: { id: SectionId; label: string }[];
  flowSteps: FlowStep[];
  rgpdRules: RgpdRule[];
  aiChecks: AiCheck[];
  apiRoutes: ApiRoute[];
  techStack: TechItem[];
  security: SecItem[];
  metrics: Metric[];
  providers: Provider[];
  archDecisions: ArchDecision[];
  eventTypes: { type: string; status: string }[];
  sideTitle: string;
  sideTests: string;
  sideNoMod: string;
  overviewTitle: string;
  overviewSub: string;
  problemTitle: string;
  problemItems: string[];
  solutionTitle: string;
  solutionItems: string[];
  techTitle: string;
  flowTitle: string;
  flowSub: string;
  stepLabel: string;
  archTitle: string;
  archSub: string;
  dataFlowTitle: string;
  decisionsTitle: string;
  dbTitle: string;
  dbSub: string;
  erdTitle: string;
  eventTitle: string;
  apiTitle: string;
  apiSub: string;
  methodLabel: string;
  routeLabel: string;
  descLabel: string;
  photoFocus: string;
  secTitle: string;
  secSub: string;
  aiTitle: string;
  aiSub: string;
  aiModuleArch: string;
  aiProviders: string;
  aiSimulator: string;
  aiSimDesc: string;
  aiSimHide: string;
  aiSimShow: string;
  aiThreshold: string;
  aiCompliant: string;
  rgpdTitle: string;
  rgpdSub: string;
  photoLifecycle: string;
  faceBlurTitle: string;
  footer: string;
  footerTech: string;
}

const FR: DemoContent = {
  nav: [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "flow", label: "Flux vérification" },
    { id: "architecture", label: "Architecture" },
    { id: "database", label: "Base de données" },
    { id: "api", label: "API Routes" },
    { id: "security", label: "Sécurité" },
    { id: "ai-vision", label: "Vision IA" },
    { id: "rgpd", label: "RGPD" },
  ],
  flowSteps: [
    { title: "Attribution", desc: "Amazon crée une livraison avec OTP unique + coordonnées GPS", icon: "📦" },
    { title: "Arrivée", desc: "Le livreur arrive à l'adresse. Le GPS est vérifié (rayon 50m)", icon: "📍" },
    { title: "Photo + IA", desc: "Photo du client + livreur + colis. L'IA vérifie : pas de visage identifiable (RGPD), colis présent, photo authentique", icon: "📸" },
    { title: "OTP", desc: "Le client saisit le code OTP sur son propre appareil (pas de transmission vocale)", icon: "🔐" },
    { title: "Signature", desc: "Les deux parties signent numériquement. Preuve horodatée", icon: "✍️" },
    { title: "Confirmation", desc: "Enregistrement immuable en base avec hash SHA-256 + audit trail", icon: "✅" },
  ],
  rgpdRules: [
    { check: "Détection de visages", pass: "Aucun visage identifiable stocké", icon: "🔍" },
    { check: "Floutage automatique", pass: "Visages floutés avant stockage", icon: "🌫️" },
    { check: "Double consentement", pass: "Confirmation client + livreur", icon: "📝" },
    { check: "Durée limitée", pass: "Données supprimées après 90 jours (configurable)", icon: "⏱️" },
    { check: "Traçabilité complète", pass: "Qui a vu quoi, quand ? Audit trail complet", icon: "📋" },
    { check: "Minimisation", pass: "Seules les données nécessaires sont collectées", icon: "🎯" },
  ],
  aiChecks: [
    { label: "Visage identifiable", mockScore: 0.12, threshold: 0.6, danger: false },
    { label: "Colis présent", mockScore: 0.87, threshold: 0.4, danger: false },
    { label: "Photo naturelle", mockScore: 0.92, threshold: 0.5, danger: false },
    { label: "Risque manipulation", mockScore: 0.08, threshold: 0.5, danger: false },
  ],
  apiRoutes: [
    { method: "POST", path: "/api/auth/register", desc: "Création de compte" },
    { method: "POST", path: "/api/auth/signin", desc: "Connexion JWT" },
    { method: "GET", path: "/api/deliveries", desc: "Liste des livraisons" },
    { method: "POST", path: "/api/deliveries", desc: "Créer une livraison" },
    { method: "GET", path: "/api/deliveries/:id", desc: "Détail livraison" },
    { method: "POST", path: "/api/deliveries/:id/verify", desc: "Démarrer session" },
    { method: "POST", path: "/api/deliveries/:id/verify/location", desc: "Vérification GPS" },
    { method: "POST", path: "/api/deliveries/:id/verify/photo", desc: "Upload photo + IA" },
    { method: "POST", path: "/api/deliveries/:id/verify/confirm", desc: "OTP + signature" },
    { method: "POST", path: "/api/deliveries/:id/dispute", desc: "Ouvrir litige" },
    { method: "GET", path: "/api/verifications/:id", desc: "Détail session" },
    { method: "GET", path: "/api/verifications/:id/evidence", desc: "Preuves (fichiers)" },
    { method: "POST", path: "/api/amazon/webhook", desc: "Webhook Amazon" },
  ],
  techStack: [
    { layer: "Framework", tech: "Next.js 16 (App Router)", role: "Server Components + API" },
    { layer: "UI", tech: "React 19 + Tailwind CSS 4", role: "Interface utilisateur" },
    { layer: "Langage", tech: "TypeScript 6", role: "Sécurité de type" },
    { layer: "Base de données", tech: "PostgreSQL + postgres.js", role: "Stockage immutable" },
    { layer: "Auth", tech: "next-auth (JWT)", role: "Authentification credentials" },
    { layer: "État", tech: "Zustand", role: "État client minimal" },
    { layer: "Hash", tech: "SHA-256 (crypto)", role: "Intégrité des preuves" },
    { layer: "Vision IA", tech: "Pluggable (mock / Google / AWS)", role: "Conformité RGPD" },
    { layer: "Tests", tech: "Vitest", role: "Tests unitaires" },
  ],
  security: [
    { title: "Authentification", items: ["next-auth (Credentials provider)", "JWT signé (HMAC SHA-256)", "bcrypt pour mots de passe", "Session côté serveur"] },
    { title: "Intégrité des preuves", items: ["SHA-256 hash de chaque fichier", "Hash stocké en base avec le fichier", "Vérification à la consultation", "Empêche toute modification après coup"] },
    { title: "Audit trail", items: ["Queue async non-bloquante", "Niveaux: ERROR, WARN, INFO, DEBUG", "Toute action est tracée", "Table audit_logs avec metadata JSONB"] },
    { title: "RGPD / Privacy", items: ["Visages non identifiables stockés", "Données minimales collectées", "Durée de conservation limitée", "Traçabilité complète des accès"] },
    { title: "Protection API", items: ["Middleware d'auth sur les routes", "Validation des types MIME", "Limite taille fichiers (10MB)", "Validation des rôles (customer/delivery)"] },
    { title: "Vérification multi-facteur", items: ["GPS (proximité 50m)", "Photo (preuve visuelle)", "OTP (ce que vous savez)", "Signature (ce que vous déclarez)"] },
  ],
  metrics: [
    { label: "Fichiers créés", value: "3", sub: "(0 modifiés)" },
    { label: "Tests", value: "22", sub: "5 test files" },
    { label: "Event types", value: "11", sub: "+2 ajoutés" },
    { label: "API routes", value: "13", sub: "RESTful" },
  ],
  providers: [
    { name: "mock", status: "✅ Actif (POC)", note: "Analyse basée sur entropie et variations de pixels" },
    { name: "google-vision", status: "🔜 Prêt", note: "Implémenter Google Cloud Vision API — détection visages + objets" },
    { name: "aws-rekognition", status: "🔜 Prêt", note: "Implémenter AWS Rekognition — détection visages + labels" },
  ],
  archDecisions: [
    { title: "App Router partout", desc: "Server Components par défaut, Client Components quand nécessaire" },
    { title: "Zustand > Context", desc: "Minimum de re-renders, API simple, fonctionne hors React tree" },
    { title: "postgres.js > Prisma", desc: "Zero dépendances, 10x plus léger, SQL raw pour audit integrity" },
    { title: "Fonctions pures", desc: "verification.ts a zero I/O — les dépendances sont injectées" },
    { title: "Vision IA pluggable", desc: "Provider pattern — mock, Google Vision, AWS Rekognition" },
    { title: "Async audit trail", desc: "Queue non-bloquante — ne ralentit jamais le flux de vérification" },
  ],
  eventTypes: [
    { type: "gps_check", status: "success/failed" },
    { type: "photo_customer", status: "success/failed" },
    { type: "photo_delivery", status: "success/failed" },
    { type: "ai_vision_check", status: "success/failed" },
    { type: "privacy_check", status: "success/failed" },
    { type: "otp_entry", status: "success/failed" },
    { type: "signature_customer", status: "success" },
    { type: "signature_delivery", status: "success" },
    { type: "arrival", status: "success" },
    { type: "confirmation", status: "success" },
    { type: "package_check", status: "success/failed" },
  ],
  sideTitle: "POC — System Design",
  sideTests: "Tout vert",
  sideNoMod: "Aucun code existant modifié",
  overviewTitle: "Delivery Verify",
  overviewSub: "Système de preuve de remise en main propre — multi-factor verification avec vision IA et conformité RGPD",
  problemTitle: "Problème",
  problemItems: [
    "OTP transmis par téléphone — pas de preuve visuelle",
    "Colis volé après dépôt — litige non résolu",
    "Photos avec visages — violation RGPD",
    "Aucune preuve immutable — fraude impossible à prouver",
  ],
  solutionTitle: "Solution",
  solutionItems: [
    "4 facteurs : GPS + Photo + OTP + Signature",
    "Vision IA vérifie RGPD automatiquement",
    "Visages floutés — privacy by design",
    "SHA-256 + audit trail — preuve juridique",
  ],
  techTitle: "Stack technique",
  flowTitle: "Flux de vérification",
  flowSub: "Parcours en 6 étapes — chaque étape produit un événement horodaté dans la base",
  stepLabel: "Étape",
  archTitle: "Architecture",
  archSub: "Architecture 3-tiers — Frontend Next.js (App Router) → API Routes → PostgreSQL",
  dataFlowTitle: "Flux de données",
  decisionsTitle: "Décisions d'architecture",
  dbTitle: "Base de données",
  dbSub: "Schéma relationnel PostgreSQL — contraintes CHECK, index, clés étrangères",
  erdTitle: "Diagramme entité-relation",
  eventTitle: "Types d'événements",
  apiTitle: "API Routes",
  apiSub: "13 endpoints RESTful — auth, livraisons, vérification, webhook Amazon",
  methodLabel: "Méthode",
  routeLabel: "Route",
  descLabel: "Description",
  photoFocus: "Focus : Upload photo + IA",
  secTitle: "Sécurité",
  secSub: "Authentification JWT, hash SHA-256, audit trail immutable",
  aiTitle: "Vision IA",
  aiSub: "Analyse automatique des photos — architecture pluggable, mock par défaut pour POC",
  aiModuleArch: "Architecture du module",
  aiProviders: "Providers disponibles",
  aiSimulator: "Simulateur d'analyse",
  aiSimDesc: "Cliquez pour voir les résultats d'analyse IA sur une photo type",
  aiSimHide: "Cacher",
  aiSimShow: "Simuler",
  aiThreshold: "Seuil",
  aiCompliant: "✅ Conforme RGPD — Aucun visage identifiable, colis présent, photo authentique",
  rgpdTitle: "Conformité RGPD",
  rgpdSub: "Privacy by design — chaque photo est contrôlée par IA avant stockage",
  photoLifecycle: "Cycle de vie d'une photo",
  faceBlurTitle: "Floutage des visages",
  footer: "Delivery Verify — POC System Design — Aucun code existant modifié",
  footerTech: "Next.js 16 + TypeScript 6 + PostgreSQL + Vision IA",
};

const EN: DemoContent = {
  nav: [
    { id: "overview", label: "Overview" },
    { id: "flow", label: "Verification Flow" },
    { id: "architecture", label: "Architecture" },
    { id: "database", label: "Database" },
    { id: "api", label: "API Routes" },
    { id: "security", label: "Security" },
    { id: "ai-vision", label: "AI Vision" },
    { id: "rgpd", label: "GDPR" },
  ],
  flowSteps: [
    { title: "Assignment", desc: "Amazon creates a delivery with unique OTP + GPS coordinates", icon: "📦" },
    { title: "Arrival", desc: "Delivery person arrives. GPS is verified (50m radius)", icon: "📍" },
    { title: "Photo + AI", desc: "Photo of customer + delivery person + package. AI checks: no identifiable face (GDPR), package present, authentic photo", icon: "📸" },
    { title: "OTP", desc: "Customer enters OTP on their own device (no verbal relay)", icon: "🔐" },
    { title: "Signature", desc: "Both parties sign digitally. Timestamped proof", icon: "✍️" },
    { title: "Confirmation", desc: "Immutable record with SHA-256 hash + audit trail", icon: "✅" },
  ],
  rgpdRules: [
    { check: "Face detection", pass: "No identifiable face stored", icon: "🔍" },
    { check: "Auto blurring", pass: "Faces blurred before storage", icon: "🌫️" },
    { check: "Double consent", pass: "Customer + delivery confirmation", icon: "📝" },
    { check: "Limited retention", pass: "Data deleted after 90 days (configurable)", icon: "⏱️" },
    { check: "Full traceability", pass: "Who saw what, when? Complete audit trail", icon: "📋" },
    { check: "Minimization", pass: "Only necessary data is collected", icon: "🎯" },
  ],
  aiChecks: [
    { label: "Identifiable face", mockScore: 0.12, threshold: 0.6, danger: false },
    { label: "Package present", mockScore: 0.87, threshold: 0.4, danger: false },
    { label: "Natural photo", mockScore: 0.92, threshold: 0.5, danger: false },
    { label: "Manipulation risk", mockScore: 0.08, threshold: 0.5, danger: false },
  ],
  apiRoutes: [
    { method: "POST", path: "/api/auth/register", desc: "Account creation" },
    { method: "POST", path: "/api/auth/signin", desc: "JWT login" },
    { method: "GET", path: "/api/deliveries", desc: "List deliveries" },
    { method: "POST", path: "/api/deliveries", desc: "Create delivery" },
    { method: "GET", path: "/api/deliveries/:id", desc: "Delivery detail" },
    { method: "POST", path: "/api/deliveries/:id/verify", desc: "Start session" },
    { method: "POST", path: "/api/deliveries/:id/verify/location", desc: "GPS check" },
    { method: "POST", path: "/api/deliveries/:id/verify/photo", desc: "Photo upload + AI" },
    { method: "POST", path: "/api/deliveries/:id/verify/confirm", desc: "OTP + signature" },
    { method: "POST", path: "/api/deliveries/:id/dispute", desc: "Open dispute" },
    { method: "GET", path: "/api/verifications/:id", desc: "Session detail" },
    { method: "GET", path: "/api/verifications/:id/evidence", desc: "Evidence (files)" },
    { method: "POST", path: "/api/amazon/webhook", desc: "Amazon webhook" },
  ],
  techStack: [
    { layer: "Framework", tech: "Next.js 16 (App Router)", role: "Server Components + API" },
    { layer: "UI", tech: "React 19 + Tailwind CSS 4", role: "User interface" },
    { layer: "Language", tech: "TypeScript 6", role: "Type safety" },
    { layer: "Database", tech: "PostgreSQL + postgres.js", role: "Immutable storage" },
    { layer: "Auth", tech: "next-auth (JWT)", role: "Credentials authentication" },
    { layer: "State", tech: "Zustand", role: "Minimal client state" },
    { layer: "Hash", tech: "SHA-256 (crypto)", role: "Evidence integrity" },
    { layer: "AI Vision", tech: "Pluggable (mock / Google / AWS)", role: "GDPR compliance" },
    { layer: "Tests", tech: "Vitest", role: "Unit tests" },
  ],
  security: [
    { title: "Authentication", items: ["next-auth (Credentials provider)", "Signed JWT (HMAC SHA-256)", "bcrypt password hashing", "Server-side sessions"] },
    { title: "Evidence integrity", items: ["SHA-256 hash of every file", "Hash stored alongside file", "Verification on consultation", "Prevents any tampering"] },
    { title: "Audit trail", items: ["Async non-blocking queue", "Levels: ERROR, WARN, INFO, DEBUG", "Every action is traced", "audit_logs table with JSONB metadata"] },
    { title: "GDPR / Privacy", items: ["Non-identifiable faces stored", "Minimal data collection", "Limited retention period", "Full access traceability"] },
    { title: "API protection", items: ["Auth middleware on routes", "MIME type validation", "File size limit (10MB)", "Role validation (customer/delivery)"] },
    { title: "Multi-factor verification", items: ["GPS (50m proximity)", "Photo (visual proof)", "OTP (something you know)", "Signature (something you declare)"] },
  ],
  metrics: [
    { label: "Files created", value: "3", sub: "(0 modified)" },
    { label: "Tests", value: "22", sub: "5 test files" },
    { label: "Event types", value: "11", sub: "+2 added" },
    { label: "API routes", value: "13", sub: "RESTful" },
  ],
  providers: [
    { name: "mock", status: "✅ Active (POC)", note: "Analysis based on entropy and pixel variations" },
    { name: "google-vision", status: "🔜 Ready", note: "Implement Google Cloud Vision API — face + object detection" },
    { name: "aws-rekognition", status: "🔜 Ready", note: "Implement AWS Rekognition — face + label detection" },
  ],
  archDecisions: [
    { title: "App Router everywhere", desc: "Server Components by default, Client Components when needed" },
    { title: "Zustand > Context", desc: "Minimal re-renders, simple API, works outside React tree" },
    { title: "postgres.js > Prisma", desc: "Zero dependencies, 10x lighter, raw SQL for audit integrity" },
    { title: "Pure functions", desc: "verification.ts has zero I/O — dependencies are injected" },
    { title: "Pluggable AI Vision", desc: "Provider pattern — mock, Google Vision, AWS Rekognition" },
    { title: "Async audit trail", desc: "Non-blocking queue — never slows the verification flow" },
  ],
  eventTypes: [
    { type: "gps_check", status: "success/failed" },
    { type: "photo_customer", status: "success/failed" },
    { type: "photo_delivery", status: "success/failed" },
    { type: "ai_vision_check", status: "success/failed" },
    { type: "privacy_check", status: "success/failed" },
    { type: "otp_entry", status: "success/failed" },
    { type: "signature_customer", status: "success" },
    { type: "signature_delivery", status: "success" },
    { type: "arrival", status: "success" },
    { type: "confirmation", status: "success" },
    { type: "package_check", status: "success/failed" },
  ],
  sideTitle: "POC — System Design",
  sideTests: "All green",
  sideNoMod: "No existing code modified",
  overviewTitle: "Delivery Verify",
  overviewSub: "Handover proof system — multi-factor verification with AI vision and GDPR compliance",
  problemTitle: "Problem",
  problemItems: [
    "OTP relayed by phone — no visual proof",
    "Package stolen after drop-off — unresolved dispute",
    "Photos with faces — GDPR violation",
    "No immutable proof — fraud impossible to prove",
  ],
  solutionTitle: "Solution",
  solutionItems: [
    "4 factors: GPS + Photo + OTP + Signature",
    "AI vision checks GDPR automatically",
    "Faces blurred — privacy by design",
    "SHA-256 + audit trail — legal proof",
  ],
  techTitle: "Tech stack",
  flowTitle: "Verification Flow",
  flowSub: "6-step journey — each step produces a timestamped event in the database",
  stepLabel: "Step",
  archTitle: "Architecture",
  archSub: "3-tier architecture — Frontend Next.js (App Router) → API Routes → PostgreSQL",
  dataFlowTitle: "Data flow",
  decisionsTitle: "Architecture decisions",
  dbTitle: "Database",
  dbSub: "PostgreSQL relational schema — CHECK constraints, indexes, foreign keys",
  erdTitle: "Entity-relationship diagram",
  eventTitle: "Event types",
  apiTitle: "API Routes",
  apiSub: "13 RESTful endpoints — auth, deliveries, verification, Amazon webhook",
  methodLabel: "Method",
  routeLabel: "Route",
  descLabel: "Description",
  photoFocus: "Focus: Photo upload + AI",
  secTitle: "Security",
  secSub: "JWT authentication, SHA-256 hash, immutable audit trail",
  aiTitle: "AI Vision",
  aiSub: "Automatic photo analysis — pluggable architecture, mock by default for POC",
  aiModuleArch: "Module architecture",
  aiProviders: "Available providers",
  aiSimulator: "Analysis simulator",
  aiSimDesc: "Click to see AI analysis results on a sample photo",
  aiSimHide: "Hide",
  aiSimShow: "Simulate",
  aiThreshold: "Threshold",
  aiCompliant: "✅ GDPR compliant — No identifiable face, package present, authentic photo",
  rgpdTitle: "GDPR Compliance",
  rgpdSub: "Privacy by design — every photo is AI-checked before storage",
  photoLifecycle: "Photo lifecycle",
  faceBlurTitle: "Face blurring",
  footer: "Delivery Verify — POC System Design — No existing code modified",
  footerTech: "Next.js 16 + TypeScript 6 + PostgreSQL + AI Vision",
};

export const CONTENT: Record<Lang, DemoContent> = { fr: FR, en: EN };
