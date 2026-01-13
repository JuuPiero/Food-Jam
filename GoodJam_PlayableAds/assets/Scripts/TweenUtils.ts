// assets/scripts/tweenUtils.ts
// Cocos Creator 3.x+
import { Node, Vec3, v3, Quat, tween, Tween, easing } from 'cc';

type Ease = keyof typeof easing | ((t: number) => number);

type ToProps = {
  /** Local position (nếu truyền cả position & worldPosition, position sẽ được áp sau cùng) */
  position?: Vec3;
  /** World position (hỗ trợ height -> quỹ đạo Bezier bậc 2) */
  worldPosition?: Vec3;
  /** Góc Euler (độ) */
  eulerAngles?: Vec3;
  /** Local rotation (Quaternion) */
  rotation?: Quat;
  /** World rotation (Quaternion) */
  worldRotation?: Quat;
  /** Local scale */
  scale?: Vec3;
  /** World scale */
  worldScale?: Vec3;
  /** Độ nâng theo trục Y cho position hoặc worldPosition (parabol mở lên) */
  height?: number;
};

type ByProps = {
  /** Local position offset */
  position?: Vec3;
  /** World position offset */
  worldPosition?: Vec3;
  /** Góc Euler offset (độ) */
  eulerAngles?: Vec3;
  /** Local rotation offset (Quaternion) */
  rotation?: Quat;
  /** World rotation offset (Quaternion) */
  worldRotation?: Quat;
  /** Local scale offset */
  scale?: Vec3;
  /** World scale offset */
  worldScale?: Vec3;
  /** Độ nâng theo trục Y cho position hoặc worldPosition (parabol mở lên) */
  height?: number;
};

type ToOptions = { easing?: Ease };
type SetProps = {
  position?: Vec3;
  worldPosition?: Vec3;
  eulerAngles?: Vec3;
  rotation?: Quat;
  worldRotation?: Quat;
  scale?: Vec3;
  worldScale?: Vec3;
};

class TweenUtils {
  private target: Node;

  // Biến nội bộ để tween 0→1 cho mỗi đoạn .to()
  private state = { t: 0 };

  // Chuỗi tween đang được xây dựng
  private seq: Tween<{ t: number }>;

  private started = false;
  private autoStartScheduled = false;

  // Promise báo hoàn tất toàn chuỗi
  private _done!: () => void;
  public readonly done: Promise<void>;

  // Callback khi toàn chuỗi xong
  private onCompleteCallback?: () => void;

  constructor(target: Node) {
    this.target = target;
    this.seq = tween(this.state);
    this.done = new Promise<void>((resolve) => (this._done = resolve));
  }

  /** Lên lịch tự động start trong microtask tiếp theo */
  private scheduleAutoStart(): void {
    if (!this.autoStartScheduled && !this.started) {
      this.autoStartScheduled = true;
      queueMicrotask(() => {
        if (!this.started) {
          this.start();
        }
      });
    }
  }

  /** Đặt ngay các thuộc tính (không tween) */
  set(props: SetProps): TweenUtils {
    if (props.position) this.target.position = props.position.clone();
    if (props.worldPosition) this.target.worldPosition = props.worldPosition.clone();
    if (props.eulerAngles) this.target.eulerAngles = props.eulerAngles.clone();
    if (props.rotation) this.target.rotation = props.rotation.clone();
    if (props.worldRotation) this.target.worldRotation = props.worldRotation.clone();
    if (props.scale) this.target.scale = props.scale.clone();
    if (props.worldScale) this.target.worldScale = props.worldScale.clone();
    return this;
  }

