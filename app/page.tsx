import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/deliveries");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900">
          Delivery Verify
        </h1>
        <p className="mb-8 text-lg text-neutral-600">
          Vérification multisignature pour livraisons de valeur.
          Éliminez la fraude OTP avec GPS, photo et confirmation mutuelle.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            Créer un compte
          </Link>
        </div>
      </main>
    </div>
  );
}
