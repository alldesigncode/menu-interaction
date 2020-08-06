import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Animator } from '../helpers/animator';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('menuExpand', [
      state(
        'expanded',
        style({
          width: '100%',
        })
      ),
      state(
        'default',
        style({
          width: '15%',
        })
      ),
      transition(
        'expanded <=> default',
        animate('0.6s cubic-bezier(0.83, 0, 0.17, 1)')
      ),
    ]),
  ],
})
export class MenuComponent implements OnChanges, AfterViewInit {
  @ViewChild('elements', { static: true }) elements: ElementRef<HTMLDivElement>;
  @ViewChild('menuBase', { static: true }) menuBase: ElementRef<HTMLDivElement>;
  @ViewChild('menu', { static: true }) menu: ElementRef<HTMLDivElement>;

  expandState: ExpandState = 'default';
  menuExpansionDone = false;
  buttonDisabled = false;
  animator = new Animator();

  @Input() menuData: MenuData[];
  @Input() menuStyle?: MenuStyle = 'default';
  @Input()
  set menuColors({ color, menuColor }) {
    this.changeMenuColors({ color, menuColor });
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.changeMenuStyle();
  }

  ngAfterViewInit(): void {
    this.elementsAnimationHandler(
      null,
      this.elements.nativeElement,
      this.animator.timeline,
      {
        hideElements: true,
      }
    );
  }

  private changeMenuColors({ color, menuColor }): void {
    this.menuBase.nativeElement.style.setProperty('--color-main', color);
    this.menuBase.nativeElement.style.setProperty('--color-light', menuColor);
  }

  private changeMenuStyle(): void {
    if (this.menuStyle === 'solid') {
      this.menu.nativeElement.style.backgroundColor = this.baseColors.color;
      this.cdr.detectChanges();
      if (this.elements && this.elements.nativeElement) {
        this.elements.nativeElement.childNodes.forEach(
          (node: HTMLAnchorElement) =>
            node &&
            node.style &&
            (node.style.backgroundColor = this.baseColors.menuColor)
        );
      }
    }
  }

  private get baseColors(): { color: string; menuColor: string } {
    const colorMainVariable = this.animator.tween.getProperty(this.menuBase.nativeElement,'--color-main');
    const colorMainVariableLight = this.animator.tween.getProperty(this.menuBase.nativeElement, '--color-light');

    return {
      color: typeof colorMainVariable === 'string' && colorMainVariable,
      menuColor: typeof colorMainVariableLight === 'string' && colorMainVariableLight,
    };
  }

  public expand(): void {
    this.buttonDisabled = true;
    this.expandState === 'default'
      ? (this.expandState = 'expanded')
      : (this.expandState = 'default');

    if (this.expandState === 'default') {
      this.menuExpansionDone = false;
      this.elementsAnimationHandler(
        this.onComplete,
        this.elements.nativeElement,
        this.animator.timeline,
        {
          hideElements: true,
        }
      );
    }
  }

  public expansionDone({ toState }: { toState: ExpandState }): void {
    if (toState === 'expanded') {
      this.menuExpansionDone = true;
      this.elementsAnimationHandler(
        this.onComplete,
        this.elements.nativeElement,
        this.animator.timeline,
        { hideElements: false }
      );
    }
  }

  private onComplete = (): void => {
    this.buttonDisabled = false;
    this.cdr.detectChanges();
  };

  /**
   * @param callbackFn callback function fired after transition completes
   * @param element element to animate
   * @param timeline gsap timeline sequencing property used for chaining tweens
   * @param hideElements - whether hiding elements or not
   */
  private elementsAnimationHandler(
    callbackFn: () => void,
    element: HTMLElement,
    timeline: gsap.core.Timeline,
    { hideElements }: { hideElements: boolean }
  ) {
    if (hideElements) {
      timeline
        .to(element, {
          duration: 0.1,
          autoAlpha: 0,
        })
        .to(element.children, {
          opacity: 0,
          y: -5,
          onComplete: callbackFn,
        });
    } else {
      timeline
        .to(element, {
          duration: 0.1,
          autoAlpha: 1,
        })
        .to(element.children, {
          duration: 0.15,
          opacity: 1,
          y: 0,
          stagger: 0.09,
          onComplete: callbackFn,
        });
    }
  }
}

type ExpandState = 'expanded' | 'default';
export type MenuStyle = 'solid' | 'default';

export interface MenuData {
  name: string;
  url?: string;
}
