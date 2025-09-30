import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('registration')
@Unique(['username', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  phoneNumber!: string;

  @Column()
  address!: string;

  @Column({ default: false })
  isVerified!: boolean;

   @Column({ type: "varchar", nullable: true })
    otp: string | null;

    @Column({ type: "timestamp", nullable: true })
    otpExpiry: Date | null;

}