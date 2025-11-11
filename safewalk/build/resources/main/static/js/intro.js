// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
// import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FontLoader.js';
// import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/TextGeometry.js';
// import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// document.addEventListener('DOMContentLoaded', () => {
//   let scene, camera, renderer, group, light;

//   init();
//   animate();

//   function init() {
//     const container = document.getElementById('intro-container');
//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(50, 360 / 740, 0.1, 1000);
//     camera.position.z = 120;

//     renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setSize(360, 740);
//     container.appendChild(renderer.domElement);

//     const ambient = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(ambient);

//     light = new THREE.PointLight(0xffffff, 1.3);
//     light.position.set(100, 0, 100);
//     scene.add(light);

//     group = new THREE.Group();
//     scene.add(group);

//     const loader = new FontLoader();
//     loader.load(
//       'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
//       (font) => {
//         const text = 'SAFEWALK';
//         const radius = 25; // 🔹 회전 반지름
//         const angleStep = (Math.PI * 2) / text.length;
//         const meshes = [];

//         for (let i = 0; i < text.length; i++) {
//           const char = text[i];
//           const geometry = new TextGeometry(char, {
//             font,
//             size: 7, // 🔹 처음엔 크게 (7)
//             height: 2,
//             curveSegments: 10,
//             bevelEnabled: true,
//             bevelThickness: 0.2,
//             bevelSize: 0.25,
//             bevelSegments: 3,
//           });

//           const material = new THREE.MeshStandardMaterial({
//             color: 0x1d3557,
//             metalness: 0.7,
//             roughness: 0.3,
//             emissive: 0x111111,
//           });

//           const mesh = new THREE.Mesh(geometry, material);
//           const angle = i * angleStep;
//           mesh.position.x = Math.cos(angle) * radius;
//           mesh.position.z = Math.sin(angle) * radius;
//           mesh.rotation.y = -angle + Math.PI;
//           mesh.scale.set(0, 0, 0);
//           group.add(mesh);
//           meshes.push(mesh);

//           gsap.to(mesh.scale, {
//             x: 1,
//             y: 1,
//             z: 1,
//             duration: 0.8,
//             ease: 'back.out(1.7)',
//             delay: 0.08 * i,
//           });
//         }

//         // 🔹 조명 애니메이션
//         gsap.to(light.position, {
//           x: -100,
//           y: 50,
//           z: 100,
//           duration: 3,
//           yoyo: true,
//           repeat: -1,
//           ease: 'sine.inOut',
//         });

//         // 🔹 2.5초 후 회전 멈추고 일렬 정렬
//         setTimeout(() => {
//           gsap.to(group.rotation, {
//             y: 0,
//             duration: 1.8,
//             ease: 'power2.inOut',
//           });

//           const spacing = 6.5;
//           const totalWidth = spacing * meshes.length;
//           const offsetX = 3; // 🔹 오른쪽으로 살짝 이동
//           meshes.forEach((m, i) => {
//             const targetX = -totalWidth / 2 + i * spacing + offsetX;
//             const targetZ = 0;

//             // 🔹 글자 크기 줄이면서 이동
//             gsap.to(m.scale, {
//               x: 0.7,
//               y: 0.7,
//               z: 0.7,
//               duration: 1.8,
//               ease: 'power3.inOut',
//             });

//             gsap.to(m.position, {
//               x: targetX,
//               z: targetZ,
//               duration: 1.8,
//               ease: 'power3.inOut',
//               delay: 0.05 * i,
//             });

//             gsap.to(m.rotation, {
//               y: 0,
//               duration: 1.8,
//               ease: 'power3.inOut',
//             });
//           });
//         }, 2500); // 🔹 회전 시간 2.5초로 단축

//         // 🔹 5초 후 페이드아웃 후 페이지 이동
//         setTimeout(() => {
//           document.getElementById('app-frame').classList.add('fade-out');
//           setTimeout(() => (window.location.href = '/index'), 1000);
//         }, 3400);
//       },
//       undefined,
//       (error) => {
//         console.error('An error happened during font loading:', error);
//         window.location.href = '/index';
//       }
//     );
//   }

//   function animate() {
//     requestAnimationFrame(animate);
//     if (group) group.rotation.y += 0.02; // 🔹 빠른 회전 속도
//     renderer.render(scene, camera);
//   }
// });
