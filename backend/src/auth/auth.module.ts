// radical/backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <<< 1. Importar TypeOrmModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { UserEntity } from '../database/entities/user.entity'; // <<< 2. Importar UserEntity

// Removido UsersService (mock)

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME', '1h');
        if (!secret) throw new Error('JWT_SECRET missing');
        // Usar um nome de logger diferente ou remover se não precisar mais distinguir
        console.log(`[AuthModule Radical] JWT Config: Secret [${secret ? secret.substring(0,3) : 'N/A'}...], ExpiresIn [${expiresIn}]`);
        return { secret: secret, signOptions: { expiresIn: expiresIn } };
      },
    }),
    TypeOrmModule.forFeature([UserEntity]), // <<< 3. Adicionar forFeature com UserEntity
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    // Removido UsersService daqui <<< 4. Remover Mock Service
  ],
  exports: [PassportModule, JwtModule]
})
export class AuthModule {
   constructor() {
     console.log('[AuthModule Radical] AuthModule inicializado.');
   }
}