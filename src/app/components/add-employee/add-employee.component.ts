import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent {

  employeeForm: FormGroup;
  showRoleDropdown = false;
  showStartDatePicker = false;
  showEndDatePicker = false;

  roles = [
    'Product Designer',
    'Flutter Developer',
    'QA Tester',
    'Product Owner'
  ];

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  constructor() {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null]
    });
  }

  toggleRoleDropdown() {
    this.showRoleDropdown = !this.showRoleDropdown;
  }

  selectRole(role: string) {
    this.employeeForm.get('role')?.setValue(role);
    this.showRoleDropdown = false;
  }

  toggleStartDatePicker() {
    this.showStartDatePicker = !this.showStartDatePicker;

    if (this.showStartDatePicker) {
      const date = this.employeeForm.get('startDate')?.value;
      if (date && this.isToday(date)) {
        this.showTodayAsDate = false;
      }
    }
  }

  isToday(date: Date): boolean {
    if (!date) return false;
    
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  toggleEndDatePicker() {
    this.showEndDatePicker = !this.showEndDatePicker;
  }

  selectStartDate(date: Date) {
    this.employeeForm.get('startDate')?.setValue(date);
    this.showStartDatePicker = false;

    if ((window as any).datePickerShowTodayAsDate !== undefined) {
      this.showTodayAsDate = (window as any).datePickerShowTodayAsDate;
      delete (window as any).datePickerShowTodayAsDate;
    }
  }

  showTodayAsDate: boolean = false;

  selectEndDate(date: Date | null) {
    this.employeeForm.get('endDate')?.setValue(date);
    this.showEndDatePicker = false;
  }

  clearEndDate() {
    this.employeeForm.get('endDate')?.setValue(null);
    this.showEndDatePicker = false;
  }

  async onSubmit() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      const endDate = formValue.endDate;

      const employee: Employee = {
        id: '',
        name: formValue.name,
        role: formValue.role,
        startDate: formValue.startDate,
        endDate: endDate,
        isActive: !endDate
      };

      await this.employeeService.addEmployee(employee);
      this.router.navigate(['/employees']);
    }
  }

  cancel() {
    this.router.navigate(['/employees']);
  }

  getStartDateDisplayText() {
    const date = this.employeeForm.get('startDate')?.value;

    if (!date) {
      return 'Today';
    }

    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      if (!this.showTodayAsDate) {
        return 'Today';
      }
    }

    return date ? this.formatDate(date) : 'Today';
  }

  getEndDateDisplayText() {
    const date = this.employeeForm.get('endDate')?.value;
    return date ? this.formatDate(date) : 'No date';
  }

  private formatDate(date: Date): string {
    return `${date.getDate()} ${this.getMonthName(date.getMonth())}, ${date.getFullYear()}`;
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  }

}
