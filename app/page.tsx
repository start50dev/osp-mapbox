import { MapView } from "@/components/map-view";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  return (
    <main className="flex h-screen">
      <Sidebar />
      <MapView />
    </main>
  );
}