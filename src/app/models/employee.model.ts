export interface Employee {
    id: string;
    name: string;
    role: string;
    startDate: Date;
    endDate?: Date | null;
    isActive: boolean | number;
}