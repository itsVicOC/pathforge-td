import type { GamePhase, GameState, Vec2 } from '../types';

export class StateManager {
  private state: GameState = {
    phase: 'menu',
    lives: 20,
    wave: 0,
    totalWaves: 0,
    timeScale: 1,
    paused: false,
  };

  private listeners: Set<(state: GameState) => void> = new Set();

  public getState(): Readonly<GameState> {
    return this.state;
  }

  public setPhase(phase: GamePhase): void {
    this.state = { ...this.state, phase };
    this.notify();
  }

  public setPaused(paused: boolean): void {
    this.state = { ...this.state, paused };
    this.notify();
  }

  public togglePause(): void {
    this.setPaused(!this.state.paused);
  }

  public setTimeScale(scale: number): void {
    this.state = { ...this.state, timeScale: scale };
    this.notify();
  }

  public setLives(lives: number): void {
    this.state = { ...this.state, lives };
    this.notify();
  }

  public setWave(wave: number): void {
    this.state = { ...this.state, wave };
    this.notify();
  }

  public setTotalWaves(total: number): void {
    this.state = { ...this.state, totalWaves: total };
    this.notify();
  }

  public selectTower(id?: string): void {
    this.state = { ...this.state, selectedTowerId: id };
    this.notify();
  }

  public setHoveredCell(cell?: Vec2): void {
    this.state = { ...this.state, hoveredCell: cell };
    this.notify();
  }

  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public get isPaused(): boolean { return this.state.paused; }
  public get timeScale(): number { return this.state.timeScale; }
}
