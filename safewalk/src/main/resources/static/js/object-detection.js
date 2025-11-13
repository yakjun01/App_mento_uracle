const objectDetectionApp = {
    session: null,
    video: null,
    canvas: null,
    ctx: null,
    lastCarVibrationTime: 0,
    lastPersonVibrationTime: 0,
    audioContext: null,
    animationFrameId: null,
    CUSTOM_CLASSES: [
        'air cleaner', 'animal', 'bed', 'bench', 'bicycle', 'blank', 'blinder dot', 'bollard', 'box', 'bump', 'car', 'cart', 'chair', 'desk', 'dryingrack', 'fan', 'fire hydrant', 'flower garden', 'mat', 'motorcycle', 'no parking sign', 'paper', 'person', 'pet', 'playground equipment', 'pot', 'refridgerator', 'sign', 'sofa', 'staircase handle', 'streetlight', 'table', 'trash can', 'tree', 'water purifier'
    ],

    async init() {
        console.log("Initializing Object Detection App");
        this.video = document.getElementById('video-feed');
        this.overlayContainer = document.getElementById('detection-overlay'); // 캔버스 대신 오버레이 div 사용
        const loadingIndicator = document.getElementById('loading-indicator');

        if (!this.video || !this.overlayContainer || !loadingIndicator) { // 캔버스 대신 오버레이 div 사용
            console.error("Required elements not found in the DOM.");
            return;
        }

        try {
            loadingIndicator.textContent = '카메라를 불러오는 중...';
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                loadingIndicator.textContent = '모델을 불러오는 중...';
                this.loadModel();
            };

            // Create and resume AudioContext on user gesture
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext.resume();

        } catch (error) {
            console.error("Initialization failed:", error);
            loadingIndicator.textContent = '오류: 초기화에 실패했습니다. 콘솔을 확인하세요.';
        }
    },

    async loadModel() {
        const loadingIndicator = document.getElementById('loading-indicator');
        try {
            this.session = await ort.InferenceSession.create('/best.quant.onnx', {
                executionProviders: ['webgl', 'wasm'],
            });
            loadingIndicator.style.display = 'none'; // 성공 시 로딩 숨기기
            this.detectLoop();
        } catch (error) {
            console.error("Failed to load the ONNX model:", error);
            loadingIndicator.textContent = '오류: 모델 로딩 실패. ' + error.message;
            loadingIndicator.style.display = 'block';
            loadingIndicator.style.backgroundColor = 'rgba(200, 0, 0, 0.7)';
        }
    },

    async detectLoop() {
        if (!this.session || !this.video || this.video.readyState < 2) {
            this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
            return;
        }
        
        if (this.video.videoWidth === 0) {
            console.log("Video not ready, skipping detection.");
            this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
            return;
        }

        const modelInputSize = 640;
        const inputTensor = await this.preprocess(this.video, modelInputSize);

        const feeds = { 'images': inputTensor };
        const results = await this.session.run(feeds);

        this.drawDetections(results.output0, modelInputSize);

        this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
    },

    async preprocess(video, modelInputSize) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = modelInputSize;
        tempCanvas.height = modelInputSize;
        tempCtx.drawImage(video, 0, 0, modelInputSize, modelInputSize);
        const imageData = tempCtx.getImageData(0, 0, modelInputSize, modelInputSize);
        const { data } = imageData;

        const red = [], green = [], blue = [];
        for (let i = 0; i < data.length; i += 4) {
            red.push(data[i] / 255.0);
            green.push(data[i + 1] / 255.0);
            blue.push(data[i + 2] / 255.0);
        }
        const input = [...red, ...green, ...blue];
        return new ort.Tensor('float32', input, [1, 3, modelInputSize, modelInputSize]);
    },

    drawDetections(outputTensor, modelInputSize) {
        if (!this.overlayContainer) return;

        // 이전 바운딩 박스 제거
        this.overlayContainer.innerHTML = '';

        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;

        // 비디오 요소의 실제 표시 크기 및 위치 가져오기
        const videoRect = this.video.getBoundingClientRect();
        const overlayRect = this.overlayContainer.getBoundingClientRect();

        // 비디오와 오버레이 컨테이너의 크기 비율 계산
        // object-fit: contain 때문에 비디오가 레터박스를 가질 수 있으므로, 실제 비디오 콘텐츠 영역을 계산해야 함
        let videoDisplayWidth = videoRect.width;
        let videoDisplayHeight = videoRect.height;
        let videoOffsetX = 0;
        let videoOffsetY = 0;

        const videoAspectRatio = videoWidth / videoHeight;
        const containerAspectRatio = videoRect.width / videoRect.height;

        if (videoAspectRatio > containerAspectRatio) {
            // 비디오가 컨테이너보다 넓은 경우 (좌우 레터박스)
            videoDisplayHeight = videoRect.width / videoAspectRatio;
            videoOffsetY = (videoRect.height - videoDisplayHeight) / 2;
        } else {
            // 비디오가 컨테이너보다 좁은 경우 (상하 레터박스)
            videoDisplayWidth = videoRect.height * videoAspectRatio;
            videoOffsetX = (videoRect.width - videoDisplayWidth) / 2;
        }

        const scaleX = videoDisplayWidth / modelInputSize;
        const scaleY = videoDisplayHeight / modelInputSize;

        const [batchSize, numChannels, numProposals] = outputTensor.dims;

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
                    bounding: [(x - 0.5 * w), (y - 0.5 * h), w, h],
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
            const className = this.CUSTOM_CLASSES[box.classId];
            const relativeWidth = (box.bounding[2] * scaleX) / videoDisplayWidth;

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

                        if (now - this.lastCarVibrationTime > vibrationPatternDuration) {
                            navigator.vibrate([100, pause]);
                            this.playSound(800, 100);
                            this.lastCarVibrationTime = now;
                            hasCarVibratedThisFrame = true;
                        }
                    }
                }
            } else if (className === 'person') {
                if (relativeWidth >= 0.3) {
                    isPersonInZone = true;
                    if (!hasPersonVibratedThisFrame) {
                        const maxPause = 400;
                        const minPause = 50;
                        const normalizedWidth = (relativeWidth - 0.3) / 0.7;
                        let pause = Math.round(maxPause - (normalizedWidth * (maxPause - minPause)));
                        if (pause < minPause) pause = minPause;

                        const now = performance.now();
                        const vibrationPatternDuration = 100 + pause;

                        if (now - this.lastPersonVibrationTime > vibrationPatternDuration) {
                            navigator.vibrate([100, pause]);
                            this.playSound(600, 100);
                            this.lastPersonVibrationTime = now;
                            hasPersonVibratedThisFrame = true;
                        }
                    }
                }
            }

            const [x, y, w, h] = box.bounding;

            // DOM 요소 생성 및 스타일 적용
            const boxElement = document.createElement('div');
            boxElement.style.position = 'absolute';
            boxElement.style.left = `${videoOffsetX + x * scaleX}px`;
            boxElement.style.top = `${videoOffsetY + y * scaleY}px`;
            boxElement.style.width = `${w * scaleX}px`;
            boxElement.style.height = `${h * scaleY}px`;
            boxElement.style.border = '2px solid #00FF00';
            boxElement.style.color = '#00FF00';
            boxElement.style.fontSize = '14px';
            boxElement.style.fontWeight = 'bold';
            boxElement.style.whiteSpace = 'nowrap';
            boxElement.style.textOverflow = 'ellipsis';
            boxElement.style.pointerEvents = 'none'; // 오버레이 클릭 방지

            const textElement = document.createElement('div');
            textElement.textContent = `${this.CUSTOM_CLASSES[box.classId]}: ${Math.round(box.probability * 100)}%`;
            textElement.style.backgroundColor = '#00FF00';
            textElement.style.color = '#000000';
            textElement.style.padding = '2px 5px';
            textElement.style.position = 'absolute';
            textElement.style.top = '-20px'; // 박스 위에 표시
            textElement.style.left = '0';
            textElement.style.whiteSpace = 'nowrap';
            textElement.style.pointerEvents = 'none';

            boxElement.appendChild(textElement);
            this.overlayContainer.appendChild(boxElement);
        });

        if (!isCarInZone) {
            this.lastCarVibrationTime = 0;
        }
        if (!isPersonInZone) {
            this.lastPersonVibrationTime = 0;
        }
    },

    playSound(frequency, duration) {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
};

// --- Global Lifecycle Handlers ---
function onLoaded() {
    console.log("Morpheus is loaded, initializing app.");
    objectDetectionApp.init();
}

function onResume() {
    console.log("App resumed.");
    if (objectDetectionApp.session) {
        objectDetectionApp.detectLoop();
    }
}

function onPause() {
    console.log("App paused.");
    if (objectDetectionApp.animationFrameId) {
        cancelAnimationFrame(objectDetectionApp.animationFrameId);
    }
}