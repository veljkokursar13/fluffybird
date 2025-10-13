import { Bird } from "@src/engine/entities/bird";
type collisionType = 'bird' | 'pipe' | 'ground' | 'sky';

type Rect = { x: number; y: number; width: number; height: number };

const intersects = (a: Rect, b: Rect): boolean =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

export function applyBirdPhysics(bird: Bird, gravity: number, dt: number) {
    bird.vel.y += gravity * dt;
    bird.pos.y += bird.vel.y * dt;
}

export function movePipes() { }
export function checkCollisions(bird: Bird, pipes: Rect[], ground: number, sky: number): collisionType | undefined {
    const birdRect: Rect = {
        x: bird.pos.x - bird.r,
        y: bird.pos.y - bird.r,
        width: bird.r * 2,
        height: bird.r * 2,
    };
    // pipes
    for (const pipe of pipes) {
        if (intersects(birdRect, pipe)) return 'pipe';
    }
    // ground
    if (bird.pos.y + bird.r > ground) return 'ground';
    // sky
    if (bird.pos.y - bird.r < sky) return 'sky';
    return undefined;
}
