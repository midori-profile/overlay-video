
/**
 * @file animation-video api behavior
 * @author tianyu05@baidu.com
 */

export default {

    /**
     * 注册createAnimationVideoContext() 暴露的 API处理
    */

    initAPIRegister(video) {
        this.communicator.onMessage(`animation-video-${this.data.get('id')}`, event => {
            let {api: apiName, params} = (event && event.value) || {};
            switch (apiName) {
                case 'play': {
                    const playPromise = video.play();
                    // iOS9及以下版本不会返回Promise对象，做下兼容处理
                    // 安卓 T7内核 bug tobe fixed
                    // 如果写了个空的路径，promise会处于 resolve 状态
                    // 如果写了个实际存在,无法播放的资源，例如 jpg 图片，会处于 rejected 状态。
                    if (playPromise) {
                        // 播放失败时抛出错误
                        playPromise.catch(err => {
                            this.dispatchEvent('binderror', {
                                detail: {
                                    err
                                }
                            });
                        });
                    }
                    break;
                }
                case 'pause':
                    video.pause();
                    break;
                case 'seek':
                    video.currentTime = params && params.position + '';
                    break;
            }
        });
    }
};
