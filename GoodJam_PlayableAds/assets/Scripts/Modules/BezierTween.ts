import { tween, Vec3, Node } from "cc";

export function BezierTween(
    node: Node, 
    duration: number, 
    targetNode: Node,
    middleOffset: Vec3,
) {
    return new Promise<void>((resolve) =>
    {
        const p1 = node.getWorldPosition();
        const p2 = new Vec3();
        const p3 = new Vec3();
        let tweenObj = { t: 0 };
        const pos = new Vec3();
        tween(tweenObj)
            .to(duration, { t: 1 },
            {
                onUpdate: () =>
                { 
                    p2.x = (p1.x + targetNode.getWorldPosition().x) / 2 + middleOffset.x;
                    p2.y = (p1.y + targetNode.getWorldPosition().y) / 2 + middleOffset.y;
                    p2.z = (p1.z + targetNode.getWorldPosition().z) / 2 + middleOffset.z;
                    p3.set(targetNode.getWorldPosition());
                    pos.set(bezierPosition(p1, p2, p3, easeOutCubic(tweenObj.t)));
                    node.setWorldPosition(pos);
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

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
    