/**
 * @file AnimationVideoContext
 * @author tianyu(tianyu05@baidu.com)
 */

class AnimationVideoContext {
    constructor(animationVideoId, slaveId, communicator) {
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
        this.slaveId = slaveId;
        this.componentId = [slaveId, 'animation-video', animationVideoId].join('_');
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
        this.invokeMethod('seek', {position});
    }

    invokeMethod(type, data) {
        this.communicator.sendMessage(this.slaveId, {
            type: `animation-video-${this.animationVideoId}`,
            value: {api: type, params: data}
        });
    }
}


export const createAnimationVideo = (animationVideoId, slaveId, communicator) => new
    AnimationVideoContext(
        animationVideoId,
        slaveId,
        communicator
    );
