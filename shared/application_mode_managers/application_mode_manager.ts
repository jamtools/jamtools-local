export interface ApplicationModeManager<T> {
    getState(): T;
    close(): void;
}
