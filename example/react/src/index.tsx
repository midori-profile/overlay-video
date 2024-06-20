import React from "react";
import ReactDOM from "react-dom";
import { AnimationVideo, createAnimationVideo } from './test/index';
// @ts-ignore
import video from './resource.mp4';


// https://smartprogram.baidu.com/docs/develop/component/animation-video/

const App = () => (
  <div style={{background: "#000", height: "100vh"}}>
    Hello, React with TypeScript!
    <h1 style={{ textAlign: 'center', fontSize: "24px", color: 'white', position: 'absolute', left: "80px", top: '200px', width: '300px' }}>
      This is an h1 tag, It is covered by animation.
    </h1>
    <div style={{ position: 'absolute', zIndex: '999'}}>
    <AnimationVideo
      id="myVideo"
      path={video}
      resourceWidth={800}
      resourceHeight={400}
      loop={true}
      autoplay={true}
      canvasStyle={{ width: '400px', height: '400px' }}
    />
    </div>

  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));
