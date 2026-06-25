export class AssetLoader {
  private cache: Map<string, HTMLImageElement> = new Map();

  public async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) return this.cache.get(url)!;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  public canvasToImage(canvas: HTMLCanvasElement): HTMLImageElement {
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    return img;
  }
}

export const assetLoader = new AssetLoader();
