import { EnemyType } from '../views/types/EnemyType';
import {
    NoAttackStrategy,
    RangedAttackStrategy,
    type EnemyAttackStrategy,
} from './EnemyAttackStrategy';

type AttackCreator = () => EnemyAttackStrategy;

export class EnemyAttackFactory {
    private readonly creators: Partial<Record<EnemyType, AttackCreator>> = {
        [EnemyType.STRIKER]: () => new RangedAttackStrategy(),
    };

    public create(type: EnemyType): EnemyAttackStrategy {
        const creator = this.creators[type];
        return creator ? creator() : new NoAttackStrategy();
    }
}
