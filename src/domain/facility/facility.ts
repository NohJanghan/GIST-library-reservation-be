// 특정 날짜의 시설정보 (날짜는 포함 X)
export class FacilityInfo {
    constructor(
        public id: number, // same with room number
        public GroupId: number,
        public reservationByOthers: number[], // 다른 사람의 예약 시간
        public reservationByMe: number[], // 나의 예약 시간
    ) {}
}

// 시설 그룹 정보
export class FacilityGroup {
    constructor(
        public id: number,
        public name: string,
        public floor: number,
        public facilities: FacilityInfo[],
        public fromTime: number, // 예약 시작 시간
        public toTime: number, // 예약 종료 시간
    ) {}
}

// 공통 시설 정보
export interface CommonFacilityInfo {
    notAvailableDays: any[]; // 도서관 휴관일 unknown
    reservationCountInDay: number; // 일별 예약 횟수
    reservationCountInMonth: number; // 월별 예약 횟수
    reservationLimitInDay: number; // 일별 예약 가능 횟수
    reservationLimitInMonth: number; // 월별 예약 가능 횟수
}