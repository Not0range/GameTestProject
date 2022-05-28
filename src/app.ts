import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as CANNON from "cannon";
import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    Vector3, 
    HemisphericLight, 
    Mesh, 
    MeshBuilder,
    StandardMaterial, 
    Color3, 
    PhysicsImpostor, 
    CannonJSPlugin, 
    Tools,
    Texture,
    Vector4
} from "@babylonjs/core";
import CubeTexture from './textures/cube.png'

function floor(a: number): number {
    let b = Math.sign(a);
    return Math.floor(Math.abs(a)) * b;
}

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);
        scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(undefined, undefined, CANNON));

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", 
            Math.PI / 4, 0, 37, Vector3.Zero(), scene);
        camera.fov = 1;
        //camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var ground: Mesh = MeshBuilder.CreateGround("ground", { height: 30, width: 30 }, scene);
        ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.3, friction: 0.7 }, scene);

        for (let i = -2; i <= 2; i++) {
            if (i == 0) continue;
            let g = MeshBuilder.CreateGround(`g${i}`, { height: 30, width: 30 }, scene);
            g.position = new Vector3(15 * (i % 2), 15, 15 * floor(i / 2));
            g.rotate(Vector3.Forward(), Math.PI / 2 * (i % 2));
            g.rotate(Vector3.Right(), -Math.PI / 2 * floor(i / 2));
            g.physicsImpostor = new PhysicsImpostor(g, PhysicsImpostor.BoxImpostor,
                { mass: 0, restitution: 0.3, friction: 0.7 }, scene);
        }
        var cubeMaterial: StandardMaterial = new StandardMaterial("cubeMaterial");
        cubeMaterial.diffuseTexture = new Texture(CubeTexture);
        const faceUV: Vector4[] = [];
        faceUV[0] = new Vector4(0.0, 0.0, 0.25, 0.5); //rear face
        faceUV[1] = new Vector4(0.5, 0.5, 0.75, 1.0); //front side
        faceUV[2] = new Vector4(0.5, 0.0, 0.75, 0.5); //right side 
        faceUV[3] = new Vector4(0.0, 0.5, 0.25, 1.0); //left side
        faceUV[4] = new Vector4(0.25, 0.5, 0.5, 1.0); //top side
        faceUV[5] = new Vector4(0.25, 0.0, 0.5, 0.5); //bottom face

        const cubes: Mesh[] = [];

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'I') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        let handler = (ev: any) => {
            let t: Mesh | undefined;
            while ((t = cubes.pop())) {
                scene.removeMesh(t);
            }

            for (let i = 0; i < 5; i++) {
                let b = MeshBuilder.CreateBox(`dice${i}`, 
                    { size: 3, faceUV: faceUV, wrap: true }, scene);
                cubes.push(b);
                b.material = cubeMaterial;
                b.position = camera.position.clone();
                b.rotate(Vector3.Up(), -camera.alpha);
                b.rotate(Vector3.Forward(), camera.beta + Math.PI / 2);

                b.movePOV(-10 + 10 * (i % 3), 0, -10 + 10 * (i / 3));
                b.rotate(Vector3.Up(), Math.random() * 2 * Math.PI);
                b.rotate(Vector3.Left(), Math.random() * 2 * Math.PI);
                b.rotate(Vector3.Forward(), Math.random() * 2 * Math.PI);

                b.physicsImpostor = new PhysicsImpostor(b, PhysicsImpostor.BoxImpostor, 
                    { mass: 10, restitution: 0.3, friction: 0.7 }, scene);
                b.physicsImpostor.applyImpulse(
                    new Vector3(-Math.cos(camera.alpha) * Math.sin(camera.beta), 
                    -Math.cos(camera.beta), 
                    -Math.sin(camera.alpha) * Math.sin(camera.beta)).scale(200), 
                    b.getAbsolutePosition());
            }
        };
        window.addEventListener('click', handler);
        window.addEventListener('touchstart', handler);

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();