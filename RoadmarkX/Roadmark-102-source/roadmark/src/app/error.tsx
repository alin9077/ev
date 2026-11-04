"use client";
import { RoadmarkError } from "@/components/roadmark-error";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <RoadmarkError retry={reset} />;
}
