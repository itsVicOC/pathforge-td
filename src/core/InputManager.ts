import type { Vec2 } from '../types';
import { eventBus } from './EventBus';

export class InputManager {
  private canvas: HTMLCanvasElement;
  private scale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.updateScale();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);
  }

  private onPointerDown = (e: PointerEvent): void => {
    const gridPos = this.getGridPosition(e);
    const pixelPos = this.getPixelPosition(e);
    eventBus.emit('input:click', { ...gridPos, pixelX: pixelPos.x, pixelY: pixelPos.y, button: e.button });
  };

  private onPointerMove = (e: PointerEvent): void => {
    const pos = this.getGridPosition(e);
    eventBus.emit('input:hover', pos);
  };

  private onPointerUp = (e: PointerEvent): void => {
    const pos = this.getGridPosition(e);
    eventBus.emit('input:release', pos);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === ' ') {
      e.preventDefault();
    }
    eventBus.emit('input:key', { key: e.key });
  };

  private getGridPosition(e: PointerEvent): Vec2 {
    const pixel = this.getPixelPosition(e);
    return {
      x: Math.floor(pixel.x / 32),
      y: Math.floor(pixel.y / 32),
    };
  }

  private getPixelPosition(e: PointerEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.scale,
      y: (e.clientY - rect.top) / this.scale,
    };
  }

  private onResize = (): void => {
    this.updateScale();
  };

  private updateScale(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.scale = rect.width / this.canvas.width;
  }
}