  /**
   * Tween theo thời gian (giây).
   * - worldPosition: tuyến tính hoặc Bezier bậc 2 nếu có height
   * - position / eulerAngles / rotation / worldRotation / scale / worldScale: nội suy tuyến tính theo trục
   */
  to(duration: number, props: ToProps, options?: ToOptions): TweenUtils {
    // Snapshot cho đoạn tween này
    let startLocalPos: Vec3 | null = null, endLocalPos: Vec3 | null = null;
    let ctrlLocalPos: Vec3 | null = null; // control point cho Bezier nếu có height với local position

    let startWorldPos: Vec3 | null = null, endWorldPos: Vec3 | null = null;
    let ctrlWorldPos: Vec3 | null = null; // control point cho Bezier nếu có height

    let startEuler: Vec3 | null = null, endEuler: Vec3 | null = null;
    let startRotation: Quat | null = null, endRotation: Quat | null = null;
    let startWorldRotation: Quat | null = null, endWorldRotation: Quat | null = null;
    let startScale: Vec3 | null = null, endScale: Vec3 | null = null;
    let startWorldScale: Vec3 | null = null, endWorldScale: Vec3 | null = null;

    this.seq = this.seq.set({ t: 0 }).to(
      duration,
      { t: 1 },
      {
        easing: options?.easing ?? 'linear',
        onStart: () => {
          // Local position (+Bezier nếu có height)
          if (props.position) {
            startLocalPos = this.target.position.clone();
            endLocalPos = props.position.clone();
            if (props.height && props.height !== 0) {
              ctrlLocalPos = v3(
                (startLocalPos.x + endLocalPos.x) * 0.5,
                (startLocalPos.y + endLocalPos.y) * 0.5 + props.height,
                (startLocalPos.z + endLocalPos.z) * 0.5
              );
              // Debug: log control point to help diagnose height issues
              try { console.debug('[tweenUtils] local ctrl point', { startLocalPos, endLocalPos, ctrlLocalPos, height: props.height }); } catch (e) {}
            } else ctrlLocalPos = null;
          }

          // World position (+Bezier nếu có height)
          if (props.worldPosition) {
            startWorldPos = this.target.worldPosition.clone();
            endWorldPos = props.worldPosition.clone();
            if (props.height && props.height !== 0) {
              ctrlWorldPos = v3(
                (startWorldPos.x + endWorldPos.x) * 0.5,
                (startWorldPos.y + endWorldPos.y) * 0.5 + props.height,
                (startWorldPos.z + endWorldPos.z) * 0.5
              );
              try { console.debug('[tweenUtils] world ctrl point', { startWorldPos, endWorldPos, ctrlWorldPos, height: props.height }); } catch (e) {}
            } else ctrlWorldPos = null;
          }

          if (props.eulerAngles) {
            startEuler = this.target.eulerAngles.clone();
            endEuler = props.eulerAngles.clone();
          }

          if (props.rotation) {
            startRotation = this.target.rotation.clone();
            endRotation = props.rotation.clone();
          }

          if (props.worldRotation) {
            startWorldRotation = this.target.worldRotation.clone();
            endWorldRotation = props.worldRotation.clone();
          }

          if (props.scale) {
            startScale = this.target.scale.clone();
            endScale = props.scale.clone();
          }

          if (props.worldScale) {
            startWorldScale = this.target.worldScale.clone();
            endWorldScale = props.worldScale.clone();
          }
        },
        onUpdate: () => {
          const t = this.state.t;

          // World position trước (để nếu có cả local position thì local sẽ override cuối)
          if (startWorldPos && endWorldPos) {
            if (ctrlWorldPos) {
              // Quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t C + t^2 P1
              const u = 1 - t;
              const bx = u*u*startWorldPos.x + 2*u*t*ctrlWorldPos.x + t*t*endWorldPos.x;
              const by = u*u*startWorldPos.y + 2*u*t*ctrlWorldPos.y + t*t*endWorldPos.y;
              const bz = u*u*startWorldPos.z + 2*u*t*ctrlWorldPos.z + t*t*endWorldPos.z;
              this.target.worldPosition = v3(bx, by, bz);
            } else {
              this.target.worldPosition = v3(
                startWorldPos.x + (endWorldPos.x - startWorldPos.x) * t,
                startWorldPos.y + (endWorldPos.y - startWorldPos.y) * t,
                startWorldPos.z + (endWorldPos.z - startWorldPos.z) * t
              );
            }
          }

          // Local position (ưu tiên cuối cùng nếu cùng truyền với worldPosition)
          if (startLocalPos && endLocalPos) {
            if (ctrlLocalPos) {
              const u = 1 - t;
              const bx = u*u*startLocalPos.x + 2*u*t*ctrlLocalPos.x + t*t*endLocalPos.x;
              const by = u*u*startLocalPos.y + 2*u*t*ctrlLocalPos.y + t*t*endLocalPos.y;
              const bz = u*u*startLocalPos.z + 2*u*t*ctrlLocalPos.z + t*t*endLocalPos.z;
              this.target.position = v3(bx, by, bz);
            } else {
              this.target.position = v3(
                startLocalPos.x + (endLocalPos.x - startLocalPos.x) * t,
                startLocalPos.y + (endLocalPos.y - startLocalPos.y) * t,
                startLocalPos.z + (endLocalPos.z - startLocalPos.z) * t
              );
            }
          }

          // Euler angles
          if (startEuler && endEuler) {
            this.target.eulerAngles = v3(
              startEuler.x + (endEuler.x - startEuler.x) * t,
              startEuler.y + (endEuler.y - startEuler.y) * t,
              startEuler.z + (endEuler.z - startEuler.z) * t
            );
          }

          // Local rotation (Quaternion slerp)
          if (startRotation && endRotation) {
            this.target.rotation = new Quat();
            Quat.slerp(this.target.rotation, startRotation, endRotation, t);
          }

          // World rotation (Quaternion slerp)
          if (startWorldRotation && endWorldRotation) {
            let tempQuat = new Quat();
            Quat.slerp(tempQuat, startWorldRotation, endWorldRotation, t);
            this.target.worldRotation = tempQuat;
          }

          // Local scale
          if (startScale && endScale) {
            this.target.scale = v3(
              startScale.x + (endScale.x - startScale.x) * t,
              startScale.y + (endScale.y - startScale.y) * t,
              startScale.z + (endScale.z - startScale.z) * t
            );
          }

          // World scale
          if (startWorldScale && endWorldScale) {
            this.target.worldScale = v3(
              startWorldScale.x + (endWorldScale.x - startWorldScale.x) * t,
              startWorldScale.y + (endWorldScale.y - startWorldScale.y) * t,
              startWorldScale.z + (endWorldScale.z - startWorldScale.z) * t
            );
          }
        },
      }
    );

    this.scheduleAutoStart();
    return this;
  }

