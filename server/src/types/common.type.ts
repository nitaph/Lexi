export enum AgentConfig {
    SINGLE = 1,
    AB = 2,
    MULTI = 3,
}

export const AgentsMode = {
    SINGLE: 'Single',
    AB: 'A/B',
    MULTI: 'Multi',
} as const;
