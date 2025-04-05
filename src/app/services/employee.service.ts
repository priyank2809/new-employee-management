import { Injectable, signal } from '@angular/core';
import { Employee } from '../models/employee.model';
import { DbService } from './db.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private employees = signal<Employee[]>([]);
    // currentEmployees = signal<Employee[]>([]);
    // previousEmployees = signal<Employee[]>([]);

    constructor(private dbService: DbService) {
        this.loadEmployees();
    }

    currentEmployees(): Employee[] {
        return this.employees().filter(employee => employee.isActive);
    }

    previousEmployees(): Employee[] {
        return this.employees().filter(employee => !employee.isActive);
    }

    async loadEmployees(): Promise<void> {
        try {
            const storedEmployees = localStorage.getItem('employees');
            if (storedEmployees) {
                const parsedEmployees = JSON.parse(storedEmployees);

                const employees = parsedEmployees.map((emp: any) => ({
                    ...emp,
                    startDate: emp.startDate ? new Date(emp.startDate) : null,
                    endDate: emp.endDate ? new Date(emp.endDate) : null,
                    isActive: emp.isActive
                }));

                this.employees.set(employees);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }

    async saveEmployees(): Promise<void> {
        try {
            localStorage.setItem('employees', JSON.stringify(this.employees()));
        } catch (error) {
            console.error('Error saving employees:', error);
        }
    }

    async getEmployee(id: string): Promise<Employee | null> {
        const employee = this.employees().find(emp => emp.id === id);
        return employee || null;
    }

    async addEmployee(employee: Employee): Promise<void> {
        const newEmployee = {
            ...employee,
            id: Date.now().toString(),
            isActive: true
        };

        this.employees.update(employees => [...employees, newEmployee]);
        await this.saveEmployees();
    }

    async updateEmployee(employee: Employee): Promise<void> {
        this.employees.update(employees =>
            employees.map(emp => emp.id === employee.id ? employee : emp)
        );
        await this.saveEmployees();
    }

    async deleteEmployee(id: string): Promise<void> {
        this.employees.update(employees =>
            employees.map(emp => {
                if (emp.id === id) {
                    return {
                        ...emp,
                        isActive: false,
                        endDate: new Date()
                    };
                }
                return emp;
            })
        );
        await this.saveEmployees();
    }

    async setEmployeeInactive(id: string) {
        const employee = await this.getEmployee(id);
        if (employee) {
            employee.isActive = false;
            await this.updateEmployee(employee);
        }
    }

    async permanentlyDeleteEmployee(id: string): Promise<void> {
        this.employees.update(employees => employees.filter(emp => emp.id !== id));
        await this.saveEmployees();
    }
}