import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: { username: string; password: string; money: number }) {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  async findOnePlayer(userId: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { userId: userId } });
    return user ?? undefined;
  }

  async deposit(userId: number, amount: number): Promise<number | undefined> {
    const user = await this.findOnePlayer(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const today = new Date().toISOString().split('T')[0];

    // Réinitialiser le compteur si c'est un nouveau jour
    if (user.lastDepositDate !== today) {
      user.dailyDeposit = 0;
      user.lastDepositDate = today;
    }

    if (user.dailyDeposit + amount > 100) {
      throw new BadRequestException('Vous ne pouvez pas ajouter plus de 100€ par jour');
    }

    user.money += amount;
    user.dailyDeposit += amount;

    await this.usersRepository.save(user);
    return user.money;
  }
}
