import * as BABYLON from "babylonjs";
import { Color3, Vector3 } from "babylonjs";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createScene = function () {
  var scene = new BABYLON.Scene(engine);

  // Setup environment
  var camera = new BABYLON.ArcRotateCamera(
    "ArcRotateCamera",
    1,
    0.8,
    5,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);
  scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1);

  // Create a particle system
  var surfaceParticles = new BABYLON.ParticleSystem(
    "surfaceParticles",
    1600,
    scene
  );

  // Texture of each particle
  surfaceParticles.particleTexture = new BABYLON.Texture(
    "./assets/texture/particle.png",
    scene
  );
  const particleSystemPosition = new Vector3(0, 1, 0);

  // Create core sphere
  var coreSphere = BABYLON.MeshBuilder.CreateSphere(
    "coreSphere",
    { diameter: 1.3, segments: 16 },
    scene
  );
  coreSphere.position = particleSystemPosition;

  // Create core material
  var coreMat = new BABYLON.StandardMaterial("coreMat", scene);
  coreMat.diffuseColor = new Color3(0, 0, 0);

  // Assign core material to sphere
  coreSphere.material = coreMat;

  // Pre-warm
  surfaceParticles.preWarmStepOffset = 10;
  surfaceParticles.preWarmCycles = 100;

  // Initial rotation
  surfaceParticles.minInitialRotation = -2 * Math.PI;
  surfaceParticles.maxInitialRotation = 2 * Math.PI;

  // Where the sun particles come from
  var sunEmitter = new BABYLON.SphereParticleEmitter();
  sunEmitter.radius = 1;
  sunEmitter.radiusRange = 0; // emit only from shape surface

  // Assign particles to emitters
  surfaceParticles.emitter = coreSphere; // the starting object, the emitter
  surfaceParticles.particleEmitterType = sunEmitter;

  // Color gradient over time
  surfaceParticles.color1 = new BABYLON.Color4(0.66, 0.66, 1, 1);
  surfaceParticles.color2 = new BABYLON.Color4(0.37, 0.37, 1);

  // Size of each particle
  surfaceParticles.minSize = 0.01;
  surfaceParticles.maxSize = 0.3;

  // Life time of each particle (random between...
  surfaceParticles.minLifeTime = 1;
  surfaceParticles.maxLifeTime = 3;

  // Emission rate
  surfaceParticles.emitRate = 200;

  // Blend mode : BLENDMODE_ONEONE, BLENDMODE_STANDARD, or BLENDMODE_ADD
  surfaceParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

  // No billboard
  surfaceParticles.isBillboardBased = false;

  surfaceParticles.updateFunction = function (particles) {
    for (var index = 0; index < particles.length; index++) {
      var particle = particles[index];
      particle.age += this._scaledUpdateSpeed;

      if (particle.age >= particle.lifeTime) {
        // Recycle
        particles.splice(index, 1);
        this._stockParticles.push(particle);
        index--;
        continue;
      } else {
        // increase opacity as particle ages
        particle.colorStep.scaleToRef(
          this._scaledUpdateSpeed,
          this._scaledColorStep
        );
        particle.color.addInPlace(this._scaledColorStep);

        // calculate particle direction and speed
        particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;

        particle.direction.scaleToRef(
          this._scaledUpdateSpeed,
          this._scaledDirection
        );

        const origin = coreSphere.position;
        const distanceToOriginSquared = BABYLON.Vector3.DistanceSquared(
          origin,
          particle.position
        );

        let attractionPower = 0.005 / distanceToOriginSquared;
        const attractionForce = origin
          .subtract(particle.position)
          .multiplyByFloats(attractionPower, attractionPower, attractionPower);

        const swirlPower = Math.random() * 0.02;
        const swirlForce = Vector3.Cross(
          particle.position,
          Vector3.Up()
        ).multiplyByFloats(swirlPower, swirlPower, swirlPower);

        particle.position.addInPlace(swirlForce.add(attractionForce));
      }
    }
  };

  // Start the particle system
  surfaceParticles.start();

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
