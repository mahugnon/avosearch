import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
};

export default function CguPage() {
  return (
    <>
      <h1>Conditions générales d&apos;utilisation</h1>
      <h2>1. Objet du service</h2>
      <p>
        AvoSearch est un outil d&apos;aide documentaire appliqué aux contrats et une plateforme
        de mise en relation avec des avocats inscrits à un barreau français. AvoSearch
        n&apos;est pas un cabinet d&apos;avocats, ne fournit pas de consultation juridique et ne
        garantit aucun résultat.
      </p>
      <h2>2. Périmètre</h2>
      <p>
        Le service couvre exclusivement les questions contractuelles. Les sujets pénaux,
        familiaux, contentieux ou relevant d&apos;actes réglementés font l&apos;objet d&apos;une
        simple orientation, sans analyse.
      </p>
      <h2>3. Rôle des avocats</h2>
      <p>
        Les avocats interviennent en leur nom propre, sous leur responsabilité professionnelle
        et dans le respect de leur déontologie. Les honoraires des missions sont fixés au
        forfait et affichés avant tout engagement.
      </p>
      <h2>4. Comptes et sécurité</h2>
      <p>
        L&apos;utilisateur est responsable de la confidentialité de ses identifiants. Toute
        utilisation frauduleuse doit être signalée sans délai.
      </p>
      <h2>5. Contenu utilisateur</h2>
      <p>
        Les documents téléversés restent la propriété de l&apos;utilisateur. Ils ne sont
        utilisés que pour fournir le service.
      </p>
    </>
  );
}
