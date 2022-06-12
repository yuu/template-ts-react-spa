import React, { useEffect, useRef, RefObject } from 'react';
import { Link } from 'react-router-dom';

const SCAN_PROID_MS = 800;

const constraints = {
    audio: false,
    video: {
        facingMode: 'environment',
        width: { min: 1280 },
        height: { min: 720 },
    },
};

const setupWorker = async () => {};

const setupCamera = async (video: RefObject<HTMLVideoElement>) => {
    console.log('@@ setupCamera');

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (video.current === null) return;

        video.current.srcObject = stream;
    } catch (err) {
        console.error(err);
    }
};

const makeTick = (
    video: RefObject<HTMLVideoElement>,
    decorder: RefObject<Worker>,
) => {
    const [track] = (video.current?.srcObject as MediaStream)?.getTracks();
    const { width = 0, height = 0 } = track?.getSettings();
    console.log(width, height);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;

    tempCanvas.width = width;
    tempCanvas.height = height;

    /* const drawing = new Image();
     * drawing.src = '/assets/test.png';
     * drawing.onload = function () {
     *     tempCtx.drawImage(drawing, 0, 0);
     *     const imageData = tempCtx.getImageData(0, 0, width, height);
     *     decorder.current?.postMessage({ imageData });
     * }; */

    const tick = () => {
        tempCtx.drawImage(video.current!, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, width, height);

        if (decorder.current) {
            decorder.current?.postMessage({ imageData });
        } else {
            console.error('decorder not found');
        }

        /* requestAnimationFrame(tick); */
    };

    return tick;
};

/* const attemptQRDecode = () => {
 *
 *     try {
 *         let canvas_ctx = this.canvas.current.getContext("2d");
 *         this.canvas.current.width = this.video.current.videoWidth;
 *         this.canvas.current.height = this.video.current.videoHeight;
 *         canvas_ctx.drawImage(this.video.current, 0, 0, this.canvas.current.width, this.canvas.current.height);
 *
 *         var imgData = canvas_ctx.getImageData(0, 0, this.canvas.current.width, this.canvas.current.height);
 *         if (imgData.data) {
 *             console.log(imgData);
 *             this.decoder.postMessage(imgData);
 *         }
 *     } catch (err) {
 *         if (err.name == 'NS_ERROR_NOT_AVAILABLE') setTimeout(() => { this.attemptQRDecode() }, 0);
 *         console.log("Error");
 *         console.log(err);
 *     }
 *
 * }; */

const Top = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const decorder = useRef<Worker | null>(null);

    useEffect(() => {
        console.log('START');

        // worker
        const worker = new Worker(
            new URL('@/worker/qrscan.worker.ts', import.meta.url),
        );

        worker.onmessage = (msg) => {
            console.log(msg);
        };
        worker.onerror = (msg) => {
            console.error('error occured from worker', msg);
        };

        decorder.current = worker;

        const sleep = (ms: number) =>
            new Promise((r) => {
                setTimeout(r, ms);
            });

        // camera
        setupCamera(videoRef).then(() => {
            const tick = makeTick(videoRef, decorder);

            videoRef.current!.onplay = () => {
                const f = async () => {
                    while (true) {
                        tick();
                        await sleep(SCAN_PROID_MS);
                    }
                };
                f();
            };
        });

        worker.postMessage({ question: 'aaaaaa' });
    }, []);
    return (
        <div>
            <h1>Hello TypeScript</h1>

            <div className="video-container">
                <video playsInline autoPlay ref={videoRef}></video>
            </div>
            <canvas id="qr-canvas" ref={canvasRef}></canvas>
        </div>
    );
};

export default Top;