  /**
   * Tween theo giá trị tương đối (offset).
   * - Tương tự .to() nhưng cộng thêm vào giá trị hiện tại
   */
  by(duration: number, props: ByProps, options?: ToOptions): TweenUtils {
    // Snapshot cho đoạn tween này
    let startLocalPos: Vec3 | null = null, endLocalPos: Vec3 | null = null;
    let ctrlLocalPos: Vec3 | null = null;

    let startWorldPos: Vec3 | null = null, endWorldPos: Vec3 | null = null;
    let ctrlWorldPos: Vec3 | null = null;

    let startEuler: Vec3 | null = null, endEuler: Vec3 | null = null;
    let startRotation: Quat | null = null, endRotation: Quat | null = null;
    let startWorldRotation: Quat | null = null, endWorldRotation: Quat | null = null;
    let startScale: Vec3 | null = null, endScale: Vec3 | null = null;
    let startWorldScale: Vec3 | null = null, endWorldScale: Vec3 | null = null;

    this.seq = this.seq.set({ t: 0 }).to(
      duration,
      { t: 1 },
      {
        easing: options?.easing ?? 'linear',
        onStart: () => {
          // Local position (+Bezier nếu có height)
          if (props.position) {
            startLocalPos = this.target.position.clone();
            endLocalPos = startLocalPos.clone().add(props.position);
            if (props.height && props.height !== 0) {
              ctrlLocalPos = v3(
                (startLocalPos.x + endLocalPos.x) * 0.5,
                (startLocalPos.y + endLocalPos.y) * 0.5 + props.height,
                (startLocalPos.z + endLocalPos.z) * 0.5
              );
            } else ctrlLocalPos = null;
          }

          // World position (+Bezier nếu có height)
          if (props.worldPosition) {
            startWorldPos = this.target.worldPosition.clone();
            endWorldPos = startWorldPos.clone().add(props.worldPosition);
            if (props.height && props.height !== 0) {
              ctrlWorldPos = v3(
                (startWorldPos.x + endWorldPos.x) * 0.5,
                (startWorldPos.y + endWorldPos.y) * 0.5 + props.height,
                (startWorldPos.z + endWorldPos.z) * 0.5
              );
            } else ctrlWorldPos = null;
          }

          if (props.eulerAngles) {
            startEuler = this.target.eulerAngles.clone();
            endEuler = startEuler.clone().add(props.eulerAngles);
          }

          if (props.rotation) {
            startRotation = this.target.rotation.clone();
            endRotation = new Quat();
            Quat.multiply(endRotation, startRotation, props.rotation);
          }

          if (props.worldRotation) {
            startWorldRotation = this.target.worldRotation.clone();
            endWorldRotation = new Quat();
            Quat.multiply(endWorldRotation, startWorldRotation, props.worldRotation);
          }

          if (props.scale) {
            startScale = this.target.scale.clone();
            endScale = startScale.clone().add(props.scale);
          }

          if (props.worldScale) {
            startWorldScale = this.target.worldScale.clone();
            endWorldScale = startWorldScale.clone().add(props.worldScale);
          }
        },
        onUpdate: () => {
          const t = this.state.t;

          // World position trước
          if (startWorldPos && endWorldPos) {
            if (ctrlWorldPos) {
              const u = 1 - t;
              const bx = u*u*startWorldPos.x + 2*u*t*ctrlWorldPos.x + t*t*endWorldPos.x;
              const by = u*u*startWorldPos.y + 2*u*t*ctrlWorldPos.y + t*t*endWorldPos.y;
              const bz = u*u*startWorldPos.z + 2*u*t*ctrlWorldPos.z + t*t*endWorldPos.z;
              this.target.worldPosition = v3(bx, by, bz);
            } else {
              this.target.worldPosition = v3(
                startWorldPos.x + (endWorldPos.x - startWorldPos.x) * t,
                startWorldPos.y + (endWorldPos.y - startWorldPos.y) * t,
                startWorldPos.z + (endWorldPos.z - startWorldPos.z) * t
              );
            }
          }

          // Local position
          if (startLocalPos && endLocalPos) {
            if (ctrlLocalPos) {
              const u = 1 - t;
              const bx = u*u*startLocalPos.x + 2*u*t*ctrlLocalPos.x + t*t*endLocalPos.x;
              const by = u*u*startLocalPos.y + 2*u*t*ctrlLocalPos.y + t*t*endLocalPos.y;
              const bz = u*u*startLocalPos.z + 2*u*t*ctrlLocalPos.z + t*t*endLocalPos.z;
              this.target.position = v3(bx, by, bz);
            } else {
              this.target.position = v3(
                startLocalPos.x + (endLocalPos.x - startLocalPos.x) * t,
                startLocalPos.y + (endLocalPos.y - startLocalPos.y) * t,
                startLocalPos.z + (endLocalPos.z - startLocalPos.z) * t
              );
            }
          }

          // Euler angles
          if (startEuler && endEuler) {
            this.target.eulerAngles = v3(
              startEuler.x + (endEuler.x - startEuler.x) * t,
              startEuler.y + (endEuler.y - startEuler.y) * t,
              startEuler.z + (endEuler.z - startEuler.z) * t
            );
          }

          // Local rotation
          if (startRotation && endRotation) {
            this.target.rotation = new Quat();
            Quat.slerp(this.target.rotation, startRotation, endRotation, t);
          }

          // World rotation
          if (startWorldRotation && endWorldRotation) {
            let tempQuat = new Quat();
            Quat.slerp(tempQuat, startWorldRotation, endWorldRotation, t);
            this.target.worldRotation = tempQuat;
          }

          // Local scale
          if (startScale && endScale) {
            this.target.scale = v3(
              startScale.x + (endScale.x - startScale.x) * t,
              startScale.y + (endScale.y - startScale.y) * t,
              startScale.z + (endScale.z - startScale.z) * t
            );
          }

          // World scale
          if (startWorldScale && endWorldScale) {
            this.target.worldScale = v3(
              startWorldScale.x + (endWorldScale.x - startWorldScale.x) * t,
              startWorldScale.y + (endWorldScale.y - startWorldScale.y) * t,
              startWorldScale.z + (endWorldScale.z - startWorldScale.z) * t
            );
          }
        },
      }
    );

    this.scheduleAutoStart();
    return this;
  }

