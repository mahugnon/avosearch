export function buildCompletionMessage(_wantsLawyerValidation: boolean): string {
  return "Votre contrat est prêt dans l’aperçu à droite. Cliquez sur « Demander un avocat » : nous sélectionnons l’avocat le mieux adapté (spécialité, tarif, réactivité, avis) et vous recevrez son retour après règlement.";
}

export function detectLawyerValidationIntent(text: string): boolean {
  return /\b(avocat|validation|valid[ée]r|relire|relecture)\b/i.test(text);
}
