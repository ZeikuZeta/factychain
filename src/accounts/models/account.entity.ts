import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AccountEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    money: number;
}