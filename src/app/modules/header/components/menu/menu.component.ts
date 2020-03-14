import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationLink } from '../../../../shared/interfaces/navigation-link';
import { NestedLink } from '../../../../shared/interfaces/nested-link';

@Component({
    selector: 'app-header-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
    @Input() layout: 'classic'|'topbar' = 'classic';
    @Input() items: NestedLink[] = [];

    @Output() itemClick: EventEmitter<NestedLink> = new EventEmitter<NestedLink>();

    hoveredItem: NavigationLink = null;

    constructor() { }

    onItemMouseEnter(item: NavigationLink): void {
        this.hoveredItem = item;
    }

    onItemMouseLeave(item: NavigationLink): void {
        if (this.hoveredItem === item) {
            this.hoveredItem = null;
        }
    }

    onSubItemClick(item: NestedLink): void {
        this.hoveredItem = null;
        this.itemClick.emit(item);
    }
}
