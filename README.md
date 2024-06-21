# overlay-video

This is a high-performance web animation React component. For more details, refer to this article: [How to Achieve High-Performance Web Animations at Zero Development Cost](https://midori-portfolio.vercel.app/blog/web-animation).

## Features:
1. **Low development cost**: Designers can directly turn AE-exported video resources into web animations, resulting in zero communication development costs.
2. **Small resource size**: Utilizes the advantages of video compression algorithms to achieve resource volumes far smaller than image frame sequences.
3. **High fidelity**: Completely reproduces effects designed by designers.
4. **High performance and compatibility**: Runs well even on low-end devices like iOS 9 and works well in browsers that support WebGL.

## Preview

Check out the effect on this webpage: [overlay-video-preview](https://overlay-video-preview.vercel.app/)

## Installation

Add the following line to your `.npmrc` file:

```
@midori-profile:registry=https://npm.pkg.github.com
```

Then install the package:

```sh
npm install @midori-profile/overlay-video
```

## Usage

### Props

| Prop Name        | Type          | Default                  | Required | Description                                                                                                   | Usage Example                                                                                                   |
|------------------|---------------|--------------------------|----------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| path             | String        |                          | Yes      | Path to the animation resource. Supports both relative and remote URLs. For remote paths, ensure CORS headers. | `<OverlayVideo path={video} ... />`                                                                             |
| resourceWidth    | Number        | 800                      | No       | Width of the video resource used by the component (in px).                                                     | `<OverlayVideo resourceWidth={1600} ... />`                                                                     |
| resourceHeight   | Number        | 400                      | No       | Height of the video resource used by the component (in px).                                                    | `<OverlayVideo resourceHeight={800} ... />`                                                                     |
| loop             | Boolean       | false                    | No       | Whether the animation loops.                                                                                   | `<OverlayVideo loop={true} ... />`                                                                              |
| autoplay         | Boolean       | false                    | No       | Whether the animation plays automatically.                                                                     | `<OverlayVideo autoplay={true} ... />`                                                                          |
| canvasStyle      | Object        | {}                       | No       | CSS styles for the animation canvas.                                                                           | `<OverlayVideo canvasStyle={{ width: '400px', height: '400px' }} ... />`                                        |
| onerror          | Function      |                          | No       | Function to handle component errors.                                                                           | `<OverlayVideo onerror={handleError} ... />`                                                                    |
| ref              | Object        |                          | No       | Reference to access play and pause methods.                                                                    | `<OverlayVideo ref={overlayVideoRef} ... /> overlayVideoRef.current?.play();  overlayVideoRef.current?.pause();` |

### Example Usage

```js
import OverlayVideo from '@midori-profile/overlay-video';
import video from './resource.mp4';

const overlayVideoRef = useRef<{ play: () => void; pause: () => void } | null>(null);

const handlePlay = () => {
  overlayVideoRef.current?.play();
};

const handlePause = () => {
  overlayVideoRef.current?.pause();
};

return (
  <div>
    <OverlayVideo
      id="myVideo"
      path={video}
      resourceWidth={1600}
      resourceHeight={800}
      loop={true}
      autoplay={true}
      canvasStyle={{ width: '400px', height: '400px' }}
      ref={overlayVideoRef}
    />
    <div>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
    </div>
  </div>
);
```




### Tips

- The final animation renders on a canvas, which can be styled using `canvasStyle`. For responsive design, you can set `canvasStyle="width:100%;"`.

- **resourceHeight** and **resourceWidth** refer to the dimensions of the video resource (in px), not the animation component. The animation component's dimensions are controlled via CSS. To avoid distortion, set the animation component's aspect ratio to match the video resource's aspect ratio.

- Handling Video in React

  To include video files in React, you can import them directly:

  ```js
  import video from './resource.mp4';
  ```

  In your `webpack.config.js`, add a rule to handle `.mp4` files:

  ```js
  {
    test: /\.mp4$/,
    use: 'file-loader?name=videos/[name].[ext]',
  }
  ```

### Example Project

For detailed usage, refer to this example project: [overlay-video-example](https://github.com/midori-profile/overlay-video/tree/master/example/react).
