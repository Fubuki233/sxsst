export type Direction = 'forward' | 'back';

let _direction: Direction = 'forward';

export const transitionStore = {
  setDirection(d: Direction) {
    _direction = d;
  },
  getDirection(): Direction {
    return _direction;
  },
};
