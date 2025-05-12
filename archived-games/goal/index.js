export default class MircoGame {
  constructor({ input, assets, libs }) {
    this.input = input;
    this.physics = libs?.physics;
    this.world = null;
    this.SCALE = 30;
  }

  init(canvas) {
    // Create physics world with gravity
    this.world = new this.physics.World({
      gravity: new this.physics.Vec2(0, 9.8),
    });

    // Initial game state
    const model = {
      ball: {
        x: 50,
        y: 50,
        radius: 20,
        body: null,
      },
      goal: {
        x: canvas.width - 50,
        y: canvas.height - 50,
        radius: 30,
      },
      gameOver: false,
      won: false,
      message: "",
      startTime: performance.now(),
    };

    // Create ball with better movement properties
    const ballBody = this.world.createBody({
      type: "dynamic",
      position: new this.physics.Vec2(
        model.ball.x / this.SCALE,
        model.ball.y / this.SCALE
      ),
      linearDamping: 0.2, // Less friction with air
      angularDamping: 0.1, // Less rotation slowdown
    });

    ballBody.createFixture({
      shape: new this.physics.Circle(model.ball.radius / this.SCALE),
      density: 0.5, // Lighter ball
      friction: 0.2, // Less friction
      restitution: 0.6, // More bounce
    });

    // Create ground
    this.createWall(canvas.width / 2, canvas.height, canvas.width, 20);

    model.ball.body = ballBody;
    return model;
  }

  createWall(x, y, width, height) {
    const wall = this.world.createBody({
      type: "static",
      position: new this.physics.Vec2(x / this.SCALE, y / this.SCALE),
    });

    wall.createFixture({
      shape: new this.physics.Box(
        width / (2 * this.SCALE),
        height / (2 * this.SCALE)
      ),
      friction: 0.3,
    });
  }

  update(s, dt) {
    if (s.gameOver) return;

    const force = 3;
    const ball = s.ball.body;

    // Simple left/right controls
    if (this.input.pressed("ArrowLeft")) {
      ball.applyForceToCenter(new this.physics.Vec2(-force, 0));
    }
    if (this.input.pressed("ArrowRight")) {
      ball.applyForceToCenter(new this.physics.Vec2(force, 0));
    }

    // Update physics
    this.world.step(dt / 1000);

    // Update ball position
    const position = ball.getPosition();
    s.ball.x = position.x * this.SCALE;
    s.ball.y = position.y * this.SCALE;

    // Check if ball reached goal
    const distToGoal = Math.hypot(s.ball.x - s.goal.x, s.ball.y - s.goal.y);

    if (distToGoal < s.goal.radius + s.ball.radius) {
      s.gameOver = true;
      s.won = true;
      s.message = "Winner!";
    }

    // Time limit
    if (performance.now() - s.startTime > 5000) {
      s.gameOver = true;
      s.won = false;
      s.message = "Time's up!";
    }
  }

  draw(s, p5) {
    p5.background(220);

    // Draw goal
    p5.fill(0, 255, 0, 100);
    p5.circle(s.goal.x, s.goal.y, s.goal.radius * 2);

    // Draw ball
    p5.fill(255, 0, 0);
    p5.circle(s.ball.x, s.ball.y, s.ball.radius * 2);

    // Draw timer
    const timeLeft = Math.max(0, 5 - (performance.now() - s.startTime) / 1000);
    p5.textSize(24);
    p5.fill(0);
    p5.text(`Time: ${timeLeft.toFixed(1)}s`, 10, 30);

    // Draw game over message
    if (s.gameOver) {
      p5.textSize(48);
      p5.textAlign(p5.CENTER);
      p5.fill(s.won ? [0, 255, 0] : [255, 0, 0]);
      p5.text(s.message, p5.width / 2, p5.height / 2);
    }
  }

  end(s) {
    if (s.ball.body) {
      this.world.destroyBody(s.ball.body);
    }
    this.world = null;
    return s.won;
  }
}
