import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CreativeData')
export class CreativeData
{
    @property
    public frame: number = 0;
    @property
    public x: number = 0;
    @property
    public y: number = 0;
    @property
    public event: string = '';
}

@ccclass('CreativeDataRecord')
export class CreativeDataRecord extends Component {

    @property([CreativeData])
    private creativeDatasRecorded: CreativeData[] = [];
    private currentFrame: number = 0;

    @property
    public running = true;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.creativeDatasRecorded = [];
    }

    protected update(dt: number): void {
        if (this.running)
            this.currentFrame++;
    }

    /**
     * Add a new record with event name and optional position
     */
    AddData(eventName: string, x: number, y: number) {
        const data = new CreativeData();
        data.frame = this.currentFrame;
        data.x = Math.round(x);
        data.y = Math.round(y);
        data.event = eventName;
        this.creativeDatasRecorded.push(data);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_R:
                console.log('Record Data Successful — exporting to CSV');
                this.ExportDataToCSV();
                break;
        }
    }

    /**
     * Export the recorded data to a CSV file in the format:
     * Frame,X,Y,Event
     */
    ExportDataToCSV() {
        const fileName = 'creative_data_record.csv';
        let fileContent = 'Frame,X,Y,Event\n';
        fileContent += this.creativeDatasRecorded
            .map(data => `${data.frame},${data.x},${data.y},${data.event}`)
            .join('\n');

        const blob = new Blob([fileContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Data Exported to:', fileName);
    }
}
