import { gameConfig } from "../core/game/GameConfig";
import type { BalanceData } from "./types/BalanceData";
import type { WeaponBalance } from "./types/WeaponBalance";

export class BalanceLoader {
    public async loadAll(): Promise<BalanceData> {
        const url = `${import.meta.env.BASE_URL}${gameConfig.weaponsDataUrl}`;
        const [
            weapons,
        ] = await Promise.all([
            this.loadJson<WeaponBalance[]>(url),
        ]);

        return { weapons };
    }

    private async loadJson<T>(url: string): Promise<T> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load balance: ${url}`);
        }

        return response.json() as Promise<T>;
    }
}
