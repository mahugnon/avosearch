import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { sendEmail } from "@/lib/email/send";

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function missionUrl(missionId: string, locale: AppLocale = "fr") {
  return `${APP_URL()}${localizedPath(`/app/missions/${missionId}`, locale)}`;
}

function barristerMissionUrl(missionId: string, locale: AppLocale = "fr") {
  return `${APP_URL()}${localizedPath(`/barrister/missions/${missionId}`, locale)}`;
}

export async function notifyMissionCreated(missionId: string) {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      client: { select: { name: true, email: true } },
      barrister: { select: { name: true, email: true } },
      contract: { select: { title: true } },
    },
  });
  if (!mission?.barrister?.email) return;

  await sendEmail({
    to: mission.barrister.email,
    subject: `[AvoSearch] Nouvelle mission — ${mission.contract.title}`,
    text: `Bonjour ${mission.barrister.name},\n\n${mission.client.name} vous a choisi pour une mission sur « ${mission.contract.title} ».\n\nConsultez la mission : ${barristerMissionUrl(missionId)}`,
  });
}

export async function notifyMissionPaid(missionId: string) {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      client: { select: { name: true, email: true } },
      barrister: { select: { name: true, email: true } },
      contract: { select: { title: true } },
    },
  });
  if (!mission) return;

  if (mission.barrister?.email) {
    await sendEmail({
      to: mission.barrister.email,
      subject: `[AvoSearch] Paiement reçu — ${mission.contract.title}`,
      text: `Bonjour ${mission.barrister.name},\n\nLe client a réglé la mission « ${mission.contract.title} ». Vous pouvez démarrer.\n\n${barristerMissionUrl(missionId)}`,
    });
  }

  if (mission.client.email) {
    await sendEmail({
      to: mission.client.email,
      subject: `[AvoSearch] Paiement confirmé — ${mission.contract.title}`,
      text: `Bonjour ${mission.client.name},\n\nVotre paiement est enregistré. Votre avocat va prendre en charge le dossier.\n\n${missionUrl(missionId)}`,
    });
  }
}

export async function notifyNewMessage(missionId: string, recipientUserId: string, preview: string) {
  const user = await prisma.user.findUnique({
    where: { id: recipientUserId },
    select: { email: true, name: true, role: true },
  });
  if (!user?.email) return;

  const url =
    user.role === "BARRISTER"
      ? barristerMissionUrl(missionId)
      : missionUrl(missionId);

  await sendEmail({
    to: user.email,
    subject: "[AvoSearch] Nouveau message sur votre mission",
    text: `Bonjour ${user.name},\n\nVous avez reçu un message :\n« ${preview.slice(0, 200)} »\n\nRépondre : ${url}`,
  });
}

export async function notifyMissionDelivered(missionId: string) {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      client: { select: { name: true, email: true } },
      contract: { select: { title: true } },
    },
  });
  if (!mission?.client.email) return;

  await sendEmail({
    to: mission.client.email,
    subject: `[AvoSearch] Mission livrée — ${mission.contract.title}`,
    text: `Bonjour ${mission.client.name},\n\nVotre avocat a livré la mission « ${mission.contract.title} ». Consultez le résultat et laissez un avis si vous le souhaitez.\n\n${missionUrl(missionId)}`,
  });
}

export async function notifyBarristerVerified(barristerUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: barristerUserId },
    select: { email: true, name: true },
  });
  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    subject: "[AvoSearch] Profil avocat vérifié",
    text: `Bonjour ${user.name},\n\nVotre profil AvoSearch est désormais vérifié. Vous pouvez recevoir des missions clients.\n\n${APP_URL()}${localizedPath("/barrister/missions", "fr")}`,
  });
}
