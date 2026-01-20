import { _decorator, Component, director, Node, screen, log } from 'cc';
const {ccclass} = _decorator;

export enum EventType {
    LOADING = 'LOADING',
    LOADED = 'LOADED',
    DISPLAYED = 'DISPLAYED',
    CHALLENGE_STARTED = 'CHALLENGE_STARTED',
    CHALLENGE_FAILED = 'CHALLENGE_FAILED',
    CHALLENGE_RETRY = 'CHALLENGE_RETRY',
    CHALLENGE_PASS_25 = 'CHALLENGE_PASS_25',
    CHALLENGE_PASS_50 = 'CHALLENGE_PASS_50',
    CHALLENGE_PASS_75 = 'CHALLENGE_PASS_75',
    CHALLENGE_SOLVED = 'CHALLENGE_SOLVED',
    COMPLETED = 'COMPLETED',
    CTA_CLICKED = 'CTA_CLICKED',
    ENDCARD_SHOWN = 'ENDCARD_SHOWN'
}

@ccclass('TrackingManager')
export class TrackingManager extends Component {
    static TrackEvent(nameEvent : string){
        // Log với màu sắc để dễ phân biệt - sử dụng console.log với CSS styling
        console.log(`%c[TRACKING] ${nameEvent}`, 'color: #00ff00; font-weight: bold; font-size: 12px; background: #000000; padding: 2px 6px; border-radius: 3px;');
        log(`[TRACKING] ${nameEvent}`);
        
        //@ts-ignore
        if (typeof window.ALPlayableAnalytics != 'undefined') {
            //@ts-ignore
            window.ALPlayableAnalytics.trackEvent(nameEvent);
        } else {
            console.log(`%c[TRACKING] Warning: ALPlayableAnalytics is not defined`, 'color: #ffaa00; font-weight: bold;');
            log(`[TRACKING] Warning: ALPlayableAnalytics is not defined`);
        }
    }
    //#endregion
}
