// import * as bcrypt from 'bcrypt'
// import { Injectable } from '@nestjs/common';

// export type User = {
//     userId: number;
//     username: string;
//     password: string;
// }
// @Injectable()
// export class UsersService {
//   private users: User[] = [];

//   private nextUserId = 1;

//   async create(user: { username: string; password: string }) {
//     const newUser: User = {
//       userId: this.nextUserId++,
//       ...user,
//     };
//     this.users.push(newUser);
//     return newUser;
//   }

//   async findOne(username: string): Promise<User | undefined> {
//     return this.users.find(user => user.username === username);
//   }
//   async findOnePlayer(userId: number): Promise<User | undefined> {
//     return this.users.find(user => user.userId === userId);
//   }
//   async findAll(): Promise<User[]> {
//     return this.users;
//   }
// }

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: { username: string; password: string }) {
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
}
