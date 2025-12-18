//import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/RGBELoader.js';

var scene, camera, renderer, mesh, isRotating = true, dayLight = true;

init();
animate();

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0.15,0.15,0.15);

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 40;
  	camera.position.y = 10;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	var loader = new THREE.GLTFLoader();

	loader.load( 'models/MainID.glb', function ( glb ) {

		mesh = glb.scene;
		mesh.traverse((node) => {
			if (node.isMesh) {
				node.castShadow = true; 
				node.receiveShadow = true;
			}
  		}	
	);
	scene.add( mesh );

	}, undefined, function ( error ) {
		console.error( error );
		} 
	);

	// Create button rotating
	var button1 = document.createElement( 'button' );
	button1.innerHTML = "Rotation on/off";
	button1.style.position = 'absolute';
	button1.style.top = '50px';
	button1.style.right = '50px';
	button1.style.color = "white";
	button1.style.backgroundColor = "#404040";
	button1.style.border = 'none';
	button1.style.boxShadow = 'none'
	button1.style.width = '150px'
	button1.style.height = '30px'
	document.body.appendChild( button1 );

	// Create button Day/Night
	var button2 = document.createElement( 'button' );
	button2.innerHTML = "Day/Night";
	button2.style.position = 'absolute';
	button2.style.top = '90px';
	button2.style.right = '50px';
	button2.style.color = "white";
	button2.style.backgroundColor = "#404040";
	button2.style.border = 'none';
	button2.style.boxShadow = 'none'
	button2.style.width = '150px'
	button2.style.height = '30px'
	document.body.appendChild( button2 );

	// Button 1 EventListener
	button1.addEventListener( 'click', function() {
		isRotating = !isRotating;
	});
		
	// Button 2 EventListener
	button2.addEventListener( 'click', function() {
		dayLight  = !dayLight;
		if (dayLight) {
			dayLightFunc();
		  } else {
			nightFunc();
		  }
	});

	// Resize window/renderer EventListener
	window.addEventListener('resize', function() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	});
}

	// Create lights
	const pointLight = new THREE.PointLight( 0xffffff, 1, 50 );
	pointLight.position.set( 0, 15, 5 );

  	const ambientLight1 = new THREE.AmbientLight(0x7690ca, 0.2);
	const ambientLight2 = new THREE.AmbientLight(0x7690ca, 0.3);

	const spotLight = new THREE.SpotLight(0xfff7d8, 5);
	spotLight.position.set(50, 100, 10);
	spotLight.angle = Math.PI / 4;
	spotLight.penumbra = 0.05;
	spotLight.decay = 2;
	spotLight.distance = 200;
	spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 2048;
	spotLight.shadow.mapSize.height = 2048;
	spotLight.shadow.camera.near = 0.5;
	spotLight.shadow.camera.far = 500;

	/* const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 20, 0 );
	scene.add( hemiLight ); */

	scene.add( pointLight, ambientLight1, ambientLight2, spotLight);

function dayLightFunc() {
	scene.remove(ambientLight2);
	scene.add(ambientLight1);
	scene.add(spotLight);
	scene.add(pointLight);
  }
  
  function nightFunc() {
	scene.remove(pointLight);
	scene.remove(ambientLight1);
	scene.remove(spotLight)
	scene.add(ambientLight2);
  }

function animate() {

	requestAnimationFrame( animate );

	// Rotate cube if isRotating is true
    if (mesh && isRotating) {
        mesh.rotation.y -= 0.01;
    }

	renderer.render( scene, camera );

}
