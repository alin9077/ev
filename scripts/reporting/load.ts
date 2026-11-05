import {
  catalogueSnapshot,
  effectiveFeatures,
  type CatalogueSnapshot,
} from "../../src/lib/data";
import inventory from "../../src/lib/market-inventory-data";
import { australianEvidenceDate } from "../../src/lib/evidence-date";
import reconciliation from "../../data/m1-market-reconciliation-2026-10-14.json";
import bydReconciliation from "../../data/m1-byd-market-reconciliation-2026-10-14.json";
import teslaReconciliation from "../../data/m1-tesla-market-reconciliation-2026-10-14.json";
import geelyReconciliation from "../../data/m1-geely-market-reconciliation-2026-10-14.json";
import zeekrReconciliation from "../../data/m1-zeekr-market-reconciliation-2026-10-14.json";
import jaecooReconciliation from "../../data/m1-jaecoo-market-reconciliation-2026-10-14.json";
import kiaReconciliation from "../../data/m1-kia-market-reconciliation-2026-10-14.json";
import mgReconciliation from "../../data/m1-mg-market-reconciliation-2026-10-14.json";
import imReconciliation from "../../data/m1-im-market-reconciliation-2026-10-14.json";
import hyundaiReconciliation from "../../data/m1-hyundai-market-reconciliation-2026-10-14.json";
import toyotaReconciliation from "../../data/m1-toyota-market-reconciliation-2026-10-14.json";
import volkswagenReconciliation from "../../data/m1-volkswagen-market-reconciliation-2026-10-14.json";
import volvoReconciliation from "../../data/m1-volvo-market-reconciliation-2026-10-14.json";
import gwmReconciliation from "../../data/m1-gwm-market-reconciliation-2026-10-14.json";
import gacReconciliation from "../../data/m1-gac-market-reconciliation-2026-10-14.json";
import bmwReconciliation from "../../data/m1-bmw-market-reconciliation-2026-10-14.json";
import cheryReconciliation from "../../data/m1-chery-market-reconciliation-2026-10-14.json";
import polestarReconciliation from "../../data/m1-polestar-market-reconciliation-2026-10-14.json";
import subaruReconciliation from "../../data/m1-subaru-market-reconciliation-2026-10-15.json";
import xpengReconciliation from "../../data/m1-xpeng-market-reconciliation-2026-10-15.json";
import mercedesBenzReconciliation from "../../data/m1-mercedes-benz-market-reconciliation-2026-10-15.json";
import leapmotorReconciliation from "../../data/m1-leapmotor-market-reconciliation-2026-10-15.json";
import mazdaReconciliation from "../../data/m1-mazda-market-reconciliation-2026-10-15.json";
import skodaReconciliation from "../../data/m1-skoda-market-reconciliation-2026-10-15.json";
import audiReconciliation from "../../data/m1-audi-market-reconciliation-2026-10-15.json";
import deepalReconciliation from "../../data/m1-deepal-market-reconciliation-2026-10-15.json";
import miniReconciliation from "../../data/m1-mini-market-reconciliation-2026-10-15.json";
import kgmReconciliation from "../../data/m1-kgm-market-reconciliation-2026-10-15.json";
import cupraReconciliation from "../../data/m1-cupra-market-reconciliation-2026-10-15.json";
import renaultReconciliation from "../../data/m1-renault-market-reconciliation-2026-10-15.json";
import nissanReconciliation from "../../data/m1-nissan-market-reconciliation-2026-10-15.json";
import fordReconciliation from "../../data/m1-ford-market-reconciliation-2026-10-15.json";
import {
  combineM1Reconciliations,
  type M1MarketReconciliation,
} from "./m1-reconciliation";
import type { ReportInput, ReportInventory } from "./reports";
export function loadReportInput(snapshot?: CatalogueSnapshot): ReportInput {
  const { data, cars } = snapshot ?? catalogueSnapshot();
  return {
    cars,
    sources: data.sources,
    features: cars.flatMap((car) => effectiveFeatures(car, data)),
    inventory: inventory as unknown as ReportInventory,
    m1Reconciliation: combineM1Reconciliations(
      reconciliation as M1MarketReconciliation,
      bydReconciliation as M1MarketReconciliation,
      teslaReconciliation as M1MarketReconciliation,
      geelyReconciliation as M1MarketReconciliation,
      zeekrReconciliation as M1MarketReconciliation,
      jaecooReconciliation as M1MarketReconciliation,
      kiaReconciliation as M1MarketReconciliation,
      mgReconciliation as M1MarketReconciliation,
      imReconciliation as M1MarketReconciliation,
      hyundaiReconciliation as M1MarketReconciliation,
      toyotaReconciliation as M1MarketReconciliation,
      volkswagenReconciliation as M1MarketReconciliation,
      volvoReconciliation as M1MarketReconciliation,
      gwmReconciliation as M1MarketReconciliation,
      gacReconciliation as M1MarketReconciliation,
      bmwReconciliation as M1MarketReconciliation,
      cheryReconciliation as M1MarketReconciliation,
      polestarReconciliation as M1MarketReconciliation,
      subaruReconciliation as M1MarketReconciliation,
      xpengReconciliation as M1MarketReconciliation,
      mercedesBenzReconciliation as M1MarketReconciliation,
      leapmotorReconciliation as M1MarketReconciliation,
      mazdaReconciliation as M1MarketReconciliation,
      skodaReconciliation as M1MarketReconciliation,
      audiReconciliation as M1MarketReconciliation,
      deepalReconciliation as M1MarketReconciliation,
      miniReconciliation as M1MarketReconciliation,
      kgmReconciliation as M1MarketReconciliation,
      cupraReconciliation as M1MarketReconciliation,
      renaultReconciliation as M1MarketReconciliation,
      nissanReconciliation as M1MarketReconciliation,
      fordReconciliation as M1MarketReconciliation,
    ),
  };
}
export function reportOptions(args: string[], stale = false) {
  let asOf = australianEvidenceDate(),
    days = 30,
    details = false,
    json = false,
    allTiers = false,
    help = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--details") details = true;
    else if (arg === "--json") json = true;
    else if (arg === "--help") help = true;
    else if (arg === "--all-tiers" && stale) allTiers = true;
    else if (arg === "--as-of") asOf = args[++i] || "";
    else if (arg === "--days" && stale) days = Number(args[++i]);
    else throw new Error(`Unknown option ${arg}; use --help`);
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(asOf) ||
    !Number.isFinite(Date.parse(`${asOf}T00:00:00Z`)) ||
    new Date(`${asOf}T00:00:00Z`).toISOString().slice(0, 10) !== asOf
  )
    throw new Error("--as-of must be a real YYYY-MM-DD date");
  if (!Number.isInteger(days) || days < 1 || days > 366)
    throw new Error("--days must be an integer from 1 to 366");
  return { asOf, days, details, json, allTiers, help };
}
