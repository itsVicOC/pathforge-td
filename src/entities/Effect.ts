export interface ParticleOptions {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  gravity?: number;
  fade?: boolean;
}

export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public color: string;
  public size: number;
  public gravity: number;
  public fade: boolean;
  public active = true;

  constructor(options: ParticleOptions) {
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.life = options.life;
    this.maxLife = options.life;
    this.color = options.color;
    this.size = options.size;
    this.gravity = options.gravity ?? 0;
    this.fade = options.fade ?? true;
  }

  public update(dt: number): void {
    if (!this.active) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }
}

export class HitEffect {
  public x: number;
  public y: number;
  public life: number;
  public maxLife: number;
  public color: string;
  public active = true;

  constructor(x: number, y: number, color = '#fff') {
    this.x = x;
    this.y = y;
    this.life = 0.15;
    this.maxLife = 0.15;
    this.color = color;
  }

  public update(dt: number): void {
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }
}

export class BeamEffect {
  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;
  public life: number;
  public maxLife: number;
  public color: string;
  public active = true;

  constructor(x1: number, y1: number, x2: number, y2: number, color: string) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.life = 0.08;
    this.maxLife = 0.08;
    this.color = color;
  }

  public update(dt: number): void {
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }
}
