import React, { useRef } from "react";
import ReactDOM from "react-dom";
import OverlayVideo from './test/index';
import video from './resource.mp4';

const App = () => {
  const buttonStyle = {
    border: '2px solid white',
    backgroundColor: 'transparent',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    marginRight: '10px',
    outline: 'none'
  };
  const overlayVideoRef = useRef<{ play: () => void; pause: () => void } | null>(null);

  const handlePlay = () => {
    overlayVideoRef.current?.play();
  };

  const handlePause = () => {
    overlayVideoRef.current?.pause();
  };

  const handleError = (e: Event) => {
    console.error('Video error:', e);
  };

  return (
    <div style={{ background: "#000", height: "100vh" }}>
      Hello, React with TypeScript!
      <h1 style={{ textAlign: 'center', fontSize: "24px", color: 'white', position: 'absolute', left: "70px", top: '130px', width: '300px' }}>
      "This is an h1 tag, It is covered by animation. This animation supports transparent background and overlaps with the h1.
      </h1>
      <div style={{ position: 'absolute', zIndex: '999' }}>
        <OverlayVideo
          id="myVideo"
          path={video}
          resourceWidth={1600}
          resourceHeight={800}
          loop={true}
          autoplay={true}
          canvasStyle={{ width: '400px', height: '400px' }}
          ref={overlayVideoRef}
          onerror={handleError}
        />
      </div>
      <div style={{ position: 'absolute', zIndex: '1000', top: '20px', left: '20px' }}>
        <button onClick={handlePlay} style={buttonStyle}>Play</button>
        <button onClick={handlePause} style={buttonStyle}>Pause</button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
