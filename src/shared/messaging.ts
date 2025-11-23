export const MESSAGES = {
    START_TIMER: 'START_TIMER',
    PAUSE_TIMER: 'PAUSE_TIMER',
    RESET_TIMER: 'RESET_TIMER',
    GET_STATUS: 'GET_STATUS'
};

export interface MessagePayload {
    type: keyof typeof MESSAGES;
    payload?: any;
}
