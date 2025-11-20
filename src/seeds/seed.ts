import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserRole } from '../common/enums/role.enum';
import { ServicesService } from '../modules/services/services.service';

const logger = new Logger('Seeder');

async function seedAdmin(usersService: UsersService) {
  const adminEmail = 'admin@salon.com';
  const existing = await usersService.findByEmail(adminEmail);
  if (existing) {
    logger.log('Admin user already exists');
    return;
  }

  await usersService.create({
    name: 'Salon Admin',
    email: adminEmail,
    password: 'Admin@123',
    role: UserRole.ADMIN,
  });
  logger.log('Admin user created (email: admin@salon.com, password: Admin@123)');
}

async function seedServices(servicesService: ServicesService) {
  const defaults = [
    {
      name: 'Classic Haircut',
      description: 'Professional haircut with wash and style.',
      price: 45,
      duration: 45,
      category: 'Hair',
    },
    {
      name: 'Relaxing Massage',
      description: '60 minutes full body massage to ease stress.',
      price: 80,
      duration: 60,
      category: 'Spa',
    },
    {
      name: 'Deluxe Manicure',
      description: 'Complete manicure service with gel polish.',
      price: 55,
      duration: 50,
      category: 'Nails',
    },
  ];

  const existing = await servicesService.findAll();
  const existingNames = new Set(existing.map((svc) => svc.name.toLowerCase()));

  for (const service of defaults) {
    if (existingNames.has(service.name.toLowerCase())) {
      continue;
    }
    await servicesService.create(service);
    logger.log(`Seeded service: ${service.name}`);
  }
}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  try {
    const usersService = appContext.get(UsersService);
    const servicesService = appContext.get(ServicesService);

    await seedAdmin(usersService);
    await seedServices(servicesService);

    logger.log('Database seeding completed');
    await appContext.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', error);
    await appContext.close();
    process.exit(1);
  }
}

bootstrap();

