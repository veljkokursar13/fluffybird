import { Bird } from "./types";
import { PipeRects } from "./types";
type collisionType = 'bird' | 'pipe' | 'ground';

type wingPosition = "up"|"down";// All physics together - pure functions
export function applyBirdPhysics(bird: Bird, gravity: number, dt: number) {
    bird.vel.y += gravity * dt;
    bird.pos.y += bird.vel.y * dt;
}

export function movePipes() { }
export function checkCollisions(bird: Bird, pipes: PipeRects[], ground: number, sky: number) {
    //check if bird is colliding with any pipe
    for (const pipe of pipes) {
        if (bird.pos.x + bird.r > pipe.body.x && bird.pos.x - bird.r < pipe.body.x + pipe.body.width && bird.pos.y + bird.r > pipe.body.y && bird.pos.y - bird.r < pipe.body.y + pipe.body.height) {
            return 'pipe';
        }
    }
    //check if bird is colliding with ground
    if (bird.pos.y + bird.r > ground) {
        return 'ground';
    }
    //check if bird is colliding with sky
    if (bird.pos.y - bird.r < sky) {
        return 'sky';
    }
 }
