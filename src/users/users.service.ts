
import { Injectable } from '@nestjs/common';

export type User = {
    userId: number;
    username: string;
    password: string;
}

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
    {
      userId: 3,
      username: 'alex',
      password: 'secret123',
    }
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  async findOnePlayer(userId: number): Promise<User | undefined> {
    return this.users.find(user => user.userId === userId);
  }
  async findAll(): Promise<User[]> {
    return this.users;
  }
}