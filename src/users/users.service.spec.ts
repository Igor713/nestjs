import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: HashingService, useValue: {} },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository: module.get<Repository<User>>(getRepositoryToken(User));
    hashingService: module.get<HashingService>(HashingService);
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeUndefined();
  });
});
