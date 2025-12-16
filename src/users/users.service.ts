import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common';

export type User = {
    userId: number;
    username: string;
    password: string;
}


@Injectable()
export class UsersService {
  private users: User[] = [];

  private nextUserId = 1;

  async create(user: { username: string; password: string }) {
    const newUser: User = {
      userId: this.nextUserId++,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

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