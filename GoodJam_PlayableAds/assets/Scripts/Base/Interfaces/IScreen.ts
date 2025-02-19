export interface ISrceenWithEffect {
    showWithEffect(): Promise<void>;
    hideWithEffect(): Promise<void>;
}

export interface IScreenWithoutEffect {
    show(): Promise<void>;
    hide(): Promise<void>;
}