import { _decorator, Component, director, log, Node, screen } from "cc";
const { ccclass, property } = _decorator;
import { sys } from "cc";
import { PlayableAdsManager } from "../PlayableAdsManager";
import { ACTION_NAME, ACTION_TYPE, OBJECT, OPERATING_SYSTEM, RESULT, USER_RETURN } from "./Tracker/Output/DefineEventStruct";

@ccclass("TrackingManager")
export class TrackingManager extends Component {
    private static userPseudoId: string = "";

    private static apiSecret: string = "ymcwxS12SSi6IavS3-Jj-Q";
    private static firebaseAppId: string = "1:444377725360:android:b0bef9148a16a69aa27e75";
    private static packageName: string = "com.ig.goods.jam";
    private static os: OPERATING_SYSTEM = OPERATING_SYSTEM.NONE;
    private static gpu: string = "webgl";

    private static returnGame: USER_RETURN = USER_RETURN._false;
    private static currentScreen: string = "_level_1";

    protected onLoad(): void {
        TrackingManager.userPseudoId = this.generateUniqueString();
        TrackingManager.setOS();
        TrackingManager.setGPU();
    }

    private static setOS(): void {
        switch (sys.os) {
            case sys.OS.ANDROID:
                this.os = OPERATING_SYSTEM.ANDROID;
                break;
            case sys.OS.IOS:
                this.os = OPERATING_SYSTEM.IOS;
                break;
            case sys.OS.WINDOWS:
                this.os = OPERATING_SYSTEM.NONE;
                break;
        }
    }

    private static setGPU(): void {
        const sceneData: any = director.root.pipeline.pipelineSceneData;
        this.gpu = sceneData._device._renderer;
    }

    //#region LISTEN EVENT
    public static gameStart(): void {
        this.logEvent(ACTION_NAME._start, ACTION_TYPE._start);
    }

    public static firstClick(): void {
        this.logEvent(ACTION_NAME._first_click, ACTION_TYPE._action);
    }

    public static click(): void {
        this.logEvent(ACTION_NAME._click, ACTION_TYPE._action);
    }

    public static userEngagement(time: number): void {
        const fps: number = director.root.fps;
        this.logEventTime(
            time.toFixed(2).toString(),
            fps.toString()
        );
    }

    public static winLevel(): void {
        this.logEventResult(RESULT._win);
        this.currentScreen = "_Win_Screen";
        this.logEventShowScreen();
    }

    public static loseLevel(): void {
        this.logEventResult(RESULT._lose);
        this.currentScreen = "_Lose_Screen";
        this.logEventShowScreen();
    }

    public static clickConversion(): void {
        this.logEventButton("_click");
        this.returnGame = USER_RETURN._true;
    }

    public static forceConversion(): void {
        TrackingManager.logEventButton("_force");
        this.returnGame = USER_RETURN._true;
    }
    //#endregion

    //#region LOG EVENT
    private generateUniqueString(): string {
        const characters: string = "abcdef0123456789";
        let randomStr: string = "";
        const charactersLength: number = characters.length;
        const currentTime: number = new Date().getTime();
        const timeString: string = currentTime.toString(16);
        const timeStringLength: number = timeString.length;
        for (let i = 0; i < 32 - timeStringLength; i++) {
            randomStr += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return timeString + randomStr;
    }

    private static logEvent(
        actionName: ACTION_NAME,
        actionType: ACTION_TYPE,
        object: OBJECT = OBJECT.level_status
    ): void {
        const jsonInput = {
            app_instance_id: this.userPseudoId,
            events: [{
                name: "playable_level",
                params: {
                    "action_type": ACTION_TYPE[actionType],
                    "action_name": ACTION_NAME[actionName],
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance.playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.packageName,
                    "gpu": this.gpu,
                },
            }]
        }
        this.postEvent(jsonInput);
    }

    private static logEventClick(
        actionType: ACTION_TYPE = ACTION_TYPE._action,
        actionName: ACTION_NAME = ACTION_NAME._click,
        object: OBJECT = OBJECT.level_status
    ): void {
        const jsonInput = {
            app_instance_id: this.userPseudoId,
            events: [{
                name: "playable_level",
                params: {
                    "action_type": ACTION_TYPE[actionType],
                    "action_name": ACTION_NAME[actionName], 
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance.playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.packageName,
                    "gpu": this.gpu,
                },
            }]
        }
        this.postEvent(jsonInput);
    }

    private static logEventShowScreen(
        actionType: ACTION_TYPE = ACTION_TYPE._action,
        actionName: ACTION_NAME = ACTION_NAME._show_screen,
        object: OBJECT = OBJECT.conversion
    ): void {
        const jsonInput = {
            app_instance_id: this.userPseudoId,
            events: [{
                name: "playable_level",
                params: {
                    "action_type": ACTION_TYPE[actionType],
                    "action_name": ACTION_NAME[actionName],
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance.playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.packageName,
                    "gpu": this.gpu,
                },
            }]
        }
        this.postEvent(jsonInput);
    }

    private static logEventResult(
        result: RESULT,
        actionType: ACTION_TYPE = ACTION_TYPE._end,
        actionName: ACTION_NAME = ACTION_NAME._finish,
        object: OBJECT = OBJECT.level_status
    ): void {
        const jsonInput = {
            app_instance_id: this.userPseudoId,
            events: [{
                name: "playable_level",
                params: {
                    "action_type": ACTION_TYPE[actionType],
                    "action_name": ACTION_NAME[actionName],
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "result": RESULT[result],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance.playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.packageName,
                    "gpu": this.gpu,
                },
            }]
        }
        this.postEvent(jsonInput);
    }

    private static logEventButton(
        buttonName: string,
        actionType: ACTION_TYPE = ACTION_TYPE._action,
        actionName: ACTION_NAME = ACTION_NAME._click_conversion,
        object: OBJECT = OBJECT.conversion
    ): void {
        const jsonInput = {
            app_instance_id: this.userPseudoId,
            events: [{
                name: "playable_level",
                params: {
                    "action_type": ACTION_TYPE[actionType],
                    "action_name": ACTION_NAME[actionName],
                    "user_return": USER_RETURN[this.returnGame],
                    "screen": this.currentScreen,
                    "button_name": buttonName,
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance.playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.packageName,
                    "gpu": this.gpu,
                },
            }]
        }
        this.postEvent(jsonInput);
    }

    private static logEventTime(
        engagementTime: string,
        fps: string,
        actionType: ACTION_TYPE = ACTION_TYPE._action,
        actionName: ACTION_NAME = ACTION_NAME._users_engagement,
        object: OBJECT = OBJECT.users_engagement
    ): void {
        const jsonInput = {
            app_instance_id: this.userPseudoId,
            events: [{
                name: "playable_level",
                params: {
                    "action_type": ACTION_TYPE[actionType],
                    "action_name": ACTION_NAME[actionName],
                    "engagement_time": engagementTime,
                    "fps": fps,
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance.playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.packageName,
                    "gpu": this.gpu,
                },
            }]
        }
        this.postEvent(jsonInput);
    }

    private static postEvent(jsonInput: any): void {
        log(jsonInput);
        if(sys.os == sys.OS.WINDOWS || !PlayableAdsManager.Instance.activeTracking) return;
        fetch(`https://www.google-analytics.com/mp/collect?firebase_app_id=${this.firebaseAppId}&api_secret=${this.apiSecret}`, {
            method: "POST",
            body: JSON.stringify(jsonInput)
        }).then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
    }
    //#endregion
}
