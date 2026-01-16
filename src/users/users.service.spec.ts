import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

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

  // it('usersService should be defined', () => {
  //   expect(usersService).toBeUndefined();
  // });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Igor',
        email: 'igor@gmail.com',
        password: '123456789',
      };

      const passwordHash = 'HASHDASENHA';

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
  });
});
