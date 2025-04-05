import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  employeeId: string = '';
  showRoleDropdown = false;
  showStartDatePicker = false;
  showEndDatePicker = false;
  showTodayAsDate: boolean = false;

  roles = [
    'Product Designer',
    'Flutter Developer',
    'QA Tester',
    'Product Owner'
  ];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
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

  async ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.employeeId) {
      const employee = await this.employeeService.getEmployee(this.employeeId);
      if (employee) {
        this.employeeForm.patchValue({
          name: employee.name,
          role: employee.role,
          startDate: new Date(employee.startDate),
          endDate: employee.endDate ? new Date(employee.endDate) : null
        });
      }
    }
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

      const employee: Employee = {
        id: this.employeeId,
        name: formValue.name,
        role: formValue.role,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        isActive: !formValue.endDate
      };

      await this.employeeService.updateEmployee(employee);
      this.router.navigate(['/employees']);
    }
  }

  async deleteEmployee() {
    await this.employeeService.deleteEmployee(this.employeeId);
    this.router.navigate(['/employees']);
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
