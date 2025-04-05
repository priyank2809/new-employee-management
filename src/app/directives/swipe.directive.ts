import { Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2 } from '@angular/core';

@Directive({
    selector: '[swipeLeft]'
})
export class SwipeDirective {
    @Output() swipeLeft = new EventEmitter<void>();

    private startX: number = 0;
    private threshold: number = 100;
    private deleteIndicator: HTMLElement | null = null;
    private employeeInfo: HTMLElement | null = null;
    private isSwiping: boolean = false;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        setTimeout(() => {
            this.deleteIndicator = this.el.nativeElement.querySelector('.delete-indicator');
            this.employeeInfo = this.el.nativeElement.querySelector('.employee-info');
        }, 0);
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.startX = event.touches[0].clientX;
        this.isSwiping = true;

        this.renderer.addClass(this.el.nativeElement, 'swiping');

        if (this.deleteIndicator) {
            this.renderer.setStyle(this.deleteIndicator, 'transform', 'translateX(100%)');
        }

        if (this.employeeInfo) {
            this.renderer.setStyle(this.employeeInfo, 'transform', 'translateX(0)');
        }
    }

    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent) {
        if (!this.deleteIndicator || !this.employeeInfo || !this.isSwiping) return;

        const currentX = event.touches[0].clientX;
        const diffX = this.startX - currentX;

        if (diffX > 0) {
            event.preventDefault();
            event.stopPropagation();

            const translateX = Math.min(80, diffX);
            const deleteTranslateX = Math.max(0, 100 - (diffX * 1.25));

            this.renderer.setStyle(this.employeeInfo, 'transform', `translateX(-${translateX}px)`);

            this.renderer.setStyle(this.deleteIndicator, 'transform', `translateX(${deleteTranslateX}%)`);
        }
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(event: TouchEvent) {
        if (!this.deleteIndicator || !this.employeeInfo || !this.isSwiping) return;

        const endX = event.changedTouches[0].clientX;
        const distance = this.startX - endX;

        if (distance > this.threshold) {
            this.renderer.setStyle(this.deleteIndicator, 'transform', 'translateX(0)');
            this.renderer.setStyle(this.employeeInfo, 'transform', 'translateX(-80px)');

            this.swipeLeft.emit();
        } else {
            this.renderer.setStyle(this.deleteIndicator, 'transform', 'translateX(100%)');
            this.renderer.setStyle(this.employeeInfo, 'transform', 'translateX(0)');
        }

        this.isSwiping = false;
        this.renderer.removeClass(this.el.nativeElement, 'swiping');
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains('delete-button') ||
            target.parentElement?.classList.contains('delete-button')) {
            this.swipeLeft.emit();
            event.stopPropagation();
        } else if (this.employeeInfo && this.deleteIndicator) {
            this.renderer.setStyle(this.deleteIndicator, 'transform', 'translateX(100%)');
            this.renderer.setStyle(this.employeeInfo, 'transform', 'translateX(0)');
        }
    }
}