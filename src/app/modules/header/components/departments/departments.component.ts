import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { departments } from '../../../../../data/header-departments';
import { DepartmentsService } from '../../../../shared/services/departments.service';
import { NavigationLink } from '../../../../shared/interfaces/navigation-link';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-header-departments',
    templateUrl: './departments.component.html',
    styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit, OnDestroy {
    private destroy$: Subject<any> = new Subject();

    items: NavigationLink[] = departments;
    hoveredItem: NavigationLink = null;

    isOpen = false;
    fixed = false;

    private get element(): HTMLElement {
        return this.el.nativeElement;
    }

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private renderer: Renderer2,
        private el: ElementRef,
        private service: DepartmentsService
    ) { }

    ngOnInit(): void {
        const root = this.element.querySelector('.departments') as HTMLElement;
        const content = this.element.querySelector('.departments__links-wrapper') as HTMLElement;

        this.service.areaElement$.pipe(takeUntil(this.destroy$)).subscribe(areaElement => {
            if (areaElement) {
                this.fixed = true;
                this.isOpen = true;

                if (isPlatformBrowser(this.platformId)) {
                    setTimeout(() => {
                        const areaRect = areaElement.getBoundingClientRect();
                        const areaBottom = areaRect.top + areaRect.height + window.scrollY;

                        root.classList.remove('departments--transition');
                        root.classList.add('departments--fixed', 'departments--opened');

                        const height = areaBottom - (content.getBoundingClientRect().top + window.scrollY);

                        content.style.height = `${height}px`;
                        content.getBoundingClientRect(); // force reflow
                    }, 0);
                } else {
                    this.renderer.addClass(root, 'departments--fixed');
                    this.renderer.addClass(root, 'departments--opened');
                }
            } else {
                this.fixed = false;
                this.isOpen = false;

                if (isPlatformBrowser(this.platformId)) {
                    root.classList.remove('departments--opened', 'departments--fixed');
                    content.style.height = '';
                } else {
                    this.renderer.removeClass(root, 'departments--fixed');
                    this.renderer.removeClass(root, 'departments--opened');
                }
            }
        });

        if (isPlatformBrowser(this.platformId)) {
            fromEvent<MouseEvent>(document, 'mousedown').pipe(
                takeUntil(this.destroy$)
            ).subscribe((event) => {
                if (event.target instanceof HTMLElement && !this.element.contains(event.target)) {
                    this.close();
                }
            });

            fromEvent<TransitionEvent>(content, 'transitionend').pipe(
                takeUntil(this.destroy$)
            ).subscribe((event) => {
                if (event.propertyName === 'height') {
                    root.classList.remove('departments--transition');
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open(): void {
        this.isOpen = true;

        const root = this.element.querySelector('.departments') as HTMLElement;
        const content = root.querySelector('.departments__links-wrapper') as HTMLElement;
        const startHeight = content.getBoundingClientRect().height;

        root.classList.add('departments--transition', 'departments--opened');

        const endHeight = content.getBoundingClientRect().height;

        content.style.height = startHeight + 'px';
        content.getBoundingClientRect(); // force reflow
        content.style.height = endHeight + 'px';
    }

    close(): void {
        if (this.fixed || !this.isOpen) {
            return;
        }

        this.isOpen = false;

        const root = this.element.querySelector('.departments') as HTMLElement;
        const content = root.querySelector('.departments__links-wrapper') as HTMLElement;
        const startHeight = content.getBoundingClientRect().height;

        content.style.height = startHeight + 'px';

        root.classList.add('departments--transition');
        root.classList.remove('departments--opened');

        content.getBoundingClientRect(); // force reflow
        content.style.height = '';
    }

    onItemMouseEnter(item: NavigationLink): void {
        this.hoveredItem = item;
    }

    onItemMouseLeave(item: NavigationLink): void {
        if (this.hoveredItem === item) {
            this.hoveredItem = null;
        }
    }

    onItemClick(): void {
        this.close();
    }

    onSubItemClick(): void {
        this.close();
        this.hoveredItem = null;
    }
}
