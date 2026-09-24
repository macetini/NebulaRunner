import { gameConfig } from "../core/game/GameConfig";
import type { WeaponBalance } from "./types/WeaponBalance";

export class BalanceDataLoader {
    public async loadWeapons(): Promise<WeaponBalance[]> {
        const response = await fetch(gameConfig.weaponsDataUrl);

        if (!response.ok) {
            throw new Error(`Failed to load weapon balance at: '${gameConfig.weaponsDataUrl}'`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Weapon balance must be an array");
        }

        return data as WeaponBalance[];
    }
}
