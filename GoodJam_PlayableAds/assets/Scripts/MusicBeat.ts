import { _decorator, AudioSource, CCBoolean, CCInteger, Component, Enum, EventHandler, JsonAsset, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum EBeat
{
    Absotule,
    Consecutive,
    Odd,
    Event
}

class BeatTime {
    absolute_time_s: number;
    interval_consecutive_s: number;
    interval_odd_beats_s: number;
    interval_even_beats_s: number;
}

export class BeatData {
    estimated_tempo_bpm: number;
    beat_count: number;
    beats_data: BeatTime[];

    private _abs_beat: number[] = [];
    private _consecutive_beat: number[] = [];
    private _odd_beat: number[] = [];
    private _even_beat: number[] = [];

    constructor(tempo: number, count: number, beats: BeatTime[]) {
        this.estimated_tempo_bpm = tempo;
        this.beat_count = count;
        this.beats_data = beats;
    }

    public getAbsoluteBeats(): number[] {
        if (this._abs_beat.length > 0) return this._abs_beat;
        for (let beat of this.beats_data) {
            if (beat.absolute_time_s)
                this._abs_beat.push(beat.absolute_time_s);
        }
        return this._abs_beat;
    }

    public getConsecutiveBeats(): number[] {
        if (this._consecutive_beat.length > 0) return this._consecutive_beat;
        for (let beat of this.beats_data) {
            if (beat.interval_consecutive_s)
                this._consecutive_beat.push(beat.interval_consecutive_s);
        }
        return this._consecutive_beat;
    }

    public getOddBeats(): number[] {
        if (this._odd_beat.length > 0) return this._odd_beat;
        for (let beat of this.beats_data) {
            if (beat.interval_odd_beats_s)
                this._odd_beat.push(beat.interval_odd_beats_s);
        }
        return this._odd_beat;
    }

    public getEvenBeats(): number[] {
        if (this._even_beat.length > 0) return this._even_beat;
        for (let beat of this.beats_data) {
            if (beat.interval_even_beats_s)
                this._even_beat.push(beat.interval_even_beats_s);
        }
        return this._even_beat;
    }
}

@ccclass('MusicBeat')
export class MusicBeat extends   Component {
    
    @property(JsonAsset)
    beatJson: JsonAsset;

    private _beatData: BeatData;

    @property(CCInteger)
    private index: number = 0;
    // public get Index(): number
    // {
    //     return this._index
    // }

    @property(EventHandler)
    public onBeatEvent: EventHandler = new EventHandler();

    @property(AudioSource)
    public audioSource: AudioSource;

    @property(CCBoolean)
    public playOnAwake: boolean = false;

    @property({type: CCInteger, range: [1, 20]})
    public skip: number = 6;

    @property({ type: Enum(EBeat) })
    public beatType: EBeat;

    protected onEnable(): void
    {
        if (this.playOnAwake) this.play();
    }

    public play(): void 
    {
        this.audioSource.play();
        this.playInternal();
    }

    public stop(): void 
    {
        this.playInternal();
    }
    
    private playInternal() 
    {
        if (!this._beatData)
        {
            const data = this.beatJson.json as BeatData
            this._beatData = new BeatData(data.estimated_tempo_bpm, data.beat_count, data.beats_data);
        }
        const beats = this.getBeat();

        if (this.index >= beats.length)
            return;
        let time = 0
        if (this.index == 0)
        {
            time = this._beatData.beats_data[ 0 ].absolute_time_s;
        }
        else 
        {
            for (let i = 0; i < this.skip; i++)
            {
                time += beats[ this.index + i ];
            }
        }
        this.scheduleOnce(() => 
        {
            this.onBeatEvent.emit([ this.index ]);
            this.index += this.skip;
            this.playInternal();
        }, time);
    }

    public getBeat(): number[]
    {
        switch (this.beatType)
        {
            case EBeat.Absotule:
                return this._beatData.getConsecutiveBeats();
            case EBeat.Consecutive:
                return this._beatData.getConsecutiveBeats();
            case EBeat.Event:
                return this._beatData.getEvenBeats();
            case EBeat.Odd:
                return this._beatData.getOddBeats();
        }
    }
}


