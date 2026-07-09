"use client";

import { useState } from "react";
import ProfessionalForm, { type ProfessionalFormData } from "../ProfessionalForm";
import PerfilTab, { type PerfilInitial } from "./PerfilTab";

export interface ProfessionalTabsProps {
  initial: ProfessionalFormData & PerfilInitial;
  billingEnabled: boolean;
  nfseEnabled: boolean;
  /** Perfil (foto/bio/redes) só existe com módulo agenda (F3.1 / Guardrail 2). */
  agendaEnabled: boolean;
}

function tabCls(on: boolean) {
  return `border-b-2 px-1 py-2.5 font-medium ${
    on ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"
  }`;
}

export default function ProfessionalTabs({
  initial,
  billingEnabled,
  nfseEnabled,
  agendaEnabled,
}: ProfessionalTabsProps) {
  const [tab, setTab] = useState<"dados" | "perfil">("dados");

  return (
    <div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 text-sm">
          <button type="button" onClick={() => setTab("dados")} className={tabCls(tab === "dados")}>
            Dados
          </button>
          {agendaEnabled && (
            <button type="button" onClick={() => setTab("perfil")} className={tabCls(tab === "perfil")}>
              Perfil
            </button>
          )}
        </nav>
      </div>

      {tab === "dados" && (
        <ProfessionalForm initial={initial} billingEnabled={billingEnabled} nfseEnabled={nfseEnabled} />
      )}
      {tab === "perfil" && agendaEnabled && <PerfilTab initial={initial} />}
    </div>
  );
}
