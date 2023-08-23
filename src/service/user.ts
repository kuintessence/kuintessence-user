import { Apis, apiRequest } from 'src/boot/axios';

export class UserService {
  // 获取oidc用户自定义信息
  static async getOidcUserInfo() {
    const res: any = await apiRequest.get(`${Apis.OidcUrl}/account`);
    const userInfo: { firstName: string; lastName: string; attributes: { [key: string]: string } } = {
      ...res,
      firstName: res.firstName || '',
      lastName: res.lastName || '',
      attributes: {
        nickName: res.attributes?.nickName ? (res.attributes.nickName[0] as string) : '',
        userPhone: res.attributes?.userPhone ? (res.attributes.userPhone[0] as string) : '',
      },
    };
    return userInfo;
  }
  static async updateOidcUserInfo(infoData: { [key: string]: string }) {
    const userInfo = await this.getOidcUserInfo();
    for (const key in infoData) {
      if (Object.prototype.hasOwnProperty.call(infoData, key)) {
        const value = infoData[key];
        if (key == 'firstName' || key == 'lastName') {
          userInfo[key] = value;
        } else {
          userInfo.attributes[key] = value;
        }
      }
    }
    return await apiRequest.post(`${Apis.OidcUrl}/account`, userInfo);
  }
}
