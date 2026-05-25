import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    uploadPicture: jest.fn(),
  };

  beforeAll(async () => {
    controller = new UsersController(usersServiceMock as any);
  });

  it('create - must use UserService with the correct argument', async () => {
    const argument = { key: 'value' };
    const expectedValue = { key: 'anyValue' };

    jest.spyOn(usersServiceMock, 'create').mockResolvedValue(expectedValue);

    const result = await controller.create(argument as any);

    expect(usersServiceMock.create).toHaveBeenCalledWith(argument);
    expect(result).toEqual(expectedValue);
  });

  it('findAll - must call findAll from UserService and return expected value', async () => {
    const expectedValue = { key: 'anyValue' };

    jest.spyOn(usersServiceMock, 'findAll').mockResolvedValue(expectedValue);

    const result = await controller.findAll();

    expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedValue);
  });

  it('findOne - must call findOne from UserService and return expected value', async () => {
    const expectedValue = { key: 'anyValue' };

    jest.spyOn(usersServiceMock, 'findOne').mockResolvedValue(expectedValue);

    const result = await controller.findOne(1);

    expect(usersServiceMock.findOne).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedValue);
  });

  it('update - must use UserService with the correct argument and return expected value', async () => {
    const argument = { key: 'value' };
    const tokenPayload = {
      email: 'any@email.com',
    };
    const expectedValue = { key: 'anyValue' };

    jest.spyOn(usersServiceMock, 'update').mockResolvedValue(expectedValue);

    const result = await controller.update(
      1,
      argument as any,
      tokenPayload as any,
    );

    expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedValue);
  });

  it('uploadPicture - must call uploadPicture from UserService with the correct argument', async () => {
    const argument = { key: 'value' };
    const expectedValue = { key: 'anyValue' };
    const tokenPayload = {
      email: 'any@email.com',
    };

    jest
      .spyOn(usersServiceMock, 'uploadPicture')
      .mockResolvedValue(expectedValue);

    const result = await controller.uploadPicture(
      argument as any,
      tokenPayload as any,
    );

    expect(usersServiceMock.uploadPicture).toHaveBeenCalledWith(
      argument,
      tokenPayload,
    );
    expect(result).toEqual(expectedValue);
  });
});
