import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface VerifRow {
  id: string;
  delivery_id: string;
  amazon_order_id: string;
  status: string;
  event_count: string;
  started_at: string;
  completed_at: string | null;
}

export default async function VerificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const rows = await sql<VerifRow[]>`
    SELECT vs.id, vs.delivery_id, d.amazon_order_id, vs.status,
           (SELECT count(*) FROM verification_events ve WHERE ve.session_id = vs.id)::text as event_count,
           vs.started_at, vs.completed_at
    FROM verification_sessions vs
    JOIN deliveries d ON d.id = vs.delivery_id
    ORDER BY vs.started_at DESC
    LIMIT 50
  `;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Vérifications</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune vérification pour le moment.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Session</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Commande</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Événements</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Début</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/verifications/${r.id}`} className="font-mono text-blue-600 hover:underline">
                      {r.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{r.amazon_order_id}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "passed" ? "bg-green-100 text-green-700" :
                      r.status === "failed" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{r.event_count}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(r.started_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
