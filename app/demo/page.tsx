"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CONTENT, type Lang, type SectionId } from "@/lib/demo-i18n";

export default function DemoPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [selectedStep, setSelectedStep] = useState(2);
  const [showAiModal, setShowAiModal] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const c = CONTENT[lang];
  const prevSection = useRef(activeSection);

  function toggleLang() {
    setLang(lang === "fr" ? "en" : "fr");
    setContentKey((k) => k + 1);
  }

  const navigateTo = useCallback((id: SectionId) => {
    if (id === activeSection) return;
    prevSection.current = activeSection;
    setAnimating(true);
    setTimeout(() => {
      setActiveSection(id);
      setContentKey((k) => k + 1);
      setTimeout(() => setAnimating(false), 50);
    }, 200);
  }, [activeSection]);

  return (
    <div className="relative flex min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500/30">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(59,130,246,0.3); } 50% { box-shadow: 0 0 20px rgba(59,130,246,0.6); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .animate-slideIn { animation: slideIn 0.4s ease-out both; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out both; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-slideDown { animation: slideDown 0.3s ease-out both; }
        .nav-active-glow { box-shadow: inset 3px 0 0 #3b82f6; background: linear-gradient(90deg, rgba(59,130,246,0.1) 0%, transparent 100%); }
        .content-enter { animation: slideIn 0.35s ease-out both; }
        .lang-toggle { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .lang-toggle:hover { transform: scale(1.05); }
        .sidebar-link { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .sidebar-link::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(59,130,246,0.08) 0%, transparent 100%); opacity: 0; transition: opacity 0.3s; }
        .sidebar-link:hover::after { opacity: 1; }
        .glow-card { transition: all 0.3s ease; }
        .glow-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3); }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-800 bg-neutral-900/80 backdrop-blur-sm md:block">
        <div className="sticky top-0 p-4">
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulseDot" />
                {c.sideTitle}
              </span>
              <button
                onClick={toggleLang}
                className="lang-toggle flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:border-blue-600 hover:text-blue-400"
              >
                {lang === "fr" ? (
                  <><span className="text-sm">🇬🇧</span> EN</>
                ) : (
                  <><span className="text-sm">🇫🇷</span> FR</>
                )}
              </button>
            </div>
            <h2 className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-lg font-bold text-transparent">
              {c.overviewTitle}
            </h2>
            <p className="text-xs text-neutral-500">v0.1.0</p>
          </div>

          <nav className="space-y-1">
            {c.nav.map((item, i) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  className={`sidebar-link flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm ${
                    isActive
                      ? "nav-active-glow font-medium text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className={`flex h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                    isActive ? "bg-blue-500 shadow-sm shadow-blue-500/50" : "bg-neutral-600"
                  }`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulseDot" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              <p className="text-xs text-neutral-400">
                <span className="text-green-400">22 tests</span> — {c.sideTests}
              </p>
            </div>
            <p className="mt-1.5 text-xs text-neutral-600">{c.sideNoMod}</p>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="fixed right-0 top-0 z-40 flex items-center justify-end gap-2 p-3 md:hidden">
        <button
          onClick={toggleLang}
          className="lang-toggle flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm hover:border-blue-600"
        >
          {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
        </button>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-1 overflow-x-auto border-t border-neutral-800 bg-neutral-900/95 p-2 backdrop-blur-sm md:hidden">
        {c.nav.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeSection === item.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6 md:px-10 md:pb-8 md:pt-10">
        <div className={`mx-auto max-w-4xl ${animating ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}>
          {activeSection === "overview" && <OverviewSection key={`overview-${contentKey}`} c={c} lang={lang} />}
          {activeSection === "flow" && <FlowSection key={`flow-${contentKey}`} c={c} selectedStep={selectedStep} setSelectedStep={setSelectedStep} />}
          {activeSection === "architecture" && <ArchitectureSection key={`arch-${contentKey}`} c={c} />}
          {activeSection === "database" && <DatabaseSection key={`db-${contentKey}`} c={c} />}
          {activeSection === "api" && <ApiSection key={`api-${contentKey}`} c={c} />}
          {activeSection === "security" && <SecuritySection key={`sec-${contentKey}`} c={c} />}
          {activeSection === "ai-vision" && <AiVisionSection key={`ai-${contentKey}`} c={c} showAiModal={showAiModal} setShowAiModal={setShowAiModal} />}
          {activeSection === "rgpd" && <RgpdSection key={`rgpd-${contentKey}`} c={c} />}
        </div>

        <footer className="mx-auto mt-16 max-w-4xl border-t border-neutral-800 pt-8 text-center text-xs text-neutral-600">
          <p>{c.footer}</p>
          <p className="mt-1">{c.footerTech}</p>
        </footer>
      </main>
    </div>
  );
}

/* ===== SECTION COMPONENTS ===== */

function OverviewSection({ c, lang }: { c: typeof CONTENT.fr; lang: Lang }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.overviewTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.overviewSub}</p>

      <div className="content-enter mb-8 grid gap-6 md:grid-cols-2">
        <div className="glow-card rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/40 to-red-950/10 p-6">
          <h2 className="mb-3 text-lg font-semibold text-red-400">{c.problemTitle}</h2>
          <ul className="space-y-2 text-sm text-red-300/80">
            {c.problemItems.map((item, i) => (
              <li key={item} className="content-enter flex gap-2" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>→ {item}</li>
            ))}
          </ul>
        </div>
        <div className="glow-card rounded-xl border border-green-800/50 bg-gradient-to-br from-green-950/40 to-green-950/10 p-6">
          <h2 className="mb-3 text-lg font-semibold text-green-400">{c.solutionTitle}</h2>
          <ul className="space-y-2 text-sm text-green-300/80">
            {c.solutionItems.map((item, i) => (
              <li key={item} className="content-enter flex gap-2" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>→ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="content-enter mb-4 text-xl font-bold text-white" style={{ animationDelay: "0.3s" }}>{c.techTitle}</h2>
      <div className="content-enter mb-8 grid gap-3 md:grid-cols-3" style={{ animationDelay: "0.35s" }}>
        {c.techStack.map((t, i) => (
          <div key={t.layer} className="glow-card rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-4" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
            <div className="mb-1 text-xs font-semibold text-blue-400">{t.layer}</div>
            <div className="text-sm font-medium text-white">{t.tech}</div>
            <div className="text-xs text-neutral-500">{t.role}</div>
          </div>
        ))}
      </div>

      <div className="content-enter grid gap-4 md:grid-cols-4" style={{ animationDelay: "0.5s" }}>
        {c.metrics.map((m, i) => (
          <div key={m.label} className="glow-card rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-xs text-neutral-400">{m.label}</div>
            <div className="text-xs text-neutral-600">{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowSection({ c, selectedStep, setSelectedStep }: { c: typeof CONTENT.fr; selectedStep: number; setSelectedStep: (n: number) => void }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.flowTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.flowSub}</p>
      <div className="content-enter space-y-3">
        {c.flowSteps.map((step, i) => (
          <button
            key={step.title}
            onClick={() => setSelectedStep(i)}
            className={`glow-card w-full rounded-xl border p-5 text-left transition-all duration-300 ${
              selectedStep === i
                ? "border-blue-600/60 bg-gradient-to-r from-blue-950/50 to-blue-950/10 shadow-lg shadow-blue-900/20"
                : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-all duration-300 ${
                selectedStep === i ? "bg-blue-600 shadow-md shadow-blue-600/30 scale-110" : "bg-neutral-800"
              }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-blue-400">{c.stepLabel} {i + 1}</span>
                  <span className="text-sm font-semibold text-white">{step.title}</span>
                </div>
                {selectedStep === i && (
                  <p className="mt-2 animate-slideDown text-sm text-neutral-400">{step.desc}</p>
                )}
              </div>
              <div className={`transition-all duration-300 ${selectedStep === i ? "text-blue-400" : "text-neutral-600"}`}>
                {i < 5 ? "↓" : ""}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ArchitectureSection({ c }: { c: typeof CONTENT.fr }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.archTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.archSub}</p>
      <div className="content-enter mb-8 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">{c.dataFlowTitle}</h2>
        <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-400">{`\
.-----------------------------------------------------------------.
|                      NAVIGATEUR (Mobile/PWA)                     |
|  [GPS]  [Camera]  [OTP Input]  [Signature]                       |
'-------------------------+---------------------------------------'
                          | HTTPS / JSON
                          v
.-----------------------------------------------------------------.
|                    NEXT.JS 16 (App Router)                      |
|                                                                  |
|  .---------------------.    .--------------------------------.  |
|  |  Server Components  |    |     API Route Handlers         |  |
|  |  - Pages livraisons |    |     /api/deliveries/*          |  |
|  |  - Pages sessions   |    |     /api/verifications/*       |  |
|  |  - Dashboard        |    |     /api/auth/*               |  |
|  '---------------------'    '---------------+----------------'  |
|                                              |                    |
|  .------------------------------------------.|                    |
|  |  Lib (pure functions, zero I/O)          ||                    |
|  |  verification.ts  gps.ts  photo.ts       ||                    |
|  |  ai-vision.ts     face-blur.ts  audit.ts ||                    |
|  '------------------------------------------'|                    |
'----------------------------------------------+------------------'
                                                | SQL
                                                v
.-----------------------------------------------------------------.
|                      POSTGRESQL                                  |
|                                                                  |
|  users --1:N--> deliveries --1:N--> verification_sessions       |
|                                         '--1:N-- verification_events
|                                                     '--1:N-- evidence
|  audit_logs (async queue)                                       |
'-----------------------------------------------------------------'`}</pre>
      </div>
      <h2 className="content-enter mb-4 text-xl font-bold text-white">{c.decisionsTitle}</h2>
      <div className="content-enter grid gap-4 md:grid-cols-2">
        {c.archDecisions.map((d, i) => (
          <div key={d.title} className="glow-card rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-4" style={{ animationDelay: `${i * 0.05}s` }}>
            <h3 className="mb-1 text-sm font-semibold text-white">{d.title}</h3>
            <p className="text-xs text-neutral-400">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DatabaseSection({ c }: { c: typeof CONTENT.fr }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.dbTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.dbSub}</p>
      <div className="content-enter mb-8 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">{c.erdTitle}</h2>
        <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-400">{`\
+-----------------------------------------------------------------+
|                         users                                    |
|  id (UUID PK) | role | email | name | password_hash | created_at  |
+------------------------+----------------------------------------+
                         | 1
                         |
                    N    |
+------------------------+----------------------------------------+
|                        deliveries                                |
|  id (UUID PK) | amazon_order_id (UNIQUE) | customer_id (FK)      |
|  delivery_person_id (FK) | product_value | delivery_address       |
|  delivery_lat/lng | otp_code | status  | created_at | updated_at  |
+------------------------+----------------------------------------+
                         | 1
                         |
                    N    |
+------------------------+----------------------------------------+
|                     verification_sessions                         |
|  id (UUID PK) | delivery_id (FK) | status | started_at | comp..  |
+------------------------+----------------------------------------+
                         | 1
                         |
                    N    |
+------------------------+----------------------------------------+
|                      verification_events                          |
|  id (UUID PK) | session_id (FK) | event_type | status | metadata  |
|  created_at                                                      |
+------------------------+----------------------------------------+
                         | 1
                         |
                    N    |
+------------------------+----------------------------------------+
|                          evidence                                 |
|  id (UUID PK) | event_id (FK) | type | file_path | file_hash     |
|  gps_lat/lng | captured_at                                       |
+-----------------------------------------------------------------+`}</pre>
      </div>
      <h2 className="content-enter mb-4 text-xl font-bold text-white">{c.eventTitle}</h2>
      <div className="content-enter grid gap-2 md:grid-cols-4">
        {c.eventTypes.map((e, i) => (
          <div key={e.type} className="glow-card rounded border border-neutral-800 bg-neutral-900 p-3" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="text-xs font-medium text-white">{e.type}</div>
            <div className="text-xs text-neutral-500">{e.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiSection({ c }: { c: typeof CONTENT.fr }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.apiTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.apiSub}</p>
      <div className="content-enter mb-8 overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900">
            <tr className="border-b border-neutral-800">
              <th className="px-4 py-3 text-xs font-semibold text-neutral-400">{c.methodLabel}</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-400">{c.routeLabel}</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-400">{c.descLabel}</th>
            </tr>
          </thead>
          <tbody>
            {c.apiRoutes.map((r, i) => (
              <tr key={r.path} className="border-b border-neutral-800 transition-colors hover:bg-neutral-900/50" style={{ animationDelay: `${i * 0.03}s` }}>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                    r.method === "GET" ? "bg-green-950 text-green-400" : "bg-blue-950 text-blue-400"
                  }`}>{r.method}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-white">{r.path}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="content-enter mb-4 text-xl font-bold text-white">{c.photoFocus}</h2>
      <div className="content-enter rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
        <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-400">{`\
POST /api/deliveries/:id/verify/photo
  Body: FormData { photo: File, role: "customer"|"delivery" }

  1. Check active session (JOIN deliveries + verification_sessions)
  2. Validate file (MIME type, max 10MB)
  3. Save with SHA-256 hash -> evidence
  4. Create event photo_customer or photo_delivery (success)
  5. Run non-blocking AI analysis:
     a. Face detection (identifiable?)
     b. Package detection
     c. Authenticity analysis (blur, manipulation)
  6. Create event ai_vision_check (success/failed)
  7. Log to audit trail
  8. Return { success: true, aiWarnings: [...] }

  -> AI never blocks the flow
  -> Warnings shown in UI but do not block`}</pre>
      </div>
    </div>
  );
}

function SecuritySection({ c }: { c: typeof CONTENT.fr }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.secTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.secSub}</p>
      <div className="content-enter grid gap-6 md:grid-cols-2">
        {c.security.map((s, i) => (
          <div key={s.title} className="glow-card rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-5" style={{ animationDelay: `${i * 0.08}s` }}>
            <h3 className="mb-3 text-sm font-bold text-white">{s.title}</h3>
            <ul className="space-y-1.5">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-neutral-400">
                  <span className="mt-0.5 text-green-500">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiVisionSection({ c, showAiModal, setShowAiModal }: { c: typeof CONTENT.fr; showAiModal: boolean; setShowAiModal: (v: boolean) => void }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.aiTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.aiSub}</p>
      <div className="content-enter mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
          <h2 className="mb-4 text-sm font-bold text-white">{c.aiModuleArch}</h2>
          <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-400">{`\
lib/ai-vision.ts
  |
  +-- AIVisionProvider (interface)
  |     analyze(buffer, mimeType, role)
  |     -> AIVisionResult
  |
  +-- mockProvider (POC)
  |     - Entropy-based detection
  |     - Blur estimation (pixel variation)
  |     - Manipulation estimation
  |     - Configurable thresholds
  |
  +-- configureAI()   -> change config
  +-- setProvider()   -> change provider
  +-- analyzePhoto()  -> entry point
  +-- isCompliant()   -> helper`}</pre>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
          <h2 className="mb-4 text-sm font-bold text-white">{c.aiProviders}</h2>
          <div className="space-y-3">
            {c.providers.map((p) => (
              <div key={p.name} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 transition-all hover:border-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{p.name}</span>
                  <span className="text-xs text-neutral-500">{p.status}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-enter rounded-xl border border-purple-800/50 bg-gradient-to-br from-purple-950/30 to-purple-950/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{c.aiSimulator}</h2>
            <p className="text-sm text-neutral-400">{c.aiSimDesc}</p>
          </div>
          <button
            onClick={() => setShowAiModal(!showAiModal)}
            className="lang-toggle rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-purple-600/20 hover:bg-purple-500"
          >
            {showAiModal ? c.aiSimHide : c.aiSimShow}
          </button>
        </div>
        {showAiModal && (
          <div className="animate-slideDown space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {c.aiChecks.map((check) => {
                const pct = Math.round(check.mockScore * 100);
                return (
                  <div key={check.label} className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-200">{check.label}</span>
                      <span className={`text-xs font-bold ${pct > 60 ? "text-green-400" : "text-amber-400"}`}>{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          check.danger
                            ? check.mockScore < check.threshold ? "bg-green-500" : "bg-red-500"
                            : check.mockScore >= check.threshold ? "bg-green-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-neutral-600">{c.aiThreshold}: {Math.round(check.threshold * 100)}%</div>
                  </div>
                );
              })}
            </div>
            <div className="animate-fadeIn rounded-lg border border-green-800 bg-green-950/30 p-4">
              <p className="text-sm font-medium text-green-400">{c.aiCompliant}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RgpdSection({ c }: { c: typeof CONTENT.fr }) {
  return (
    <div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-3xl font-bold text-transparent">{c.rgpdTitle}</h1>
      <p className="content-enter mb-8 text-neutral-400">{c.rgpdSub}</p>
      <div className="content-enter mb-8 grid gap-4 md:grid-cols-3">
        {c.rgpdRules.map((rule, i) => (
          <div key={rule.check} className="glow-card rounded-xl border border-green-800/30 bg-gradient-to-br from-green-950/20 to-green-950/5 p-5" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="mb-2 text-2xl">{rule.icon}</div>
            <h3 className="mb-1 text-sm font-semibold text-white">{rule.check}</h3>
            <p className="text-xs text-green-400">{rule.pass}</p>
          </div>
        ))}
      </div>
      <h2 className="content-enter mb-4 text-xl font-bold text-white">{c.photoLifecycle}</h2>
      <div className="content-enter mb-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
        <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-400">{`\
1. CAPTURE
   |  Camera -> canvas -> data URL JPEG
   |
2. UPLOAD
   |  FormData -> POST /api/deliveries/:id/verify/photo
   |
3. SAVE + HASH
   |  SHA-256(file) -> local storage + hash in DB
   |
4. AI ANALYSIS (non-blocking)
   |  a. Face detection -> identifiable?
   |     +-- YES -> warning + admin flag
   |     +-- NO  -> OK
   |  b. Package detection -> present?
   |     +-- NO -> warning
   |     +-- YES -> OK
   |  c. Authenticity -> natural?
   |     +-- NO -> manipulation warning
   |     +-- YES -> OK
   |
5. FINAL STORAGE
   |  - Original photo kept (with faces blurred if needed)
   |  - SHA-256 verifiable at any time
   |  - ai_vision_check event added to session
   |
6. CONSULTATION
   |  - Audit trail: who viewed, when
   |  - Legal proof: hash + timestamped events`}</pre>
      </div>
      <h2 className="content-enter mb-4 text-xl font-bold text-white">{c.faceBlurTitle}</h2>
      <div className="content-enter rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
        <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-400">{`\
lib/face-blur.ts - Provider pattern (mock by default)

  blurFaces(buffer, mimeType)
    1. Decode image dimensions (JPEG/PNG)
    2. Convert to RGBA buffer
    3. Apply block pixelation
       - Adaptive block size (max(8, min(w,h)/20))
       - Each block = average color
    4. Returns: { blurred, originalBuffer, blurredBuffer, facesBlurred }

  -> Integrable in photo pipeline
  -> Replace with real lib (sharp, @napi-rs/canvas) in prod`}</pre>
      </div>
    </div>
  );
}
