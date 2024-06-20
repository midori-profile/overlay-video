class AnimationVideoContext {
    constructor(animationVideoId, communicator) {
        if (typeof animationVideoId !== 'string') {
            console.error(
                'createAnimationVideoContext Parameter error: '
                + 'domId should be string instead of '
                + `${typeof animationVideoId}`
            );
            return;
        }
        this.communicator = communicator;
        this.animationVideoId = animationVideoId;
        this.componentId = `animation-video-${animationVideoId}`;
    }

    play() {
        this.invokeMethod('play');
    }

    pause() {
        this.invokeMethod('pause');
    }

    seek(position) {
        if (typeof position !== 'number') {
            console.error(`seek parameter error: position should be number instead of ${typeof position}`);
            return;
        }
        this.invokeMethod('seek', { position });
    }

    invokeMethod(type, data) {
        this.communicator.sendMessage({
            type: `animation-video-${this.animationVideoId}`,
            value: { api: type, params: data }
        });
    }
}

export const createAnimationVideo = (animationVideoId, communicator) => new AnimationVideoContext(animationVideoId, communicator);
