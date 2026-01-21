import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingService>(HashingService);
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Igor',
      email: 'igor@gmail.com',
      password: '123456789',
    };

    const passwordHash = 'HASHDASENHA';

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new user', async () => {
      const newUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(userRepository, 'save').mockReturnValue(newUser as any);

      const result = await usersService.create(createUserDto);

      expect(hashingService.hash).toHaveBeenLastCalledWith(
        createUserDto.password,
      );

      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: 'HASHDASENHA',
      });

      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should throw an error if email already exists', async () => {
      const existingUser = {
        id: 1,
        name: 'Outro usuário',
        email: createUserDto.email,
        passwordHash,
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser as any);

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        'Email já está em uso!',
      );

      expect(hashingService.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an user if exists', async () => {
      const userId = 1;

      const userFound = {
        id: userId,
        name: 'Igor',
        email: 'igor@gmail.com',
        passwordHash: '123456',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userFound as any);

      const result = await usersService.findOne(userId);

      expect(result).toEqual(userFound);
    });
  });
});
