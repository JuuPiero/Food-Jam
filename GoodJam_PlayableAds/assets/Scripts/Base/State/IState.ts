export interface IEnterState {
    enterState(): void;
}

export interface IUpdateState {
    updateState(dt: number): void;
}

export interface IExitState {
    exitState(): void;
}