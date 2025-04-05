import { Component, EventEmitter, Input, Output, OnInit, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  @Input() selectedDate: Date | null = null;
  @Input() showNone: boolean = false;

  @Output() dateSelected = new EventEmitter<Date>();
  @Output() noneSelected = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  calendarMonth: Date = new Date();
  calendarDays: Array<{ date: Date | null, isCurrentMonth: boolean, isToday: boolean, isSelected: boolean }> = [];

  tempSelectedDate: Date | null = null;
  showTodayLabel: boolean = false;
  quickOptionSelected: string | null = null;
  showTodayAsDate: boolean = false;

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  today = new Date();

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.tempSelectedDate = this.selectedDate;

    if (this.showNone) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'data-is-end-date', 'true');
    }

    this.checkIfToday();
    // this.determineInitialQuickOption();
    // this.showTodayAsDate = false;

    if (this.showNone) {
      this.quickOptionSelected = 'none';
      this.tempSelectedDate = null;
    } else {
      this.determineInitialQuickOption();
    }

    if (this.tempSelectedDate && this.isToday(this.tempSelectedDate)) {
      this.showTodayAsDate = false;
    } else {
      this.showTodayAsDate = true;
    }

    if (this.selectedDate) {
      this.calendarMonth = new Date(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth(),
        1
      );
    } else {
      this.calendarMonth = new Date(
        this.today.getFullYear(),
        this.today.getMonth(),
        1
      );
    }
    this.generateCalendarDays();
  }

  determineInitialQuickOption() {
    if (!this.tempSelectedDate) {
      return;
    }

    const today = new Date();

    if (this.isToday(this.tempSelectedDate)) {
      this.quickOptionSelected = 'today';
      return;
    }

    const nextMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilMonday = (dayOfWeek === 0 ? 1 : 8 - dayOfWeek);
    nextMonday.setDate(today.getDate() + daysUntilMonday);

    if (this.isSameDate(this.tempSelectedDate, nextMonday)) {
      this.quickOptionSelected = 'nextMonday';
      return;
    }

    const nextTuesday = new Date(today);
    const daysUntilTuesday = (dayOfWeek === 0 ? 2 : dayOfWeek === 1 ? 1 : 9 - dayOfWeek);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);

    if (this.isSameDate(this.tempSelectedDate, nextTuesday)) {
      this.quickOptionSelected = 'nextTuesday';
      return;
    }

    const afterOneWeek = new Date(today);
    afterOneWeek.setDate(today.getDate() + 7);

    if (this.isSameDate(this.tempSelectedDate, afterOneWeek)) {
      this.quickOptionSelected = 'afterOneWeek';
      return;
    }

    this.quickOptionSelected = null;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  generateCalendarDays() {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysFromPrevMonth = firstDay.getDay();
    const totalDays = 42;

    this.calendarDays = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDay = prevMonth.getDate();

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isSelected: this.isSelectedTempDate(date)
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isSelected: this.isSelectedTempDate(date)
      });
    }

    const remaining = totalDays - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isSelected: this.isSelectedTempDate(date)
      });
    }
  }

  previousMonth() {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(),
      this.calendarMonth.getMonth() - 1,
      1
    );
    this.generateCalendarDays();
  }

  nextMonth() {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(),
      this.calendarMonth.getMonth() + 1,
      1
    );
    this.generateCalendarDays();
  }

  selectTempDate(date: Date) {
    this.tempSelectedDate = date;
    this.showTodayLabel = this.isToday(date);

    if (this.isToday(date) && this.quickOptionSelected !== 'today') {
      this.showTodayAsDate = true;
    }

    this.calendarMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    if (!this.isSameDate(date, this.today)) {
      this.determineInitialQuickOption();
    }

    this.generateCalendarDays();
  }

  saveSelectedDate() {
    if (this.quickOptionSelected === 'none') {
      this.noneSelected.emit();
      return;
    }

    if (this.quickOptionSelected === 'today' ||
      (this.tempSelectedDate && this.isToday(this.tempSelectedDate))) {
      this.showTodayAsDate = true;
      (window as any).datePickerShowTodayAsDate = true;
    }

    if (this.tempSelectedDate) {
      this.dateSelected.emit(this.tempSelectedDate);
    } else {
      const today = new Date();
      (window as any).datePickerShowTodayAsDate = true;
      this.dateSelected.emit(today);
    }
  }

  selectNone() {
    this.tempSelectedDate = null;
    this.showTodayLabel = false;
    this.quickOptionSelected = 'none';
  }

  cancel() {
    this.cancelled.emit();
  }

  isToday(date: Date): boolean {
    return (
      date.getDate() === this.today.getDate() &&
      date.getMonth() === this.today.getMonth() &&
      date.getFullYear() === this.today.getFullYear()
    );
  }

  checkIfToday() {
    if (this.selectedDate) {
      this.showTodayLabel = this.isToday(this.selectedDate);
    }
  }

  isSelectedTempDate(date: Date): boolean {
    if (!this.tempSelectedDate) return false;

    return (
      date.getDate() === this.tempSelectedDate.getDate() &&
      date.getMonth() === this.tempSelectedDate.getMonth() &&
      date.getFullYear() === this.tempSelectedDate.getFullYear()
    );
  }

  selectToday() {
    const today = new Date();
    this.selectTempDate(today);
    this.showTodayLabel = true;
    this.showTodayAsDate = true;
    this.quickOptionSelected = 'today';
  }

  selectNextMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = (dayOfWeek === 0 ? 1 : 8 - dayOfWeek);

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);

    this.selectTempDate(nextMonday);
    this.showTodayLabel = false;
    this.quickOptionSelected = 'nextMonday';
  }

  selectNextTuesday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilTuesday = (dayOfWeek === 0 ? 2 : dayOfWeek === 1 ? 1 : 9 - dayOfWeek);

    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);

    this.selectTempDate(nextTuesday);
    this.showTodayLabel = false;
    this.quickOptionSelected = 'nextTuesday';
  }

  selectAfterOneWeek() {
    const today = new Date();
    const afterOneWeek = new Date(today);
    afterOneWeek.setDate(today.getDate() + 7);

    this.selectTempDate(afterOneWeek);
    this.showTodayLabel = false;
    this.quickOptionSelected = 'afterOneWeek';
  }

  getSaveLabel() {
    if (!this.tempSelectedDate) {
      return 'No date';
    }

    if (this.showTodayLabel && this.isToday(this.tempSelectedDate) && !this.showTodayAsDate) {
      return 'Today';
    }

    return this.tempSelectedDate ? this.formatDateShort(this.tempSelectedDate) : 'Today';
  }

  private formatDateShort(date: Date): string {
    const day = date.getDate();
    const monthShort = this.getShortMonthName(date.getMonth());
    const year = date.getFullYear();
    
    return `${day} ${monthShort} ${year}`;
  }
  
  private getShortMonthName(monthIndex: number): string {
    const shortMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return shortMonths[monthIndex];
  }

}
