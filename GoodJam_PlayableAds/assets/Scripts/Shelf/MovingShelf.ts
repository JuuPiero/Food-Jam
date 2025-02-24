import { _decorator, Component, Node, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { Shelf } from './Shelf';
import { EMoveType, IShelfData } from '../Data/ILevelData';
import { NormalShelf } from './NormalShelf';
const { ccclass, property } = _decorator;


@ccclass
export class MovingShelfBoundsLimit {
    @property(Vec2)
    horizontalLimits: Vec2 = new Vec2(-500 , 500);

    @property(Vec2)
    verticalLimits: Vec2 = new Vec2(-500, 500);
}
@ccclass('MovingShelf')
export class MovingShelf extends NormalShelf {

    @property(MovingShelfBoundsLimit)
    boundsLimit: MovingShelfBoundsLimit = new MovingShelfBoundsLimit;
    @property(UITransform)
    col: UITransform = null;
    @property(Vec2)
    _velocity: Vec2 = new Vec2(0, 0);
    @property
    speed: number = 0;
    start() {

    }

    update(deltaTime: number) {
            if (this.checkOutOfBounds())
            {
                this.repositionSelfWhenOutOfBounds();
            }
            else
            {

                this.node.position = this.node.position.add(new Vec3(this._velocity.x * deltaTime, this._velocity.y * deltaTime));
            }
    }
    public initialize(data: IShelfData): void {
        
        super.initialize(data);
        this.moveType = data.moveType;
        this.calculateVelocity();
        if (this.moveType == EMoveType.LEFT_TO_RIGHT ||  this.moveType == EMoveType.RIGHT_TO_LEFT)
            this.registerBoundsLimitHorizontal();
        
        if (this.moveType == EMoveType.BOTTOM_TO_TOP ||  this.moveType == EMoveType.TOP_TO_BOTTOM)
            this.registerBoundsLimitVertical();
    }


    calculateVelocity() {
        switch (this.moveType) {
            case EMoveType.NONE:
                break;
            case EMoveType.FALLING:
                break;
            case EMoveType.LEFT_TO_RIGHT:
                this._velocity = new Vec2(this.speed, 0);
                break;
            case EMoveType.RIGHT_TO_LEFT:
                this._velocity = new Vec2(-this.speed, 0);
                break;
            case EMoveType.BOTTOM_TO_TOP:
                this._velocity = new Vec2(0, this.speed);
                break;
            case EMoveType.TOP_TO_BOTTOM:
                this._velocity = new Vec2(0, -this.speed);
                break;
        }
    }
    checkOutOfBounds(): boolean {
        switch (this.moveType) {
            case EMoveType.NONE:
                break;
            case EMoveType.FALLING:
                break;
            case EMoveType.LEFT_TO_RIGHT:
                if (this.node.position.x >= this.boundsLimit.horizontalLimits.y) {
                    return true;
                }
                break;
            case EMoveType.RIGHT_TO_LEFT:
                if (this.node.position.x <= this.boundsLimit.horizontalLimits.x) {
                    return true;
                }
                break;
            case EMoveType.BOTTOM_TO_TOP:
                if (this.node.position.y >= this.boundsLimit.verticalLimits.y) {
                    return true;
                }
                break;
            case EMoveType.TOP_TO_BOTTOM:
                if (this.node.position.y <= this.boundsLimit.verticalLimits.x) {
                    return true;
                }
                break;
        }
        return false;
    }
    repositionSelfWhenOutOfBounds() {
        switch (this.moveType) {
            case EMoveType.LEFT_TO_RIGHT:
                this.node.setPosition(this.boundsLimit.horizontalLimits.x, this.node.position.y);
                break;
            case EMoveType.RIGHT_TO_LEFT:
                this.node.setPosition(this.boundsLimit.horizontalLimits.y, this.node.position.y);
                break;
            case EMoveType.BOTTOM_TO_TOP:
                this.node.setPosition(this.node.position.x, this.boundsLimit.verticalLimits.x);
                break;
            case EMoveType.TOP_TO_BOTTOM:
                this.node.setPosition(this.node.position.x, this.boundsLimit.verticalLimits.y);
                break;
        }
    }
    registerBoundsLimitVertical() {
        const upperYLimit = this.node.position.y + this.col.height * this.node.getWorldScale().y / 2;
        const lowerYLimit = this.node.position.y - this.col.height * this.node.getWorldScale().y / 2;

        if (this.boundsLimit.verticalLimits.x > lowerYLimit) {
            this.boundsLimit.verticalLimits.x = lowerYLimit;
        }

        if (this.boundsLimit.verticalLimits.y < upperYLimit) {
            this.boundsLimit.verticalLimits.y = upperYLimit;
        }
    }

    registerBoundsLimitHorizontal() {
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



