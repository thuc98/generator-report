import { Run } from "file/paragraph";
import { ContinuationSeperator } from "./continuation-seperator";

export class ContinuationSeperatorRun extends Run {
    constructor() {
        super({});

        this.root.push(new ContinuationSeperator());
    }
}
