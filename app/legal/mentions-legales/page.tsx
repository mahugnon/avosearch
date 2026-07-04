import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <h2>Éditeur</h2>
      <p>
        AvoSearch (projet de démonstration) — société fictive en cours de constitution.
        Contact : contact@avosearch.test.
      </p>
      <h2>Hébergement</h2>
      <p>Environnement de développement local — aucun hébergeur de production à ce stade.</p>
      <h2>Nature du service</h2>
      <p>
        AvoSearch est un outil d&apos;aide documentaire et une plateforme de mise en relation.
        AvoSearch n&apos;est pas un cabinet d&apos;avocats et ne fournit pas de consultation
        juridique.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus de la plateforme (textes, interface, code) sont protégés. Toute
        reproduction non autorisée est interdite.
      </p>
    </>
  );
}
