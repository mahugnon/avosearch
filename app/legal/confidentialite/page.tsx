import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <h2>Données collectées</h2>
      <p>
        Compte (nom, e-mail, mot de passe chiffré), documents téléversés et textes saisis,
        analyses produites, échanges de messagerie liés aux missions.
      </p>
      <h2>Finalités</h2>
      <p>
        Fournir le service : analyse documentaire des contrats, mise en relation avec des
        avocats, suivi des missions. Aucune revente de données, aucune publicité.
      </p>
      <h2>Sous-traitants</h2>
      <p>
        Le traitement automatisé des textes contractuels s&apos;appuie sur l&apos;API Anthropic.
        Les documents ne sont pas utilisés pour entraîner des modèles.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez exporter les données de votre compte (format JSON) et supprimer votre
        compte à tout moment ; la suppression entraîne l&apos;effacement en cascade de vos
        documents, analyses et messages. Contact : privacy@avosearch.test.
      </p>
      <h2>Durée de conservation</h2>
      <p>
        Les données sont conservées tant que le compte est actif, puis supprimées à la
        fermeture du compte.
      </p>
    </>
  );
}
