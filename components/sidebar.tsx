"use client";

import { useState } from "react";
import { Network, Layers, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NETWORK_STATUSES = [
  { id: "design", label: "Design", color: "bg-blue-500" },
  { id: "construction", label: "Construction", color: "bg-orange-500" },
  { id: "as-built", label: "As-Built", color: "bg-green-500" },
];

export function Sidebar() {
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  const toggleStatus = (statusId: string) => {
    setActiveStatuses((current) =>
      current.includes(statusId)
        ? current.filter((id) => id !== statusId)
        : [...current, statusId]
    );
  };

  return (
    <div className="w-80 bg-background border-r p-6">
      <div className="flex items-center gap-2 mb-6">
        <Network className="h-6 w-6" />
        <h1 className="text-xl font-semibold">Fiber Network</h1>
      </div>

      <Tabs defaultValue="layers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="layers">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Map className="h-4 w-4 mr-2" />
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layers" className="mt-4">
          <div className="space-y-4">
            {NETWORK_STATUSES.map((status) => (
              <div key={status.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", status.color)} />
                  <span>{status.label}</span>
                </div>
                <Switch
                  checked={activeStatuses.includes(status.id)}
                  onCheckedChange={() => toggleStatus(status.id)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Map className="mr-2 h-4 w-4" />
              Phase 1
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Map className="mr-2 h-4 w-4" />
              Phase 2
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Map className="mr-2 h-4 w-4" />
              Phase 3
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />

      <div className="space-y-4">
        <Button variant="outline" className="w-full">
          Export Data
        </Button>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </div>
    </div>
  );
}