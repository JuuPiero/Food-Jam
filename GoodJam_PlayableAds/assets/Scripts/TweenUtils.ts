import { Node, Tween, Vec3, easing, v3 } from "cc";

class TweenUtils<T> extends Tween<T> {

    public constructor(target: T) {
        super(target);
    }

    public bezierTo(duration: number, p1: Partial<{ position: Vec3; worldPosition: Vec3 }>,
        p2: Partial<{ position: Vec3; worldPosition: Vec3 }>,
        p3: Partial<{ position: Vec3; worldPosition: Vec3 }>,
        options?: { easing?: string }): this {

        let easingFunction: (t: number) => number = easing.linear;
        if (options?.easing && easing[options.easing]) {
            easingFunction = easing[options.easing];
        }

        return this.to(duration, {}, {
            onUpdate: (target: Node, ratio: number) => {
                const t = easingFunction(ratio);

                // Xác định loại vị trí (position hoặc worldPosition)
                const key = p1.position ? "position" : "worldPosition";

                // Lấy tọa độ từ object
                const p1Value = p1[key] as Vec3;
                const p2Value = p2[key] as Vec3;
                const p3Value = p3[key] as Vec3;

                // Nội suy Bezier bậc hai
                const x = (1 - t) * (1 - t) * p1Value.x + 2 * (1 - t) * t * p2Value.x + t * t * p3Value.x;
                const y = (1 - t) * (1 - t) * p1Value.y + 2 * (1 - t) * t * p2Value.y + t * t * p3Value.y;
                const z = (1 - t) * (1 - t) * p1Value.z + 2 * (1 - t) * t * p2Value.z + t * t * p3Value.z;

                // Cập nhật vị trí tương ứng
                if (key === "position") {
                    target.setPosition(v3(x, y, z));
                } else {
                    target.setWorldPosition(v3(x, y, z));
                }
            }
        }) as this;
    }
}

export function tween<T>(target?: T): TweenUtils<T> {
    return new TweenUtils(target!);
}