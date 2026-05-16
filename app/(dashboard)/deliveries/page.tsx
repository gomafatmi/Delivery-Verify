import Link from "next/link";
import sql from "@/lib/db";
import { auth } from "@/lib/auth";

interface DeliveryRow {
  id: string;
  amazon_order_id: string;
  product_description: string | null;
  product_value: string;
  status: string;
  customer_name: string;
  created_at: string;
}

export default async function DeliveriesPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "amazon_admin";
  const isDelivery = session?.user?.role === "delivery_person";

  let rows: DeliveryRow[];
  if (isDelivery) {
    rows = await sql<DeliveryRow[]>`
      SELECT d.id, d.amazon_order_id, d.product_description, d.product_value,
             d.status, u.name as customer_name, d.created_at
      FROM deliveries d JOIN users u ON u.id = d.customer_id
      WHERE d.delivery_person_id = ${session!.user.id}
      ORDER BY d.created_at DESC
    `;
  } else {
    rows = await sql<DeliveryRow[]>`
      SELECT d.id, d.amazon_order_id, d.product_description, d.product_value,
             d.status, u.name as customer_name, d.created_at
      FROM deliveries d JOIN users u ON u.id = d.customer_id
      ORDER BY d.created_at DESC
    `;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Livraisons</h1>
        {isAdmin && (
          <Link
            href="/deliveries/new"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Nouvelle livraison
          </Link>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune livraison trouvée.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Commande</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Produit</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Valeur</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/deliveries/${r.id}`} className="font-mono text-blue-600 hover:underline">
                      {r.amazon_order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{r.product_description ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">${Number(r.product_value).toFixed(2)}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "completed" ? "bg-green-100 text-green-700" :
                      r.status === "failed" ? "bg-red-100 text-red-700" :
                      r.status === "disputed" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
