import * as BABYLON from "babylonjs";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createScene = function () {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Teal());

  // This creates and positions a free camera (non-mesh)
  const camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 5, -10),
    scene
  );

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
  const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

  // Move the sphere upward 1/2 its height
  sphere.position.y = 1;

  // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
  const ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

  BABYLON.Effect.ShadersStore["customFragmentShader"] = `
    #ifdef GL_ES
        precision highp float;
    #endif

    // Samplers
    varying vec2 vUV;
    uniform sampler2D textureSampler;

    // Parameters
    uniform vec2 screenSize;
    uniform float threshold;

    void main(void)
    {
        vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
        vec4 baseColor = texture2D(textureSampler, vUV);

        if (baseColor.r < threshold) {
            gl_FragColor = baseColor;
        } else {
            gl_FragColor = vec4(0);
        }
    }
    `;

  const postProcess = new BABYLON.PostProcess(
    "My custom post process",
    "custom",
    ["screenSize", "threshold"],
    null,
    0.25,
    camera
  );
  postProcess.onApply = function (effect) {
    effect.setFloat2("screenSize", postProcess.width, postProcess.height);
    effect.setFloat("threshold", 0.3);
  };

  console.log("hello");

  return scene;
};

export const initBabylonCanvas = () => {
  const scene = createScene();
  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener("resize", () => {
    engine.resize();
  });
};
