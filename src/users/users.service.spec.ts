import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TokenPayloadDto } from 'src/auth/dto/token.payload.dto';

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
            find: jest.fn(),
            preload: jest.fn(),
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
    afterEach(() => {
      jest.clearAllMocks();
    });

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

    it('should throw NotFoundException if user doesnt exists', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.findOne(userId)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });

  describe('findAll', () => {
    const users = [
      {
        id: 1,
        name: 'Igor',
        email: 'igor@gmail.com',
        passwordHash: '123456',
      } as User,
      {
        id: 2,
        name: 'Kauane',
        email: 'kauane@gmail.com',
        passwordHash: '123',
      } as User,
    ];

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return all users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);

      const result = await usersService.findAll();

      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalledWith({
        order: {
          id: 'desc',
        },
      });
    });

    it('should throw NotFoundException if users doesnt exists', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([]);

      expect(usersService.findAll()).rejects.toThrow(
        'Usuários não encontrados!',
      );
    });
  });

  describe('update', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should update an user if has authorization', async () => {
      const userId = 1;
      const updateUserDto = { name: 'Igor', password: '123456789' };
      const tokenPayload = { sub: userId } as TokenPayloadDto;
      const passwordHash = 'HASHDESENHA';

      const updateUser = {
        id: userId,
        name: 'Igor',
        passwordHash,
      } as User;

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

      jest.spyOn(userRepository, 'preload').mockResolvedValue(updateUser);

      jest.spyOn(userRepository, 'save').mockResolvedValue(updateUser);

      const result = await usersService.update(
        userId,
        updateUserDto,
        tokenPayload,
      );

      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);

      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userId,
        name: updateUserDto.name,
        email: undefined,
        passwordHash,
      });

      expect(userRepository.save).toHaveBeenCalledWith(updateUser);
      expect(result).toEqual(updateUser);
    });
  });
});
