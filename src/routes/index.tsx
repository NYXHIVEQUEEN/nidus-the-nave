import { createFileRoute } from "@tanstack/react-router";
import { NidusApp } from "@/components/nidus/NidusApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <NidusApp />;
}
