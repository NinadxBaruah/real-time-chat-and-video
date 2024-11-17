  // DOM menipulation
  const showSkill = document.querySelector(".show-skill") 
  const skillsContainer = document.querySelector(".skills-flex") 
  const hideSkill = document.getElementById("hide-skill")


  // Three.js setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x64ffda, 1);
  pointLight.position.set(2, 3, 4);
  scene.add(pointLight);

  // Create particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x64ffda
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Add geometric shapes
  const shapes = [];
  const geometries = [
      new THREE.TorusGeometry(1, 0.3, 16, 100),
      new THREE.OctahedronGeometry(1),
      new THREE.TetrahedronGeometry(1),
      new THREE.IcosahedronGeometry(1)
  ];

  for(let i = 0; i < 4; i++) {
      const geometry = geometries[i];
      const material = new THREE.MeshPhongMaterial({
          color: 0x64ffda,
          wireframe: true,
          transparent: true,
          opacity: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
      );
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      shapes.push(mesh);
      scene.add(mesh);
  }

  camera.position.z = 3;

  // Mouse tracking
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) / 100;
      mouseY = (event.clientY - window.innerHeight / 2) / 100;
  });

  // Scroll interaction
  let scrollPercent = 0;
  document.addEventListener('scroll', () => {
      scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  });

  // Animation
  function animate() {
      requestAnimationFrame(animate);

      // Smooth camera movement
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.001;

      // Animate shapes
      shapes.forEach((shape, i) => {
          shape.rotation.x += 0.003;
          shape.rotation.y += 0.005;
          shape.position.y = Math.sin(Date.now() * 0.001 + i) * 0.5;
          shape.material.opacity = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;
      });

      // Update point light position based on scroll
      pointLight.position.z = 4 - scrollPercent * 2;

      TWEEN.update();
      renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Add click interaction with shapes
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(shapes);

      if (intersects.length > 0) {
          const shape = intersects[0].object;
          new TWEEN.Tween(shape.scale)
              .to({ x: 1.5, y: 1.5, z: 1.5 }, 200)
              .easing(TWEEN.Easing.Elastic.Out)
              .start()
              .onComplete(() => {
                  new TWEEN.Tween(shape.scale)
                      .to({ x: 1, y: 1, z: 1 }, 200)
                      .easing(TWEEN.Easing.Elastic.Out)
                      .start();
              });
      }
  });

  // Show skill toggle

  showSkill.addEventListener("click", () => {
    skillsContainer.classList.remove("hide"); 
    skillsContainer.classList.add("show");   
    skillsContainer.style.display = "flex";   
    showSkill.style.display = "none";         
    hideSkill.style.display = "flex";        
});

hideSkill.addEventListener("click", () => {
    skillsContainer.classList.remove("show"); 
    skillsContainer.classList.add("hide");    
    setTimeout(() => {
        skillsContainer.style.display = "none"; 
    }, 500); 
    hideSkill.style.display = "none";        
    showSkill.style.display = "flex";        
});