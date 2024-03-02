export class CanvasMock {
    getContext(_context: string) {
        return {
            fillRect: () => {},
            canvas: {
                clientWidth: 100,
                clientHeight: 100
            }
        };
    }
}

export class ImageMock {
    src: string = "";
    width: number = 10;
    height: number = 10;
}