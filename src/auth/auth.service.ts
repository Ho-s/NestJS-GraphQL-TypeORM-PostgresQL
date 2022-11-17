import { firstValueFrom } from 'rxjs';
import { JwtWithUser } from '../entities/auth';
import { UserService } from '../user/user.service';
import { generateJWT } from '../util/generateJWT';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  async kakaoLogin(accessToken: string): Promise<JwtWithUser> {
    const requestUrl = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const params = {
      secure_resource: true,
    };
    const { data } = await firstValueFrom(
      this.httpService.get(requestUrl, {
        headers,
        params,
      }),
    );
    const kakaoAccount = data.kakao_account.profile;
    const { id } = data;
    const {
      nickname,
      profile_image_url: profileImage,
      email: username,
    } = kakaoAccount;
    const provider = `kakao_${id}`;

    let user = await this.userService.getOne({ where: { provider } });

    if (!user) {
      user = await this.userService.create({
        username,
        nickname,
        provider,
        profileImage,
        role: 'user',
      });
    }

    const jwt = generateJWT(user);
    return { jwt, ...user };
  }
}
