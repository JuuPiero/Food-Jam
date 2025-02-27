import { _decorator, Component, Node, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { Shelf } from './Shelf';
import { EMoveType, IShelfData } from '../Data/ILevelData';
import { NormalShelf } from './NormalShelf';
const { ccclass, property } = _decorator;


@ccclass
export class MovingShelfBoundsLimit {
    @property(Vec2)
    horizontalLimits: Vec2 = new Vec2(-1100 , 1100);

    @property(Vec2)
    verticalLimits: Vec2 = new Vec2(-1100, 1100);
}

@ccclass('MovingShelf')
export class MovingShelf extends Shelf {

    @property(MovingShelfBoundsLimit)
    boundsLimit: MovingShelfBoundsLimit = new MovingShelfBoundsLimit();

    @property(UITransform)
    col: UITransform = null;

    @property(Vec2)
    velocity: Vec2 = null;
    
    @property
    speed: number = 0;

    protected update(deltaTime: number) {
        // Check out of bounds
        if (this.checkOutOfBounds()) {
            this.repositionSelfWhenOutOfBounds();
        }
        else {
            this.node.position = this.node.position.add(new Vec3(this.velocity.x * deltaTime, this.velocity.y * deltaTime));
        }
    }

    public initialize(data: IShelfData): void { 
        super.initialize(data);
        this.moveType = data.moveType;
        this.calculateVelocity();
        switch (this.moveType) {
            case EMoveType.LEFT_TO_RIGHT:
                break;
            case EMoveType.RIGHT_TO_LEFT:
                break;
            case EMoveType.TOP_TO_BOTTOM:
                break;
            case EMoveType.BOTTOM_TO_TOP:
                break;
        }
        if (this.moveType == EMoveType.LEFT_TO_RIGHT ||  this.moveType == EMoveType.RIGHT_TO_LEFT)
            this.registerBoundsLimitHorizontal();
        
        if (this.moveType == EMoveType.BOTTOM_TO_TOP ||  this.moveType == EMoveType.TOP_TO_BOTTOM)
            this.registerBoundsLimitVertical();
    }

    protected completeShelf(): void {
        // Chả làm gì cả.
    }

    private calculateVelocity() {
        switch (this.moveType) {
            case EMoveType.NONE:
                break;
            case EMoveType.FALLING:
                break;
            case EMoveType.LEFT_TO_RIGHT:
                this.velocity = new Vec2(this.speed, 0);
                break;
            case EMoveType.RIGHT_TO_LEFT:
                this.velocity = new Vec2(-this.speed, 0);
                break;
            case EMoveType.BOTTOM_TO_TOP:
                this.velocity = new Vec2(0, this.speed);
                break;
            case EMoveType.TOP_TO_BOTTOM:
                this.velocity = new Vec2(0, -this.speed);
                break;
        }
    }

    private checkOutOfBounds(): boolean {
        let pos = this.node.getPosition();
        switch (this.moveType) {
            case EMoveType.NONE:
                break;
            case EMoveType.FALLING:
                break;
            case EMoveType.LEFT_TO_RIGHT:
                return pos.x >= this.boundsLimit.horizontalLimits.y;
            case EMoveType.RIGHT_TO_LEFT:
                return pos.x <= this.boundsLimit.horizontalLimits.x;
            case EMoveType.BOTTOM_TO_TOP:
                return pos.y >= this.boundsLimit.verticalLimits.y;
            case EMoveType.TOP_TO_BOTTOM:
                return pos.y <= this.boundsLimit.verticalLimits.x;
            default:
                return false;
        }
    }
    
    private repositionSelfWhenOutOfBounds() {
        let pos = this.node.getPosition();
        let shelves = this.boxManager.levelLoader.getShelves();
        let horizontalMovingShelves: Shelf[] = [];
        let verticalMovingShelves: Shelf[] = [];
        let minShelf: Shelf = null;
        let maxShelf: Shelf = null;
        let spacingX = 0;
        let spacingY = 0;
        let minPos: Vec3 = null;
        let maxPos: Vec3 = null;
        let newPos: Vec3 = null;

        switch (this.moveType) {
            case EMoveType.LEFT_TO_RIGHT:
                horizontalMovingShelves = shelves.filter(shelf => shelf.node.getPosition().y === pos.y);
                horizontalMovingShelves.sort((a, b) => a.node.getPosition().x - b.node.getPosition().x);
                minShelf = horizontalMovingShelves[0];
                for (let i = 1; i < horizontalMovingShelves.length; ++i) {
                    if (minShelf.node.getPosition().x > horizontalMovingShelves[i].node.getPosition().x) {
                        minShelf = horizontalMovingShelves[i];
                    }
                }
                spacingX = Math.abs(horizontalMovingShelves[0].node.getPosition().x - horizontalMovingShelves[1].node.getPosition().x);
                minPos = minShelf.node.getPosition();
                newPos = new Vec3(minPos.x - spacingX, minPos.y, minPos.z);
                this.node.setPosition(newPos);
                break;
            case EMoveType.RIGHT_TO_LEFT:
                horizontalMovingShelves = shelves.filter(shelf => shelf.node.getPosition().y === pos.y);
                horizontalMovingShelves.sort((a, b) => b.node.getPosition().x - a.node.getPosition().x);
                maxShelf = horizontalMovingShelves[0];
                for (let i = 1; i < horizontalMovingShelves.length; ++i) {
                    if (maxShelf.node.getPosition().x < horizontalMovingShelves[i].node.getPosition().x) {
                        maxShelf = horizontalMovingShelves[i];
                    }
                }
                spacingX = Math.abs(horizontalMovingShelves[0].node.getPosition().x - horizontalMovingShelves[1].node.getPosition().x);
                maxPos = maxShelf.node.getPosition();
                newPos = new Vec3(maxPos.x + spacingX, maxPos.y, maxPos.z);
                this.node.setPosition(newPos);
                break;
            case EMoveType.BOTTOM_TO_TOP:
                verticalMovingShelves = shelves.filter(shelf => shelf.node.getPosition().x === pos.x);
                verticalMovingShelves.sort((a, b) => a.node.getPosition().y - b.node.getPosition().y);
                minShelf = verticalMovingShelves[0];
                for (let i = 1; i < verticalMovingShelves.length; ++i) {
                    if (minShelf.node.getPosition().y > verticalMovingShelves[i].node.getPosition().y) {
                        minShelf = verticalMovingShelves[i];
                    }
                }
                spacingY = Math.abs(verticalMovingShelves[0].node.getPosition().y - verticalMovingShelves[1].node.getPosition().y);
                minPos = minShelf.node.getPosition();
                newPos = new Vec3(minPos.x, minPos.y - spacingY, minPos.z);
                this.node.setPosition(newPos);
                break;

            case EMoveType.TOP_TO_BOTTOM:
                verticalMovingShelves = shelves.filter(shelf => shelf.node.getPosition().x === pos.x);
                verticalMovingShelves.sort((a, b) => b.node.getPosition().y - a.node.getPosition().y);
                maxShelf = verticalMovingShelves[0];
                for (let i = 1; i < verticalMovingShelves.length; ++i) {
                    if (maxShelf.node.getPosition().y < verticalMovingShelves[i].node.getPosition().y) {
                        maxShelf = verticalMovingShelves[i];
                    }
                }
                spacingY = Math.abs(verticalMovingShelves[0].node.getPosition().y - verticalMovingShelves[1].node.getPosition().y);
                maxPos = maxShelf.node.getPosition();
                newPos = new Vec3(maxPos.x, maxPos.y + spacingY, maxPos.z);
                this.node.setPosition(newPos);
                break;
        }
    }
    
    private registerBoundsLimitVertical() {
        const upperYLimit = this.node.position.y + this.col.height * this.node.getWorldScale().y / 2;
        const lowerYLimit = this.node.position.y - this.col.height * this.node.getWorldScale().y / 2;

        if (this.boundsLimit.verticalLimits.x > lowerYLimit) {
            this.boundsLimit.verticalLimits.x = lowerYLimit;
        }

        if (this.boundsLimit.verticalLimits.y < upperYLimit) {
            this.boundsLimit.verticalLimits.y = upperYLimit;
        }
    }

    private registerBoundsLimitHorizontal() {
        const rightXLimit = this.node.position.x + this.col.width * this.node.getWorldScale().x / 2;
        const leftXLimit = this.node.position.x - this.col.width * this.node.getWorldScale().x / 2;

        if (this.boundsLimit.horizontalLimits.x > leftXLimit) {
            this.boundsLimit.horizontalLimits.x = leftXLimit;
        }

        if (this.boundsLimit.horizontalLimits.y < rightXLimit) {
            this.boundsLimit.horizontalLimits.y = rightXLimit;
        }
    }
}



