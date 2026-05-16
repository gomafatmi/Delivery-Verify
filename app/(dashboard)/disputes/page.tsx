import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface DisputeRow {
  id: string;
  amazon_order_id: string;
  product_description: string | null;
  status: string;
  customer_name: string;
  created_at: string;
}

export default async function DisputesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const rows = await sql<DisputeRow[]>`
    SELECT d.id, d.amazon_order_id, d.product_description, d.status,
           u.name as customer_name, d.created_at
    FROM deliveries d
    JOIN users u ON u.id = d.customer_id
    WHERE d.status = 'disputed'
    ORDER BY d.updated_at DESC
  `;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Litiges</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune livraison litigieuse.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Commande</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Produit</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/disputes/${r.id}`} className="font-mono text-blue-600 hover:underline">
                      {r.amazon_order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{r.product_description ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.customer_name}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
