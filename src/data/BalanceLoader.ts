import type { BalanceData } from "./types/BalanceData";
import type { WeaponBalance } from "./types/WeaponBalance";

export class BalanceLoader {
    public async loadAll(): Promise<BalanceData> {
        const [
            weapons,
        ] = await Promise.all([
            this.loadJson<WeaponBalance[]>("/data/balance/weapons.json"),
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
