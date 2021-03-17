export default class Permutor {
  public array: Array<Array<string>>;
  public positionToOptions: { [key: string]: string[] };

  constructor() {
    this.array = [];
    this.positionToOptions = {};
  }

  permute(array: any) {
    this.array = array;
    this.createPositionMap();
    return this.getPermutations();
  }

  getPermutations() {
    return this.array[0].reduce((acc: any, value, index) => {
      return acc.concat(this.getOptions(0, index));
    }, []);
  }

  getKey(x: number, y: number) {
    return `${x}|${y}`;
  }

  createPositionMap() {
    this.positionToOptions = {};

    for (let x = this.array.length - 1; x >= 0; x--) {
      for (let y = 0; y < this.array[x].length; y++) {
        const yValue = this.array[x][y];
        const nextX = x + 1;

        if (this.array[nextX] != null) {
          const options = this.array[nextX];

          const value = options
            .map((option, index) => {
              let permutations = this.getOptions(nextX, index);

              return permutations.map((option) => {
                return `${yValue}${option}`;
              });
            })
            .reduce((acc, value) => {
              return acc.concat(value);
            }, []);

          this.setOptions(x, y, value);
        } else {
          this.setOptions(x, y, [yValue]);
        }
      }
    }
  }

  getOptions(x: number, y: number) {
    return this.positionToOptions[this.getKey(x, y)];
  }

  setOptions(x: number, y: number, value: string[]) {
    this.positionToOptions[this.getKey(x, y)] = value;
  }
}
