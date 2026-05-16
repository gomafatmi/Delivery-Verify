import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface EventRow {
  id: string;
  event_type: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  evidence_type: string | null;
  evidence_file_path: string | null;
}

export default async function VerificationDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await props.params;

  const [sessionRow] = await sql`
    SELECT vs.*, d.amazon_order_id, d.product_description, d.delivery_address
    FROM verification_sessions vs
    JOIN deliveries d ON d.id = vs.delivery_id
    WHERE vs.id = ${id}
  `;
  if (!sessionRow) return <p className="text-neutral-500">Verification not found.</p>;

  const events = await sql<EventRow[]>`
    SELECT ve.*, e.type as evidence_type, e.file_path as evidence_file_path
    FROM verification_events ve
    LEFT JOIN evidence e ON e.event_id = ve.id
    WHERE ve.session_id = ${id}
    ORDER BY ve.created_at ASC
  `;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/verifications" className="mb-4 inline-block text-sm text-blue-600 hover:underline">&larr; Retour</Link>
      <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Session de vérification</h1>
            <p className="font-mono text-sm text-neutral-500">{id}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            sessionRow.status === "passed" ? "bg-green-100 text-green-700" :
            sessionRow.status === "failed" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>{sessionRow.status}</span>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Commande</dt>
            <dd className="font-medium text-neutral-900">{sessionRow.amazon_order_id}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Produit</dt>
            <dd className="font-medium text-neutral-900">{sessionRow.product_description ?? "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-500">Adresse</dt>
            <dd className="font-medium text-neutral-900">{sessionRow.delivery_address}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Début</dt>
            <dd className="font-medium text-neutral-900">{new Date(sessionRow.started_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Fin</dt>
            <dd className="font-medium text-neutral-900">{sessionRow.completed_at ? new Date(sessionRow.completed_at).toLocaleString() : "—"}</dd>
          </div>
        </dl>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Chronologie des événements</h2>
      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ev.status === "success" ? "bg-green-100 text-green-700" :
                  ev.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-neutral-100 text-neutral-600"
                }`}>{ev.event_type}</span>
                <span className="ml-2 text-xs text-neutral-400">{new Date(ev.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
            {ev.metadata && (
              <pre className="mt-2 overflow-x-auto rounded bg-neutral-50 p-2 text-xs text-neutral-600">
                {JSON.stringify(ev.metadata, null, 2)}
              </pre>
            )}
            {ev.evidence_file_path && (
              <p className="mt-2 text-xs text-blue-600">
                Preuve : {ev.evidence_type} — {ev.evidence_file_path}
              </p>
            )}
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-neutral-500">Aucun événement enregistré.</p>}
      </div>
    </div>
  );
}
