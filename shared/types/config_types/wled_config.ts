export type WledController = {
    name: string;
    ip: string;
}

export type WledConfig = {
    ctrls: WledController[];
};
