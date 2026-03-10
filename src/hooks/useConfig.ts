import { useState, useEffect, useCallback } from "react";
import { getConfig, updateConfig, initConfigIfNeeded, type AppConfig } from "@/lib/firestore";
import {
  getPlants,
  getLocations,
  getLines,
  getIduDefects,
  getOduDefects,
  setPlants,
  setLocations,
  setLines,
  setIduDefects,
  setOduDefects,
} from "@/lib/constants";
import { getDb } from "@/lib/firebase";

const defaultConfig: AppConfig = {
  locations: getLocations(),
  plants: getPlants(),
  lines: getLines(),
  iduDefects: getIduDefects(),
  oduDefects: getOduDefects(),
};

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const useFirebase = !!getDb();

  const load = useCallback(async () => {
    if (useFirebase) {
      await initConfigIfNeeded();
      const c = await getConfig();
      setConfig(c);
      return c;
    }
    setConfig({
      locations: getLocations(),
      plants: getPlants(),
      lines: getLines(),
      iduDefects: getIduDefects(),
      oduDefects: getOduDefects(),
    });
    return null;
  }, [useFirebase]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (partial: Partial<AppConfig>) => {
      if (useFirebase) {
        await updateConfig(partial);
        setConfig((prev) => ({ ...prev, ...partial }));
      } else {
        if (partial.locations) setLocations(partial.locations);
        if (partial.plants) setPlants(partial.plants);
        if (partial.lines) setLines(partial.lines);
        if (partial.iduDefects) setIduDefects(partial.iduDefects);
        if (partial.oduDefects) setOduDefects(partial.oduDefects);
        setConfig((prev) => ({ ...prev, ...partial }));
      }
    },
    [useFirebase]
  );

  return { config, update, useFirebase, refresh: load };
}
