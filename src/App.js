import './App.css';

import { useRef } from "react";

import * as ts from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

import Webcam from "react-webcam";

const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

const App = () => {

  // Antes do return vem a logica
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  //
  // Realiza o desenho da mão drawHandMesh
  //
  const drawHandMesh = (hands, context) => {
    // Se existir alguma mão detectada
    if (hands.length > 0) {

      hands.forEach((hand) => {

        const landmarks = hand.landmarks;

        Object.values(fingerJoints).forEach((finger) => {
          for (let i = 0; i < finger.length - 1; ++i) {

            const firstJoint = finger[i];
            const secondJoint = finger[i + 1];

            context.beginPath();
            context.moveTo(
              landmarks[firstJoint][0],
              landmarks[firstJoint][1],
            );
            context.lineTo(
              landmarks[secondJoint][0],
              landmarks[secondJoint][1],
            );
            context.strokeStyle = "#3498db";
            context.lineWidth = 4;
            context.stroke();
          }
        });

        landmarks.forEach((point) => {

          const posX = point[0];
          const posY = point[1];

          context.beginPath();
          context.arc(posX, posY, 5, 0, 2 * Math.PI);
          context.fill();

        });
      });
    }
  }

  //
  // Função que detecta a mão
  //
  const detectHand = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" && 
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Tentar detectar a mão no video
      const video = webcamRef.current.video;

      // Largura do video
      const videoWidth = video.videoWidth;
      // Altura do video
      const videoHeight = video.videoHeight;

      video.width = videoWidth;
      video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);

      const context = canvasRef.current.getContext("2d");

      drawHandMesh(hand, context);
    }
  }

  //
  // Carregar o modelo de detecção
  //
  const startHandPose = async () => {

    const net = await handpose.load();
    console.log("Modelo caregado com suseso!");

    setInterval(() => {
      // Chama a função para detectar a mão
      detectHand(net);
    }, 25);
  };

  startHandPose();

  // Retorna o jsx
  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef}
          style={{
            position: "absolute",
            marginRight: "auto",
            marginLeft: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480
          }}
        />
        <canvas ref={canvasRef}
          style={{
            position: "absolute",
            marginRight: "auto",
            marginLeft: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480
          }}
        />
      </header>
    </div>
  );
}

export default App;
