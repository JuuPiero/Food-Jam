export class PromiseUtils {

    public static delay(time: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time * 1000);
        });
    }
}