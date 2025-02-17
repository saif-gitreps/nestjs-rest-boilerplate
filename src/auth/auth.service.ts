import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signin(dto: AuthDto) {
    const userFromDb = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!userFromDb) {
      throw new ForbiddenException("Incorrect email or password");
    }

    const passwordMatch = await argon.verify(userFromDb.hash, dto.password);

    if (!passwordMatch) {
      throw new ForbiddenException("Incorrect email or password");
    }

    return this.signToken(userFromDb.id, userFromDb.email);
  }

  async signup(dto: AuthDto) {
    const pwHash = await argon.hash(dto.password);

    try {
      const userFromDb = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: pwHash,
        },
      });

      const { hash, ...user } = userFromDb; // eslint-disable-line @typescript-eslint/no-unused-vars
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("User with this email already exists");
        }
      }
      throw error;
    }
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: "15m",
      secret: "secret",
    });
  }
}