  /** 
   * Đăng ký callback - được gọi ngay sau action trước đó hoàn thành.
   * Nếu gọi cuối cùng (sau tất cả các action), callback sẽ chạy khi toàn bộ chuỗi hoàn thành.
   */
  call(cb: () => void): TweenUtils {
    this.seq = this.seq.call(cb);
    this.scheduleAutoStart();
    return this;
  }

  /** Delay (tạm dừng) trước khi thực hiện action tiếp theo */
  delay(duration: number): TweenUtils {
    this.seq = this.seq.delay(duration);
    this.scheduleAutoStart();
    return this;
  }

  /** Lặp lại chuỗi tween hiện tại n lần */
  repeat(times: number): TweenUtils {
    this.seq = this.seq.repeat(times);
    this.scheduleAutoStart();
    return this;
  }

  /** Lặp lại chuỗi tween hiện tại vô hạn */
  repeatForever(): TweenUtils {
    this.seq = this.seq.repeatForever();
    this.scheduleAutoStart();
    return this;
  }

  /** Gộp các action trước đó thành một sequence để có thể repeat/repeatForever */
  union(): TweenUtils {
    this.seq = this.seq.union();
    this.scheduleAutoStart();
    return this;
  }

  /** Bắt đầu chạy chuỗi tween (idempotent) */
  start(): TweenUtils {
    if (this.started) return this;
    this.started = true;

    // Thêm callback cuối cùng để resolve Promise done
    this.seq = this.seq.call(() => {
      this._done();
    });

    this.seq.start();
    return this;
  }

