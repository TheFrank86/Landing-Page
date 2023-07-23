let model, mesh1;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

//renderer.setClearColor(0x5A5A5A);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// x, y, z
//camera.position.set(0, 10, 2);
camera.position.set(0, 0, 30);

// rotate so planet isn't centered
//camera.rotation.y = 0;  // Y first
//camera.rotation.x = -1.4;  // X second
//camera.rotation.z = 0;
// OR
//camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333, 8.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x2255cc, 3);
// current plane (x, y, z)
directionalLight.position.set(0, 0, 60);
scene.add(directionalLight);
// light directional visual helper
const helper = new THREE.DirectionalLightHelper( directionalLight, 0.3);
scene.add( helper );

// const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
// vehicleGeometry.rotateX(Math.PI * 0.5);
// const vehicleMaterial = new THREE.MeshNormalMaterial();
// const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
// vehicleMesh.matrixAutoUpdate = false;
// scene.add(vehicleMesh);

// texture loader
const textureLoader = new THREE.TextureLoader();

// asteroid texture loading
const rock = textureLoader.load("./static/asteroid2.png");
rock.rotation = 0.3;

// asteroid 1 initialization 
const rockGeometry = new THREE.PlaneGeometry(8, 8);

const rockMaterial = new THREE.MeshStandardMaterial({
    //size: 2.0,
    //color: 0xddc0ff,
    color: 0xffffff,
    map: rock,
    //wireframe: true,
    transparent: true,
});

mesh1 = new THREE.Mesh(rockGeometry, rockMaterial);
scene.add(mesh1);

/* var center = new THREE.Vector3();
mesh1.geometry.computeBoundingBox();
mesh1.geometry.boundingBox.getCenter(center);
mesh1.geometry.center();
mesh1.position.copy(center); */

mesh1.position.set(-7,7,0);

// Yuka AI vehicle initialization 
const vehicle = new YUKA.Vehicle();

vehicle.scale.set(0.60, 0.60, 0.60);
vehicle.position.set(0, 0, 0);

//vehicle.forward.set(0, -1, 0);
//vehicle.up.set(0, 0, 1);

vehicle.forward.set(0, -1, 0);
vehicle.up.set(1, 0, 0);

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}    

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

const target = new YUKA.GameEntity();
//target.setRenderComponent(targetMesh, sync);
target.up.set(0, 0, 1);

entityManager.add(target);

// setting target deceleration and ship bounding box tolerance (target.position, 0.5, 0.3)
const arriveBehavior = new YUKA.ArriveBehavior(target.position, 0.15, 0.0);
//const arriveBehavior = new YUKA.ArriveBehavior((target.position.x, target.position.y, 0), 0.0, 0.3);

// adjust weight for fast response without overshooting target (5)
arriveBehavior.weight = 75;

vehicle.steering.add(arriveBehavior);

//target.position.set(0, 0, 1);

vehicle.maxSpeed = 8.0;

// The maximum turn rate of this game entity in radians per seconds
vehicle.maxTurnRate = Math.PI * 90;

const loader = new THREE.GLTFLoader();
//const ship = new THREE.Object3D();
const ship = new THREE.Group();

loader.load('./ship/Striker.blend03.glb', function(glb) {
    model = glb.scene;
    model.matrixAutoUpdate = false;
    
    //wireframe 
    model.traverse ( ( o ) => {
		if ( o.isMesh ) {
		o.material.metalness = false;
		o.material.wireframe = false;
		}
	} );

    ship.add(model);
    scene.add(ship);
    vehicle.setRenderComponent(model, sync);
});


// const targetGeometry = new THREE.SphereGeometry(0.1);
// const targetMaterial = new THREE.MeshPhongMaterial({color: 0xFFEA00});
// const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
// targetMesh.matrixAutoUpdate = false;
// scene.add(targetMesh);

const mousePosition = new THREE.Vector3();

let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
    mousePosition.z = 1;
    //test **********************************************************************
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
});

