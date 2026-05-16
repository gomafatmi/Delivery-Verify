import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface DeliveryDetail {
  id: string;
  amazon_order_id: string;
  customer_id: string;
  delivery_person_id: string | null;
  product_description: string | null;
  product_value: string;
  delivery_address: string;
  delivery_lat: string | null;
  delivery_lng: string | null;
  otp_code: string | null;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  delivery_person_name: string | null;
}

export default async function DeliveryDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await props.params;

  const [delivery] = await sql<DeliveryDetail[]>`
    SELECT d.*, c.name as customer_name, c.email as customer_email,
           dp.name as delivery_person_name
    FROM deliveries d
    JOIN users c ON c.id = d.customer_id
    LEFT JOIN users dp ON dp.id = d.delivery_person_id
    WHERE d.id = ${id}
  `;
  if (!delivery) return <p className="text-neutral-500">Livraison introuvable.</p>;

  const canVerify = ["pending", "assigned", "in_transit"].includes(delivery.status) &&
    (session.user.role === "delivery_person" || session.user.role === "amazon_admin");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/deliveries" className="mb-4 inline-block text-sm text-blue-600 hover:underline">&larr; Retour</Link>
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Détail de la livraison</h1>
            <p className="font-mono text-sm text-neutral-500">{delivery.amazon_order_id}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            delivery.status === "completed" ? "bg-green-100 text-green-700" :
            delivery.status === "failed" ? "bg-red-100 text-red-700" :
            delivery.status === "disputed" ? "bg-yellow-100 text-yellow-700" :
            "bg-blue-100 text-blue-700"
          }`}>{delivery.status}</span>
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
            <dd className="font-medium text-neutral-900">{delivery.customer_name}<br /><span className="text-xs text-neutral-500">{delivery.customer_email}</span></dd>
          </div>
          <div>
            <dt className="text-neutral-500">Livreur</dt>
            <dd className="font-medium text-neutral-900">{delivery.delivery_person_name ?? "Non assigné"}</dd>
          </div>
        </dl>

        {canVerify && (
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <Link
              href={`/deliveries/${delivery.id}/verify`}
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Démarrer la vérification
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
