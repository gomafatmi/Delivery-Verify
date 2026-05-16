import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface SessionRow {
  id: string;
  delivery_id: string;
  status: string;
  event_count: string;
  started_at: string;
  completed_at: string | null;
}

export default async function DisputeDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await props.params;

  const [delivery] = await sql`
    SELECT d.*, c.name as customer_name, c.email as customer_email,
           dp.name as delivery_person_name
    FROM deliveries d
    JOIN users c ON c.id = d.customer_id
    LEFT JOIN users dp ON dp.id = d.delivery_person_id
    WHERE d.id = ${id}
  `;
  if (!delivery) return <p className="text-neutral-500">Delivery not found.</p>;

  const sessions = await sql<SessionRow[]>`
    SELECT vs.*, 
      (SELECT count(*) FROM verification_events ve WHERE ve.session_id = vs.id)::text as event_count
    FROM verification_sessions vs
    WHERE vs.delivery_id = ${id}
    ORDER BY vs.started_at DESC
  `;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/disputes" className="mb-4 inline-block text-sm text-blue-600 hover:underline">&larr; Retour</Link>
      <div className="mb-6 rounded-lg border border-yellow-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Résolution de litige</h1>
            <p className="font-mono text-sm text-neutral-500">{delivery.amazon_order_id}</p>
          </div>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">disputed</span>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Produit</dt>
            <dd className="font-medium text-neutral-900">{delivery.product_description ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Valeur</dt>
            <dd className="font-medium text-neutral-900">${Number(delivery.product_value).toFixed(2)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-500">Adresse</dt>
            <dd className="font-medium text-neutral-900">{delivery.delivery_address}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Client</dt>
            <dd className="font-medium text-neutral-900">{delivery.customer_name} ({delivery.customer_email})</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Livreur</dt>
            <dd className="font-medium text-neutral-900">{delivery.delivery_person_name ?? "Non assigné"}</dd>
          </div>
        </dl>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Sessions de vérification</h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune donnée de vérification disponible.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <Link href={`/verifications/${s.id}`} className="font-mono text-sm text-blue-600 hover:underline">
                  {s.id.slice(0, 8)}...
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  s.status === "passed" ? "bg-green-100 text-green-700" :
                  s.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>{s.status}</span>
              </div>
              <p className="text-xs text-neutral-500">
                {s.event_count} événements &middot; Début {new Date(s.started_at).toLocaleString()}
                {s.completed_at ? ` · Fin ${new Date(s.completed_at).toLocaleString()}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-700">Actions de résolution</h3>
        <p className="text-sm text-neutral-600">
          {sessions.some((s) => s.status === "passed")
            ? "✅ Vérification complétée. Les preuves confirment la livraison."
            : "⚠️ Aucune vérification réussie. Examinez les preuves avant de décider."}
        </p>
      </div>
    </div>
  );
}
