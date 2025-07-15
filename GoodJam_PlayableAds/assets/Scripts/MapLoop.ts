import { Vec3 } from "cc";
import { Shelf } from "./Shelf/Shelf";

export class MapLoop {

    private _shelves: Shelf[] = [];
    private _shelvesMoveToLeft: Shelf[] = [];
    private _shelvesMoveToRight: Shelf[] = [];
    private _shelvesMoveToTop: Shelf[] = [];
    private _shelvesMoveToBottom: Shelf[] = [];

    private _limitLeft: number = 0;
    private _limitRight: number = 0;
    private _limitTop: number = 0;
    private _limitBottom: number = 0;

    // Tốc độ di chuyển ngang và dọc
    private _speedHorizontal: number = 0;
    private _speedVertical: number = 0;

    public constructor(shelves: Shelf[]) {
        this._shelves = shelves;
        // Xác định limit dựa vào position của tất cả shelves.
        this._limitLeft = Math.min(...this._shelves.map(shelf => shelf.node.position.x));
        this._limitRight = Math.max(...this._shelves.map(shelf => shelf.node.position.x));
        this._limitTop = Math.max(...this._shelves.map(shelf => shelf.node.position.y));
        this._limitBottom = Math.min(...this._shelves.map(shelf => shelf.node.position.y));

        for (let i = 0; i < this._shelves.length; i++) {
            let shelf = this._shelves[i];
            let pos = shelf.node.getPosition();
            if (pos.y === this._limitTop) {
                if (pos.x === this._limitRight) {
                    this._shelvesMoveToBottom.push(shelf);
                }
                else {
                    this._shelvesMoveToRight.push(shelf);
                }
            }
            else if (pos.x === this._limitRight) {
                if (pos.y === this._limitBottom) {
                    this._shelvesMoveToLeft.push(shelf);
                }
                else {
                    this._shelvesMoveToBottom.push(shelf);
                }
            }
            else if (pos.y === this._limitBottom) {
                if (pos.x === this._limitLeft) {
                    this._shelvesMoveToTop.push(shelf);
                }
                else {
                    this._shelvesMoveToLeft.push(shelf);
                }
            }
            else if (pos.x === this._limitLeft) {
                if (pos.y === this._limitTop) {
                    this._shelvesMoveToRight.push(shelf);
                }
                else {
                    this._shelvesMoveToTop.push(shelf);
                }
            }

            this._speedHorizontal = (this._limitRight - this._limitLeft) / 10;
            // this._speedVertical = (this._limitTop - this._limitBottom) / 10;
            this._speedVertical = this._speedHorizontal;
        }
    }

    public update(dt: number) {
        for (let i = 0; i < this._shelvesMoveToLeft.length; i++) {
            let shelf = this._shelvesMoveToLeft[i];
            let pos = shelf.node.getPosition();
            let newPos = new Vec3(pos.x - this._speedHorizontal * dt, pos.y, 0);
            if (newPos.x < this._limitLeft) {
                newPos.x = this._limitLeft;
                this._shelvesMoveToLeft.splice(i, 1);
                this._shelvesMoveToTop.push(shelf);
                --i;
            }
            shelf.node.setPosition(newPos);
        }
        for (let i = 0; i < this._shelvesMoveToTop.length; i++) {
            let shelf = this._shelvesMoveToTop[i];
            let pos = shelf.node.getPosition();
            let newPos = new Vec3(pos.x, pos.y + this._speedVertical * dt, 0);
            if (newPos.y > this._limitTop) {
                newPos.y = this._limitTop;
                this._shelvesMoveToTop.splice(i, 1);
                this._shelvesMoveToRight.push(shelf);
                --i;
            }
            shelf.node.setPosition(newPos);
        }
        for (let i = 0; i < this._shelvesMoveToRight.length; i++) {
            let shelf = this._shelvesMoveToRight[i];
            let pos = shelf.node.getPosition();
            let newPos = new Vec3(pos.x + this._speedHorizontal * dt, pos.y, 0);
            if (newPos.x > this._limitRight) {
                newPos.x = this._limitRight;
                this._shelvesMoveToRight.splice(i, 1);
                this._shelvesMoveToBottom.push(shelf);
                --i;
            }
            shelf.node.setPosition(newPos);
        }
        for (let i = 0; i < this._shelvesMoveToBottom.length; i++) {
            let shelf = this._shelvesMoveToBottom[i];
            let pos = shelf.node.getPosition();
            let newPos = new Vec3(pos.x, pos.y - this._speedVertical * dt, 0);
            if (newPos.y < this._limitBottom) {
                newPos.y = this._limitBottom;
                this._shelvesMoveToBottom.splice(i, 1);
                this._shelvesMoveToLeft.push(shelf);
                --i;
            }
            shelf.node.setPosition(newPos);
        }
    }

    
}