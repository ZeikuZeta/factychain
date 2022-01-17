import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './accounts/models/account.entity';
import { AccountsModule } from './accounts/accounts.module';
import { EventsModule } from './events/events.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres-password',
      database: 'factychain_view',
      entities: [AccountEntity],
      synchronize: true,
    }),
    EventsModule.forRoot(),
    RedisModule.forRoot({
      closeClient: true,
      config: {
        host: 'localhost',
        port: 6379,
      }
    }),
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
