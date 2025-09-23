// src/components/FaceRecognition/FaceRecognition.js
import React from 'react';

const FaceRecognition = ({ box, imageUrl }) => (
  <div className="center ma">
    <div className="absolute mt2" style={{ position: 'relative' }}>
      <img
        id="inputimage"
        src={imageUrl}
        alt=""
        width="500px"
        height="auto"
      />
      {/* Map over all boxes and create overlay divs */}
      {box.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            boxShadow: '0 0 0 3px #149df2 inset',
            top: b.topRow,
            left: b.leftCol,
            width: b.rightCol - b.leftCol,
            height: b.bottomRow - b.topRow,
          }}
        />
      ))}
    </div>
  </div>
);

export default FaceRecognition;
