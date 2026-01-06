import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Double } from 'typeorm/browser';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  money: number;

  // Nouvelle colonne pour suivre combien d'euros ont été ajouté aujourd'hui
  @Column({ type: 'float', default: 0 })
  dailyDeposit: number;

  // Nouvelle colonne pour stocker la date du dernier dépôt
  @Column({ type: 'date', nullable: true })
  lastDepositDate: string;
}
