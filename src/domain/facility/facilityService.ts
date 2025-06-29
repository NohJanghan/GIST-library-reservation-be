import * as domain from './facility';
import { FacilityRepository } from './facilityRepository.interface'
import { Auth } from '../auth/auth';
import { YYYYMMDD } from '../../common/types/common.interface';

export class FacilityService {
    constructor(
        private facilityRepository: FacilityRepository
    ){}

    async getAllInfo(token: string, date: YYYYMMDD): Promise<allFacilityInfo> {
        const infos = await this.facilityRepository.getAllFacilityInfo(token, date);
        return infos;
    }
}

export interface allFacilityInfo {
    facilityGroup: domain.FacilityGroup[];
    commonFacilityInfo: domain.CommonFacilityInfo;
}