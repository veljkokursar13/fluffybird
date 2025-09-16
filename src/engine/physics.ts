import * as config from './settings';

interface Bird {
    velocity: { x: number; y: number };
    position: { x: number; y: number };
}

interface ApplyGravityProps {
    bird: Bird;
    deltaTime: number;
}

export default function ApplyGravity(props: ApplyGravityProps): void {
    const { bird, deltaTime } = props;
    
    bird.velocity.y += config.GRAVITY * deltaTime;
    bird.position.y += bird.velocity.y * deltaTime;

    // Clamp the bird's fall speed
    if (bird.velocity.y > config.MAX_FALL_SPEED) {
        bird.velocity.y = config.MAX_FALL_SPEED;
    }
}