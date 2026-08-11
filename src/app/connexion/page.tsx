"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, MapPin } from "lucide-react";
import { getProfessionalByEmail, setSession } from "@/lib/storage";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    const pro = getProfessionalByEmail(email);
    if (!pro || pro.password !== password) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }
    setSession("pro", pro.id);
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-landes-forest to-landes-ocean rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-landes-pine">Espace Professionnel</h1>
          <p className="text-gray-500 mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email professionnel</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="contact@mon-entreprise.fr" required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Pas encore inscrit ?{" "}
            <Link href="/inscription" className="text-landes-forest font-medium hover:underline">
              Référencer mon entreprise
            </Link>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 text-center">
            <Link href="/admin" className="text-xs text-gray-400 hover:text-landes-forest transition-colors">
              Accès administrateur →
            </Link>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">Comptes de démonstration :</p>
          <p>Email : <code className="bg-blue-100 px-1 rounded">boulangerie@example.com</code></p>
          <p>Mot de passe : <code className="bg-blue-100 px-1 rounded">demo123</code></p>
        </div>
      </div>
    </div>
  );
}
