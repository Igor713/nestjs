import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenPayloadDto } from 'src/auth/dto/token.payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso!');
    }

    const passwordHash = await this.hashingService.hash(createUserDto.password);

    const userData = {
      name: createUserDto.name,
      passwordHash,
      email: createUserDto.email,
    };

    const user = this.userRepository.create(userData);

    return await this.userRepository.save(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const useData = {
      name: updateUserDto.name,
      email: updateUserDto.email,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );

      useData['passwordHash'] = passwordHash;
    }

    const user = await this.userRepository.preload({
      id,
      ...useData,
    });

    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado!`);
    }

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException('Você não é essa pessoa');
    }

    return this.userRepository.save(user);
  }

  async findOne(id: number) {
    const userFound = await this.userRepository.findOne({ where: { id } });

    if (!userFound) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return userFound;
  }

  async findAll() {
    const users = await this.userRepository.find({
      order: {
        id: 'desc',
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('Usuários não encontrados!');
    }

    return users;
  }

  async remove(id: number, tokenPayloadDto: TokenPayloadDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (user?.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException('Você não é essa pessoa');
    }
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('File too small!');
    }

    const user = await this.userRepository.findOne({
      where: { id: tokenPayload.sub },
    });

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);

    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    await fs.writeFile(fileFullPath, file.buffer);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.picture = fileName;
    await this.userRepository.save(user);
  }
}
