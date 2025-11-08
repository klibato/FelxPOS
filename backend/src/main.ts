import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Sécurité
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefix API
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('FelxPOS API')
    .setDescription('API SaaS de Caisse Enregistreuse conforme NF525')
    .setVersion('1.0')
    .addTag('transactions', 'Gestion des transactions de vente')
    .addTag('closures', 'Clôtures journalières obligatoires')
    .addTag('exports', 'Exports FEC et rapports')
    .addTag('audit', 'Logs d\'audit et traçabilité')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         FelxPOS Backend - Conforme NF525              ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Serveur démarré sur: http://localhost:${port}       ║`);
  console.log(`║  📚 Documentation API: http://localhost:${port}/api/docs║`);
  console.log('║  🔒 Sécurité: Helmet + CORS activés                   ║');
  console.log('║  ✅ Conformité NF525: Active                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();
