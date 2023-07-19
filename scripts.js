let ship, entityManager, target;
let renderer, raycaster, laserClick;
let mouseX, mouseY, targetX, targetY, windowX, windowY, angle;

init();

function init() {
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

    const ambientLight = new THREE.AmbientLight(0x333333, 3.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x2255cc, 3);
    // current plane (x, y, z)
    directionalLight.position.set(0, 0, 60);
    scene.add(directionalLight);
    // light directional visual helper
    const helper = new THREE.DirectionalLightHelper( directionalLight, 0.3);
    scene.add( helper );

    function sync(entity, renderComponent) {
        renderComponent.matrix.copy(entity.worldMatrix);
    }

    entityManager = new YUKA.EntityManager();

    target = new YUKA.GameEntity();
    //target.setRenderComponent(targetMesh, sync);
    target.up.set(0, 0, 1);

    entityManager.add(target);

    let loader = new THREE.GLTFLoader();
    loader.load("./ship/Striker.blend03.glb", function(gltf) {
        scene.add(gltf.scene);
        ship = gltf.scene.children[0];
        //ship.position.y = 15;
        //ship.position.z = -50;

        //ship.rotateX(0.75);  // topdown/iso view of ship
    });

    // const targetGeometry = new THREE.SphereGeometry(0.1);
    // const targetMaterial = new THREE.MeshPhongMaterial({color: 0xFFEA00});
    // const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
    // targetMesh.matrixAutoUpdate = false;
    // scene.add(targetMesh);

    const mousePosition = new THREE.Vector3();

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

    raycaster = new THREE.Raycaster();

    // mousedown variable for lasers
    laserClick = false;
}

// test with 'click' and mousedown
window.addEventListener('mousedown', function() {
    
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.name === 'plane') 
            target.position.set(intersects[i].point.x, intersects[i].point.y, 0);
    }
    laserClick = true;
});

// bullet array
let bullets = [];

// limit shots per frames ********************** possible add as ship variable
let canShoot = 0;

// sync with AI time (YUKA)
const time = new YUKA.Time();

function animate(t) {
    const delta = time.update().getDelta();
    requestAnimationFrame(animate);
    // remeber the plane was shifted ln 87 (planeMesh.rotation.x = -0.5 * Math.PI)
    // Y position animation * speed , * tolerance
    //vehicle.position.y = Math.sin(t / 700) * -0.04;

    ship.position.y;
    ship.position.x;

    // rotation correction at greater distance from center(pivot point) *Yuka logic keeps rotation axis from properly updating
    const tolerance = 0.0002 - (Math.abs(ship.position.x) / 10000);

    // Z-tilt animation * speed , * tolerance 
    //ship.rotateZ(Math.sin(t / 700) * -0.001);
    ship.rotation.z += Math.sin(t / 500) * -(tolerance);
    //vehicle.rotation.z += 0.01;

    // X-tilt animation
    //ship.rotateX(Math.sin(t / 700) * 0.002);
    ship.rotation.x += Math.sin(t / 500) * (tolerance);
    //vehicle.rotation.x = Math.abs(vehicle.rotation.x) + Math.sin(t / 500) * 0.0002;

    //side/side
    //ship.rotateY(Math.sin(t / 700) * 0.001);
    ship.rotation.y += Math.sin(t / 500) * (tolerance);

    // turn ship to face mouse pointer on click
    angle = Math.atan2(mouseY - ship.position.y, mouseX - ship.position.x);
    ship.rotation.z = -angle - Math.PI;

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

        // position lasers to come from ship
        bullet.position.set(
            ship.position.x,
            ship.position.y,
            ship.position.z,
        ); 

        // variables to convert target world space to ship local space
        let posX;
        let posY;

        const local = new THREE.Object3D();
        
        if(target.position.x > ship.position.x) {
            posX = Math.abs(target.position.x - ship.position.x);
        } else {
            posX = Math.abs(ship.position.x - target.position.x) * -1;
        }

        if(target.position.y > ship.position.y) {
            posY = Math.abs(target.position.y - ship.position.y);
        } else {
            posY = Math.abs(ship.position.y - target.position.y) * -1;
        }

        //if(posX < 0.5 && posX > -0.5 && posY < 0.5 && posY > -0.5){
        //   bullet.MeshBasicMaterial.transparent = true;
        //}
        
         //test.position.set(target.position.x, target.position.y, 0);
        local.position.set(posX, posY, 0);

        // convert to mornal vector as volocity is constant in this direction
        local.position.normalize();

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

    // timer for laser intervals
    if(canShoot > 0) canShoot -= 1;

    entityManager.update(delta);

    renderer.render(scene, camera);
}

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();