const planeGeo = new THREE.PlaneGeometry(45, 45, 10, 10);
const planeMat = new THREE.MeshBasicMaterial({
    visible: false,
    wireframe : true,
});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
//planeMesh.rotation.z = -0.5;
scene.add(planeMesh);
planeMesh.name = 'plane';
planeMesh.position.set(0, 0, 0);

const raycaster = new THREE.Raycaster();

// mousedown variable for lasers
let laserClick = false;

// test with 'click' and mousedown
window.addEventListener('mousedown', function() {
    
    //if (overlay.style.opacity = "0") {
        raycaster.setFromCamera(mousePosition, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        for(let i = 0; i < intersects.length; i++) {
            if(intersects[i].object.name === 'plane') 
                target.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
        }
        laserClick = true;

        // Modal test and position **************************************************************************************************************
        let test = document.getElementById('button1');
        console.log( "(" + test.offsetLeft + ", " + test.offsetTop + ")");
    //}
});

// setInterval(function(){
//     const x = Math.random() * 3;
//     const y = Math.random() * 3;
//     const z = Math.random() * 3;

//     target.position.set(x, y, z);
// }, 2000);

// bullet array
let bullets = [];

// limit shots per frames ********************** possible add as ship variable
let canShoot = 0;

// sync with AI time (YUKA)
const time = new YUKA.Time();

let m = new THREE.Matrix4();

let z = 1;

function animate(t) {

    const delta = time.update().getDelta();

    //rotate background stars.jpg ****************************************************************************************
    let backgroundImage = document.getElementById("background-image");
    let tilt = Math.sin(t /6000) * 1.5;

    backgroundImage.style.transform = `rotate(${tilt}deg)`;

    // remeber the plane was shifted ln 87 (planeMesh.rotation.x = -0.5 * Math.PI)
    // Y position animation * speed , * tolerance
    //vehicle.position.y = Math.sin(t / 700) * -0.04;

    // Z-tilt animation * speed , * tolerance 
    //ship.rotateZ(Math.sin(t / 700) * -0.001);
    //vehicle.rotation.z += Math.sin(t / 500) * -0.0002;

    // X-tilt animation
    //ship.rotateX(Math.sin(t / 700) * 0.002);
    //vehicle.rotation.x += Math.sin(t / 500) * 0.0002;

    //side/side
    //ship.rotateY(Math.sin(t / 700) * 0.001);
    //vehicle.rotation.y += Math.sin(t / 500) * 0.0002;

    // rotation correction at greater distance from center(pivot point, mostly Y) *Yuka logic keeps rotation axis at 0,0,0
    const toleranceX = 0.0005 - (Math.abs(ship.position.x) / 100);
    const toleranceY = 0.0001 - (Math.abs(ship.position.x) / 100);
    const toleranceZ = 0.0005 - (Math.abs(ship.position.x) / 100);

    // tilt animation * speed , * tolerance
    ship.rotation.x += Math.sin(t / 400) * (toleranceX);  
    ship.rotation.y += Math.sin(t / 400) * (toleranceY);
    ship.position.z += Math.sin(t / 400) * -(toleranceZ);
    
    // asteroid 1 default animation
    mesh1.rotation.z += Math.sin(t / 1200) * 0.0003;
    mesh1.position.z += Math.sin(t / 800) * 0.0008;
    mesh1.position.x += Math.sin(t / 1600) * 0.001;
    mesh1.position.y += Math.sin(t / 1400) * 0.001;
    
    //let angle = Math.atan2(mouseY - ship.position.y, mouseX - ship.position.x);
    //ship.rotation.z = -angle - Math.PI -1.5;
    //ship.rotateZ(-angle - Math.PI);
    //ship.rotation.z += 0.01;

    // laser array updates
    for(let index = 0; index < bullets.length; index += 1){
        if( bullets[index] === undefined) continue;
        if( bullets[index].alive == false) {
            bullets.splice(index, 1);
            continue;
        }

        bullets[index].position.add(bullets[index].velocity);
    }

    // ship laser
    if(laserClick && canShoot <= 0){
        let bullet = new THREE.Mesh(
            //new THREE.CapsuleGeometry( 0.2, 0.5, 4, 8 ),
            new THREE.SphereGeometry( 0.1, 1, 4, 8 ),
            new THREE.MeshBasicMaterial({color:0xff0000}),
        ); 
    
        /* const bulletGeometry = new THREE.BufferGeometry();
		const bulletMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffaaaa,
            linewidth: 5, 
        });

		bulletGeometry.setFromPoints([
            new THREE.Vector3(vehicle.position),
            new THREE.Vector3(vehicle.position.x, vehicle.position.y, vehicle.position.z - 1)]);

        //bulletGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vehicle.position, 3 ) );
        bulletGeometry.computeBoundingSphere();

		let bullet = new THREE.LineSegments(bulletGeometry, bulletMaterial); */
		//bullet.matrixAutoUpdate = false; 

        // variables to convert target world space to ship local space
        let posX;
        let posY;

        const local = new THREE.Object3D();
        
        // Try Math.sign( local x) to apply the matrix to -1 on the Z
        if(target.position.x > vehicle.position.x) {
            posX = Math.abs(target.position.x - vehicle.position.x);
        } else {
            posX = Math.abs(vehicle.position.x - target.position.x) * -1;
        }

        if(target.position.y > vehicle.position.y) {
            posY = Math.abs(target.position.y - vehicle.position.y);
        } else {
            posY = Math.abs(vehicle.position.y - target.position.y) * -1;
        }

        //if(posX < 0.5 && posX > -0.5 && posY < 0.5 && posY > -0.5){
        //   bullet.MeshBasicMaterial.transparent = true;
        //}
        

         //test.position.set(target.position.x, target.position.y, 0);
        local.position.set(posX, posY, 0);

        // convert to mornal vector as volocity is constant in this direction
        local.position.normalize();

        // correct yuka steering behavior mesh flip on -x values
        if(z != Math.sign(local.position.x)){
            ship.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
            ship.updateMatrix();
            z = Math.sign(local.position.x);
        }

        // position lasers to come from ship
        bullet.position.set(
            vehicle.position.x + (local.position.x) * 1.5,
            vehicle.position.y + (local.position.y) * 1.5,
            vehicle.position.z,
        ); 
        
        // set laser velocity
        bullet.velocity = new THREE.Vector3(
            //-Math.sin(vehicle.rotation.y),
            //0,
            //Math.cos(vehicle.rotation.y),

            (local.position.x) *0.5,
            (local.position.y) *0.5,
            0,
        );

        // time limit on laser life
        bullet.alive = true;
        setTimeout(function(){
            bullet.alive = false;
            scene.remove(bullet);
        }, 1000 * 3);

        // add to scene, array, and set frame delay
        bullets.push(bullet);
        scene.add(bullet);
        canShoot = 10;
        laserClick = false;
    }

    const test1 = document.getElementById('button1');
    //const test2 = document.getElementById('button2');
        
    //console.log( "(" + test1.offsetLeft + ", " + test1.offsetTop + ")");

    // this goes in Animate, as laser gets in proximity of button **********************************************************************
    for(let index = 0; index < bullets.length; index += 1){
        console.log(bullets[index].position.y);

        // at planegeometry (8, 8), mesh.x -3.5, +2  mesh.y -1.5, +3.5
        if (bullets[index].position.x > (mesh1.position.x - 3.5) && bullets[index].position.x < (mesh1.position.x + 2)){
            if (bullets[index].position.y > (mesh1.position.y - 1.5) && bullets[index].position.y < (mesh1.position.y + 3.5)){
                 openModal(modal1);
            }    
        } 
    }

    // timer for laser intervals
    if(canShoot > 0) canShoot -= 1;

    entityManager.update(delta);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});