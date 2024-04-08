export enum Powerup {
    HEART,
}

export const PowerupImages: HTMLImageElement[] = [];

export function getPowerupSkinUrl(powerup: Powerup): string {
    switch (powerup) {
        case Powerup.HEART: return "/assets/icons/heart-icon-small.png";
    }
}

export async function preloadPowerups(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const value of Object.values(Powerup)) {
        if (isNaN(value as any)) {
            const img = new Image();
            img.src = getPowerupSkinUrl(Powerup[value as any] as any);
            PowerupImages.push(img);
            promises.push(new Promise((resolve, reject) => {
                img.onerror = () => reject(`The image for the skin ${value} wasn't properly loaded.`);
                img.onload = () => resolve();
            }));
        } else {
            break;
        }
    }
    await Promise.all(promises);
}
