"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  updateBusinessSettings,
  updateCatalogPack,
  updateCatalogService,
  type PackUpdateInput,
  type ServiceUpdateInput,
} from "@/lib/catalog";
import type { BusinessSettings, IconName } from "@/lib/data";
import { requireOperatorIdentity } from "@/lib/operator-auth";
import { logOperatorActivity } from "@/lib/operator-members";

function readText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function requireOperator() {
  return requireOperatorIdentity({ adminOnly: true });
}

function refreshCatalogPages() {
  revalidatePath("/");
  revalidatePath("/operator");
  revalidatePath("/operator/catalog");
  revalidatePath("/conditions");
  revalidatePath("/confidentialite");
}

function errorRedirect(error: unknown, tab: string): never {
  const message = error instanceof Error ? error.message : "La modification n’a pas pu être enregistrée.";
  redirect(`/operator/catalog?tab=${tab}&error=${encodeURIComponent(message)}`);
}

export async function updatePackAction(formData: FormData) {
  const identity = await requireOperator();
  const input: PackUpdateInput = {
    id: readText(formData, "id"),
    name: readText(formData, "name"),
    idealFor: readText(formData, "idealFor"),
    price: readText(formData, "price"),
    delay: readText(formData, "delay"),
    benefits: readText(formData, "benefits").split(/\r?\n/),
    popular: readBoolean(formData, "popular"),
    quote: readBoolean(formData, "quote"),
    isActive: readBoolean(formData, "isActive"),
    sortOrder: Number(readText(formData, "sortOrder")),
  };

  try {
    await updateCatalogPack(input);
  } catch (error) {
    errorRedirect(error, "packs");
  }

  await logOperatorActivity({ actorEmail: identity.email, action: "updated", entityType: "pack", entityId: input.id, summary: `Pack ${input.name} mis à jour` }).catch(console.error);

  refreshCatalogPages();
  redirect("/operator/catalog?tab=packs&saved=pack");
}

export async function updateServiceAction(formData: FormData) {
  const identity = await requireOperator();
  const input: ServiceUpdateInput = {
    id: readText(formData, "id"),
    title: readText(formData, "title"),
    description: readText(formData, "description"),
    icon: readText(formData, "icon") as IconName,
    isActive: readBoolean(formData, "isActive"),
    sortOrder: Number(readText(formData, "sortOrder")),
  };

  try {
    await updateCatalogService(input);
  } catch (error) {
    errorRedirect(error, "services");
  }

  await logOperatorActivity({ actorEmail: identity.email, action: "updated", entityType: "service", entityId: input.id, summary: `Service ${input.title} mis à jour` }).catch(console.error);

  refreshCatalogPages();
  redirect("/operator/catalog?tab=services&saved=service");
}

export async function updateBusinessSettingsAction(formData: FormData) {
  const identity = await requireOperator();
  const input: BusinessSettings = {
    whatsappNumber: readText(formData, "whatsappNumber"),
    callPhoneNumber: readText(formData, "callPhoneNumber"),
    displayPhoneNumber: readText(formData, "displayPhoneNumber"),
    emailAddress: readText(formData, "emailAddress"),
    locationLabel: readText(formData, "locationLabel"),
    businessHours: readText(formData, "businessHours"),
  };

  try {
    await updateBusinessSettings(input);
  } catch (error) {
    errorRedirect(error, "settings");
  }

  await logOperatorActivity({ actorEmail: identity.email, action: "updated", entityType: "settings", entityId: "main", summary: "Coordonnées publiques mises à jour" }).catch(console.error);

  refreshCatalogPages();
  redirect("/operator/catalog?tab=settings&saved=settings");
}
