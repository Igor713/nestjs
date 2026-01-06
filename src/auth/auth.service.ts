import { HashingService } from 'src/auth/hashing/hashing.service';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import jwtConfig from './config/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    let passwordValid = false;
    let throwError = true;

    const user = await this.usersRepository.findOneBy({
      email: loginDto.email,
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não autorizado!');
    }

    if (user) {
      passwordValid = await this.hashingService.compare(
        loginDto.password,
        user.passwordHash,
      );
    }

    if (passwordValid) {
      throwError = false;
    }

    if (throwError) {
      throw new UnauthorizedException('Usuário ou senha inválidos!');
    }

    return await this.createTokens(user);
  }

  private async createTokens(user: User | null) {
    const accessToken = await this.signJwtAsync<Partial<User>>(
      user?.id!,
      this.jwtConfiguration.jwtTtl,
      {},
    );

    const refreshToken = await this.signJwtAsync(
      user?.id!,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshToken: RefreshTokenDto) {
    const sub = await this.jwtService.verifyAsync(
      refreshToken.refreshToken,
      this.jwtConfiguration,
    );

    const user = await this.usersRepository.findOneBy({
      id: sub?.id,
      isActive: true,
    });

    if (!user) {
      throw new Error('Pessoa não autorizada!');
    }

    return await this.createTokens(user);
  }
}
