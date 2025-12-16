import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    // hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // créer l'utilisateur
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
    });

    const payload = { sub: user.userId, username: user.username };
    return { success: true,
             message: "Utilisateur crée avec succès",
             username: user.username,
             userId: user.userId
            };
  }

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid password');

    const payload = { sub: user.userId, username: user.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
