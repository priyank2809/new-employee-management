import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Employee } from '../models/employee.model';

interface EmployeeDB extends DBSchema {
    employees: {
        key: string;
        value: Employee;
        indexes: { 'by-name': string; 'by-isActive': number };
    };
}

@Injectable({
    providedIn: 'root'
})
export class DbService {
    private dbPromise: Promise<IDBPDatabase<EmployeeDB>>;

    constructor() {
        this.dbPromise = openDB<EmployeeDB>('employee-management-db', 1, {
            upgrade(db) {
                const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
                employeeStore.createIndex('by-name', 'name');
                employeeStore.createIndex('by-isActive', 'isActive');
            }
        });
    }

    async getAllEmployees(): Promise<Employee[]> {
        const db = await this.dbPromise;
        return db.getAll('employees');
    }

    async getActiveEmployees(): Promise<Employee[]> {
        const db = await this.dbPromise;
        const tx = db.transaction('employees', 'readonly');
        const index = tx.store.index('by-isActive');
        // return index.getAll(IDBKeyRange.only(true));
        return index.getAll(1);
    }

    async getPreviousEmployees(): Promise<Employee[]> {
        const db = await this.dbPromise;
        const tx = db.transaction('employees', 'readonly');
        const index = tx.store.index('by-isActive');
        // return index.getAll(IDBKeyRange.only(false));
        return index.getAll(0);
    }

    async getEmployee(id: string): Promise<Employee | undefined> {
        const db = await this.dbPromise;
        return db.get('employees', id);
    }

    async addEmployee(employee: Employee): Promise<string> {
        const db = await this.dbPromise;
        employee.isActive = employee.isActive ? 1 : 0;
        await db.put('employees', employee);
        return employee.id;
    }

    async deleteEmployee(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('employees', id);
    }

    async updateEmployee(employee: Employee): Promise<string> {
        const db = await this.dbPromise;
        employee.isActive = employee.isActive ? 1 : 0;
        await db.put('employees', employee);
        return employee.id;
    }
}