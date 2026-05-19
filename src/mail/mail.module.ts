import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigService } from '@nestjs/config';


// // ✅ DEBUG LOGS (runs immediately when file is loaded)
// console.log('📧 MAIL CONFIG DEBUG START');
// console.log('MAIL_HOST:', process.env.MAIL_HOST);
// console.log('MAIL_PORT:', process.env.MAIL_PORT);
// console.log('MAIL_USER:', process.env.MAIL_USER);
// console.log('MAIL_PASS:', process.env.MAIL_PASS ? '✅ EXISTS' : '❌ MISSING');
// console.log('MAIL_FROM:', process.env.MAIL_FROM);
// console.log('📧 MAIL CONFIG DEBUG END');

// @Module({
//   imports: [
//     MailerModule.forRootAsync({
//       inject: [ConfigService],

//       useFactory: (config: ConfigService) => ({
//         transport: {
//           host: config.get<string>('MAIL_HOST'),

//           // Gmail SSL port
//           port: 465,

//           // MUST be true for port 465
//           secure: true,

//           // Railway IPv6 fix
//           family: 4,

//           auth: {
//             user: config.get<string>('MAIL_USER'),
//             pass: config.get<string>('MAIL_PASS'),
//           },

//           // Prevent hanging/timeouts
//           connectionTimeout: 10000,
//           greetingTimeout: 10000,
//           socketTimeout: 10000,

//           tls: {
//             rejectUnauthorized: false,
//           },
//         },

//         defaults: {
//           from: config.get<string>('MAIL_FROM'),
//         },
//       }),
//     }),
//   ],

//   providers: [MailService],

//   exports: [MailerModule, MailService],

//   controllers: [MailController],
// })
// export class MailModule {}


@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',

          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },

          family: 4,

          pool: true,
          maxConnections: 1,

          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
        },

        defaults: {
          from: config.get<string>('MAIL_FROM'),
        },
      }),
    }),
  ],

  providers: [MailService],

  exports: [MailerModule, MailService],

  controllers: [MailController],
})
export class MailModule {}