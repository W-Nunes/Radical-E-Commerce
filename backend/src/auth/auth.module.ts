
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importar ConfigService

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserEntity } from '../database/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // É bom ter o imports aqui também por clareza
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME', '60m'); // Default 60m

        if (!secret) {
          throw new Error('JWT_SECRET não definido no .env!');
        }

        console.log(`[AuthModule] Configurando JWT com secret [${secret ? secret.substring(0, 3) : 'N/A'}...] e expiração [${expiresIn}]`);

        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn },
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
      AuthResolver,
      AuthService,
      JwtStrategy
    ],
  exports: [PassportModule, JwtModule] // <<< Exportações OK
})
export class AuthModule {
  constructor() {
    Logger.log('AuthModule inicializado e pronto.', 'AuthModuleInit');
  }
}