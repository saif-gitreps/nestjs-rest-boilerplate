import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { BookmarkpModule } from "./bookmarkp/bookmarkp.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [AuthModule, UserModule, BookmarkpModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