  /** Dừng toàn bộ tween trong chuỗi này */
  stop(): void {
    Tween.stopAllByTarget(this.state);
  }

  /** Phương thức tĩnh: Dừng tất cả các action tween trên target node */
  static stopAllByTarget(target: Node): void {
    Tween.stopAllByTarget(target);
  }
}

/** Khởi tạo: tweenUtils(node) */
export function tweenUtils(node: Node): TweenUtils {
  return new TweenUtils(node);
}

/**
 * Chạy song song nhiều TweenUtils.
 * - .call(cb) có thể gọi TRƯỚC hoặc SAU .start()
 * - Nếu gọi .call() sau khi đã hoàn tất, cb sẽ chạy ngay lập tức
 * - Không cần await; vẫn expose .done nếu muốn dùng
 */
export function parallel(tweens: TweenUtils[]) {
  const callbacks: Array<() => void> = [];
  let completed = false;
  let started = false;

  const done = Promise.all(tweens.map((t) => t.done)).then(() => {
    completed = true;
    for (const cb of callbacks) {
      try { cb(); } catch (e) { console.error(e); }
    }
  });

  const start = () => {
    if (started) return api;
    started = true;
    tweens.forEach((t) => t.start());
    // không await; done sẽ tự gọi callbacks khi xong
    return api;
  };

  const call = (cb: () => void) => {
    if (!cb) return api;
    if (completed) {
      // đã xong rồi thì chạy ngay
      try { cb(); } catch (e) { console.error(e); }
    } else {
      callbacks.push(cb);
    }
    return api;
  };

  const stop = () => { tweens.forEach((t) => t.stop()); };

  const api = { start, call, stop, done };
  return api;
}

// Export easing để dùng như easing.cubicOut, 'quadInOut', ...
export { easing };
