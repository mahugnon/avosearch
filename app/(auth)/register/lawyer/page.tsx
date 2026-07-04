import type { Metadata } from "next";
import { RegisterLawyerForm } from "@/components/auth/register-lawyer-form";

export const metadata: Metadata = {
  title: "Inscription avocat",
};

export default function RegisterLawyerPage() {
  return <RegisterLawyerForm />;
}
