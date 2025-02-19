import { tween, Tween, Vec3, Node } from "cc";

export function BezierTween(
    node: Node, 
    duration: number, 
    p1: Vec3, 
    p2: Vec3, 
    p3: Vec3
) {
    return new Promise<void>((resolve) => {
        let tweenObj = { t: 0 };
        tween(tweenObj)
            .to(duration, { t: 1 }, {
                onUpdate: (target: Node, ratio) => {
                    let easedT = easeOutCubic(ratio); // Áp dụng easing cho t
                    node.worldPosition = bezierPosition(p1, p2, p3, easedT);
                },
                onComplete: () => {
                    resolve();
                }
            })
            .start();
    });
}

function bezierPosition(p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
    let u = 1 - t;
    let tt = t * t;
    let uu = u * u;
    
    // Công thức Bezier bậc 2
    let x = (uu * p1.x) + (2 * u * t * p2.x) + (tt * p3.x);
    let y = (uu * p1.y) + (2 * u * t * p2.y) + (tt * p3.y);
    let z = (uu * p1.z) + (2 * u * t * p2.z) + (tt * p3.z);

    return new Vec3(x, y, z);
}

function easeOutCubic(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}