import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly usersService: UsersService) {}

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.sanitize(user);
  }

  async updateProfile(userId: string, updateCustomerDto: UpdateCustomerDto) {
    const updated = await this.usersService.updateProfile(userId, updateCustomerDto as Partial<User>);
    return this.sanitize(updated);
  }

  private sanitize(user: User) {
    const { password, refreshTokenHash, ...rest } = user;
    return rest;
  }
}

