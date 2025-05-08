import { allFacilityInfo } from './facilityService';
import { Auth } from '../auth/auth';
import { YYYYMMDD } from '../../common/types/common.interface';

export interface FacilityRepository {
    getAllFacilityInfo(token: string, date: YYYYMMDD): Promise<allFacilityInfo>;
}