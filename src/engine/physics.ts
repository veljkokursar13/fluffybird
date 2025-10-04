import { Bird } from "./types";
import { Pipe } from "./types";
type collisionType = 'bird' | 'pipe' | 'ground';

type wingPosition = "up"|"down";// All physics together - pure functions
export function applyBirdPhysics(bird: Bird, gravity: number, dt: number) {
    bird.vel.y += gravity * dt;
    bird.pos.y += bird.vel.y * dt;
}

export function movePipes() { }
export function checkCollisions(bird: Bird, pipes: Pipe[], ground: number, sky: number) {
    //check if bird is colliding with any pipe
    for (const pipe of pipes) {
        if (bird.pos.x + bird.r > pipe.pos.x && bird.pos.x - bird.r < pipe.pos.x + pipe.size.width && bird.pos.y + bird.r > pipe.pos.y && bird.pos.y - bird.r < pipe.pos.y + pipe.size.height) {
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
function wingFlap(bird: Bird, onTap: (wingPosition: wingPosition) => void, tap: boolean) {
       //on tap make bird flap its wings by changing the wing images
       useEffect(() => {
        onTap((wingPosition: wingPosition) => {
            bird.wingPosition = wingPosition;
            if(tap===true){
                onTap('up');
            }else{
                onTap('down');
            }
        });
       }, [bird.wingPosition]);
}