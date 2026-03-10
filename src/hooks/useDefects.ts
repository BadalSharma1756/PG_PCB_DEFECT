import { useState, useEffect, useCallback } from "react";
import { subscribeDefectsByLocation, getDefectsByLocation, addDefect } from "@/lib/firestore";
import { mockDefects } from "@/lib/mockData";
import type { Defect } from "@/lib/types";
import { getDb } from "@/lib/firebase";

export function useDefects(location: string | null) {
  const [defects, setDefects] = useState<Defect[]>([]);
  const useFirebase = !!getDb();

  useEffect(() => {
    if (!location) {
      setDefects([]);
      return;
    }
    if (useFirebase) {
      const unsub = subscribeDefectsByLocation(location, setDefects);
      return () => unsub?.();
    }
    setDefects(mockDefects.filter((d) => d.location === location));
    return undefined;
  }, [location, useFirebase]);

  const submitDefect = useCallback(
    async (data: Omit<Defect, "id">) => {
      if (useFirebase) {
        await addDefect(data);
      } else {
        setDefects((prev) => [
          { ...data, id: String(Date.now()) } as Defect,
          ...prev,
        ]);
      }
    },
    [useFirebase]
  );

  return { defects, submitDefect, useFirebase };
}

export async function fetchDefectsForExport(location: string): Promise<Defect[]> {
  if (getDb()) return getDefectsByLocation(location);
  return mockDefects.filter((d) => d.location === location);
}
