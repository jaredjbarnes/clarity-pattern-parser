import Pattern from "../Pattern";
export default abstract class CompositePattern extends Pattern {
    constructor(type: string, name: string, children?: Pattern[]);
}
