import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/deliveries" className="text-lg font-bold text-neutral-900">
            Delivery Verify
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/deliveries" className="text-neutral-600 hover:text-neutral-900">
              Livraisons
            </Link>
            <Link href="/verifications" className="text-neutral-600 hover:text-neutral-900">
              Vérifications
            </Link>
            <Link href="/disputes" className="text-neutral-600 hover:text-neutral-900">
              Litiges
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">
            {session.user.name} ({session.user.role})
          </span>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
