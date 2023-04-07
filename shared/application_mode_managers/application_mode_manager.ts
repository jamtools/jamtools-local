export interface ApplicationModeManager<T = any> {
    getState(): T;
    close(): void;
}
