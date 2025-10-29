import { DinaAvatar } from "./avatarDina";
import { TokuHoaAvatar } from "./avatarTokuHoa";
import { BaseAvatar } from './avatar';

export const _log = (...msg: any) => {
    console.log('AvatarFactory|', ...msg);
}


export class AvatarFactory {
    static createAvatar(avatarName: string, userName: string): BaseAvatar {
        _log('createAvatar', avatarName, userName);

        switch (avatarName) {
            case 'dina':
                return new DinaAvatar(userName);
            case 'toku-hoa':
                return new TokuHoaAvatar(userName);
            default:
                throw new Error(`Avatar ${avatarName} not implemented`);
        }
    }
}
