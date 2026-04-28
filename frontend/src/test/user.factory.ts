import { faker } from '@faker-js/faker';

export interface IGenerateUser {
  username?: string;
}

export interface IUser {
  username: string;
  password: string;
}

export function generateUser(overrides?: IGenerateUser): IUser {
  return {
    username: overrides?.username ?? faker.internet.username(),
    password: faker.internet.password({ length: 12 }),
  };
}
