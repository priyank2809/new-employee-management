import { Component, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {

  employeeService = inject(EmployeeService);
  router = inject(Router);
  ngZone = inject(NgZone);

  deletedEmployee: Employee | null = null;
  toastTimeout: any = null;

  constructor() {
    this.employeeService.loadEmployees();
  }

  addEmployee() {
    if (window.scrollY > 100) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.router.navigate(['/add-employee']);
      }, 300);
    } else {
      this.router.navigate(['/add-employee']);
    }
  }

  editEmployee(id: string) {
    this.router.navigate(['/edit-employee', id]);
  }

  async deleteEmployee(employee: Employee) {
    this.deletedEmployee = { ...employee };

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    try {
      await this.employeeService.deleteEmployee(employee.id);

      this.toastTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          this.deletedEmployee = null;
        });
      }, 5000);
    } catch (error) {
      console.error('Error deleting employee:', error);
      this.deletedEmployee = null;
    }
  }

  async undoDelete() {
    if (this.deletedEmployee) {
      try {
        const restoredEmployee = {
          ...this.deletedEmployee,
          isActive: true,
          endDate: null
        };

        await this.employeeService.updateEmployee(restoredEmployee);

        this.deletedEmployee = null;
        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
          this.toastTimeout = null;
        }
      } catch (error) {
        console.error('Error undoing employee:', error);
      }
    }
  }

  async permanentlyDeleteEmployee(employee: Employee) {
    try {
      await this.employeeService.permanentlyDeleteEmployee(employee.id);
    } catch (error) {
      console.error('Error permanently deleting employee:', error);
    }
  }

}
