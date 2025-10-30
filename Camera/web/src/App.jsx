import { useState, useRef, useEffect } from 'react';
import * as ort from 'onnxruntime-web';
import './App.css';

const CUSTOM_CLASSES = [
  'air cleaner', 'animal', 'bed', 'bench', 'bicycle', 'blank', 'blinder dot', 'bollard', 'box', 'bump', 'car', 'cart', 'chair', 'desk', 'dryingrack', 'fan', 'fire hydrant', 'flower garden', 'mat', 'motorcycle', 'no parking sign', 'paper', 'person', 'pet', 'playground equipment', 'pot', 'refridgerator', 'sign', 'sofa', 'staircase handle', 'streetlight', 'table', 'trash can', 'tree', 'water purifier'
];

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState('카메라를 불러오는 중...');
  const [fps, setFps] = useState(0);
  const lastCarVibrationTime = useRef(0);
  const lastPersonVibrationTime = useRef(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const frameCountRef = useRef(0);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setLoading('모델을 불러오는 중...');
          };
        }

        const newSession = await ort.InferenceSession.create('/best.onnx', {
          executionProviders: ['wasm'],
        });
        setSession(newSession);
        setLoading('');

      } catch (error) {
        console.error("초기화 실패:", error);
        setLoading('오류: 초기화에 실패했습니다. 콘솔을 확인하세요.');
      }
    }
    setup();
  }, []);

  useEffect(() => {
    let animationFrameId;
    if (session && videoRef.current?.srcObject) {
      const detect = async () => {
        if (!session || !videoRef.current || videoRef.current.readyState < 2) {
          animationFrameId = requestAnimationFrame(detect);
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const modelInputSize = 640;
        const inputTensor = await preprocess(video, modelInputSize);
        
        const feeds = { 'images': inputTensor };
        const results = await session.run(feeds);

        const outputTensor = results.output0;
        drawDetections(outputTensor, canvas, video.videoWidth, video.videoHeight, modelInputSize, lastCarVibrationTime, lastPersonVibrationTime);

        // FPS 계산 로직
        frameCountRef.current++;
        const elapsedTime = performance.now() - startTimeRef.current;
        if (elapsedTime > 1000) { // 1초마다 FPS 갱신
          const newFps = (frameCountRef.current * 1000) / elapsedTime;
          setFps(newFps);
          frameCountRef.current = 0;
          startTimeRef.current = performance.now();
        }

        animationFrameId = requestAnimationFrame(detect);
      };
      detect();
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }
  }, [session]);

  async function preprocess(video, modelInputSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = modelInputSize;
    canvas.height = modelInputSize;
    context.drawImage(video, 0, 0, modelInputSize, modelInputSize);
    const imageData = context.getImageData(0, 0, modelInputSize, modelInputSize);
    const { data } = imageData;
    
    const red = [], green = [], blue = [];
    for (let i = 0; i < data.length; i += 4) {
      red.push(data[i] / 255.0);
      green.push(data[i + 1] / 255.0);
      blue.push(data[i + 2] / 255.0);
    }
    const input = [...red, ...green, ...blue];
    return new ort.Tensor('float32', input, [1, 3, modelInputSize, modelInputSize]);
  }

  function drawDetections(outputTensor, canvas, videoWidth, videoHeight, modelInputSize, lastCarVibrationTime, lastPersonVibrationTime) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = videoWidth / modelInputSize;
    const scaleY = videoHeight / modelInputSize;
    const [batchSize, numChannels, numProposals] = outputTensor.dims;

    // Transpose the output tensor data from [batch, channels, proposals] to [batch, proposals, channels]
    const transposedData = [];
    for (let i = 0; i < numProposals; i++) {
      transposedData[i] = [];
      for (let j = 0; j < numChannels; j++) {
        transposedData[i][j] = outputTensor.data[j * numProposals + i];
      }
    }

    const confidenceThreshold = 0.3; 
    const iouThreshold = 0.7;

    let boxes = [];

    for (let i = 0; i < numProposals; i++) {
      const data = transposedData[i];
      const scores = data.slice(4);
      const [classId, probability] = scores.reduce((result, score, index) => {
          if (score > result[1]) {
            return [index, score];
          }
          return result;
        }, [-1, 0]);

      if (probability > confidenceThreshold) {
        const [x, y, w, h] = data.slice(0, 4);
        boxes.push({
          classId: classId,
          probability: probability,
          bounding: [
            (x - 0.5 * w),
            (y - 0.5 * h),
            w,
            h,
          ],
        });
      }
    }

    const iou = (box1, box2) => {
      const x1 = Math.max(box1.bounding[0], box2.bounding[0]);
      const y1 = Math.max(box1.bounding[1], box2.bounding[1]);
      const x2 = Math.min(box1.bounding[0] + box1.bounding[2], box2.bounding[0] + box2.bounding[2]);
      const y2 = Math.min(box1.bounding[1] + box1.bounding[3], box2.bounding[1] + box2.bounding[3]);
      
      const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
      const area1 = box1.bounding[2] * box1.bounding[3];
      const area2 = box2.bounding[2] * box2.bounding[3];
      const union = area1 + area2 - intersection;
      
      return intersection / union;
    };

    boxes.sort((a, b) => b.probability - a.probability);
    const finalBoxes = [];
    while (boxes.length > 0) {
      finalBoxes.push(boxes[0]);
      boxes = boxes.filter(box => iou(boxes[0], box) < iouThreshold);
    }

    let isCarInZone = false;
    let isPersonInZone = false;
    let hasCarVibratedThisFrame = false;
    let hasPersonVibratedThisFrame = false;

    finalBoxes.forEach(box => {
      const className = CUSTOM_CLASSES[box.classId];
      const relativeWidth = (box.bounding[2] * scaleX) / videoWidth;

      if (className === 'car') {
        if (relativeWidth >= 0.5) {
          isCarInZone = true;
          if (!hasCarVibratedThisFrame) {
            const maxPause = 300;
            const minPause = 50;
            const normalizedWidth = (relativeWidth - 0.5) / 0.5;
            let pause = Math.round(maxPause - (normalizedWidth * (maxPause - minPause)));
            if (pause < minPause) pause = minPause;

            const now = performance.now();
            const vibrationPatternDuration = 100 + pause;

            if (now - lastCarVibrationTime.current > vibrationPatternDuration) {
              navigator.vibrate([100, pause]);
              lastCarVibrationTime.current = now;
              hasCarVibratedThisFrame = true;
            }
          }
        }
      } else if (className === 'person') {
        if (relativeWidth >= 0.3) {
          isPersonInZone = true;
          if (!hasPersonVibratedThisFrame) {
            const maxPause = 400; // Slower start for person
            const minPause = 50;
            // Normalize from 0.3 to 1.0
            const normalizedWidth = (relativeWidth - 0.3) / 0.7;
            let pause = Math.round(maxPause - (normalizedWidth * (maxPause - minPause)));
            if (pause < minPause) pause = minPause;

            const now = performance.now();
            const vibrationPatternDuration = 100 + pause;

            if (now - lastPersonVibrationTime.current > vibrationPatternDuration) {
              navigator.vibrate([100, pause]);
              lastPersonVibrationTime.current = now;
              hasPersonVibratedThisFrame = true;
            }
          }
        }
      }

      const [x, y, w, h] = box.bounding;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
      
      ctx.fillStyle = '#00FF00';
      ctx.font = '18px Arial';
      const text = `${CUSTOM_CLASSES[box.classId]}: ${Math.round(box.probability * 100)}%`;
      ctx.fillText(text, x * scaleX, y * scaleY > 10 ? y * scaleY - 5 : 10);
    });

    if (!isCarInZone) {
      lastCarVibrationTime.current = 0;
    }
    if (!isPersonInZone) {
      lastPersonVibrationTime.current = 0;
    }
  }

  return (
    <div className="app-container">
      {loading && <div className="loading-indicator">{loading}</div>}
      <div className="fps-counter">{`FPS: ${fps.toFixed(1)}`}</div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="video-feed"
      />
      <canvas
        ref={canvasRef}
        className="detection-canvas"
      />
    </div>
  );
}

export default App;