import { Component } from '@angular/core';
import { MenuData } from './menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  menuData: MenuData[] = [
    { name: '1', url: '/route1' },
    { name: '2' },
    { name: '3' },
  ];
  colors = {
    color: '#6f45ff',
    menuColor: '#8d6cff',
  };
}
